import axios from "axios";
import apiHelper, { API, APIURL } from "../api-helper";

const commonSerive = () => {
    const { api } = apiHelper();

    const fetchAllcount = async () => {
        const url = `${APIURL}common/counts`;
        const method = "get";

        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const response = await api({ method, url, headers });
            if (response?.status == 200) { return { success: true, data: response?.data?.data } }
            return { success: false, data: response?.data?.data };
        } catch (error) {
            console.error("Fetch all count error:", error);
            return { success: false };
        }
    };

    const backUpDatabase = async () => {
        const url = `${APIURL}common/db-dump`;
        const method = "put";

        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const response = await api({ method, url, headers, body: { start: true } });
            if (response?.status == 200) {
                return await downloadBackup();
                // return { success: true, message: response?.data?.message }
            }
            return { success: false };
        } catch (error) {
            console.error("Fetch all count error:", error);
            return { success: false };
        }
    };

    const downloadBackup = async () => {
        try {
            const token = localStorage.getItem('token');

            const response = await axios({
                method: 'GET',
                url: `${API}download/backup.zip`,
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                responseType: 'blob',
            });

            // Create a blob URL from the response data
            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);

            // Create a temporary link element
            const link = document.createElement('a');
            link.href = url;

            // The server will set the filename to backup_YYYY-MM-DD.zip
            // You can also extract it from response headers if needed
            const contentDisposition = response.headers['content-disposition'];
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                if (filenameMatch) {
                    link.download = filenameMatch[1];
                }
            } else {
                link.download = 'backup.zip'; // fallback
            }

            // Trigger the download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up the blob URL
            window.URL.revokeObjectURL(url);
            return { success: true, message: 'Backup downloaded successfully!' }
        }
        catch (error) {
            console.error("Error downloadBackup :", error);
            return { success: false, message: 'Backup saved successfully, but an error occurred while downloading the ZIP file.' };
        }
    };

    return { fetchAllcount, backUpDatabase };
}

export default commonSerive;
