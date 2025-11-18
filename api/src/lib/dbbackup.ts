import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { errorLog, infoLog } from '../helper/logger';
import archiver from 'archiver';

const execAsync = promisify(exec);

interface BackupOptions {
    format?: 'plain' | 'custom' | 'directory' | 'tar';
}

/**
 * Creates a backup of PostgreSQL database and stores it in db_backup folder
 * @param options - Backup configuration options
 * @returns Promise<string> - Path to the created backup file
 */
export async function createDatabaseBackup(options: BackupOptions = {}): Promise<string> {
    try {
        // Get database configuration from environment variables
        const host = process.env.DB_Host;
        const port = 5432;
        const username = process.env.DB_UserName;
        const password = process.env.DB_Password;
        const database = process.env.DB_Name;

        if (!username || !password || !database) {
            throw new Error('Database credentials are required. Please provide username, password, and database name.');
        }

        // ── 1. create root folders if needed ───────────────────────────────
        const rootDir = process.cwd();
        const publicDir = path.join(rootDir, 'public');
        const backupDir = path.join(rootDir, 'public_backup');   // <─ final backup folder

        for (const dir of [publicDir, backupDir]) {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                infoLog(`Created folder: ${dir}`);
            }
        }

        // ── 2. build file paths ────────────────────────────────────────────
        const dateStamp = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
        const sqlFileName = `db_backup_${dateStamp}.sql`;
        const sqlFilePath = path.join(backupDir, sqlFileName);

        // ── 3. run pg_dump  (plain SQL) ────────────────────────────────────
        const dumpCmd = `pg_dump  -h ${host} -p ${port} -U ${username} -d ${database} --format=plain --inserts -f "${sqlFilePath}"`;

        infoLog(`Starting pg_dump → ${sqlFilePath}`);
        await execAsync(dumpCmd, { env: { ...process.env, PGPASSWORD: password } });

        if (!fs.existsSync(sqlFilePath)) throw new Error('pg_dump failed.');

        infoLog('Database backup completed!');

        // ── 4. create backup.zip with db backup and public folder ──────────
        const backupZipPath = await zipPublicFolder({ publicDir, backupDir, sqlFilePath });

        // ── 5. delete the backup folder ────────────────────────────────────
        fs.rmSync(backupDir, { recursive: true, force: true });

        return backupZipPath;
    } catch (err) {
        errorLog('Database backup failed:', err);
        throw err;
    }
}


async function zipPublicFolder({
    publicDir,
    backupDir,
    sqlFilePath
}: {
    publicDir: string;
    backupDir: string;
    sqlFilePath: string;
}): Promise<string> {
    const rootDir = process.cwd();
    const zipPath = path.join(rootDir, 'backup.zip');

    await new Promise<void>((resolve, reject) => {
        const output = fs.createWriteStream(zipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', resolve);
        archive.on('error', reject);

        archive.pipe(output);

        // Add the database backup SQL file
        archive.file(sqlFilePath, { name: 'db_backup.sql' });

        // Add the public folder contents (excluding any existing *.zip and db_backup folder)
        archive.directory(publicDir, 'public', (entry) => {
            const skipZip = entry.name.endsWith('.zip');
            const skipDbBack = entry.name.startsWith('db_backup/');
            return skipZip || skipDbBack ? false : entry;
        });

        archive.finalize();
    });

    infoLog(`Backup ZIP created → ${zipPath}`);
    return zipPath;
}

