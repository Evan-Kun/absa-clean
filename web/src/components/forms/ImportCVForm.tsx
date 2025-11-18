import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Typography,
    Link,
    Button,
    TextareaAutosize,
    IconButton,
    Tooltip,
    Box,
    DialogActions,
    styled,
} from '@mui/material';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import userProfileServices from '../../services/api-services/user-profile-api.service';
import { useSnackbar } from '../../context/SnackbarContext';
import { useUser } from '../../context/UserContext';

const ScrollablePromptBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    mb: 2,
    border: `1px solid ${theme.palette.divider}`, // Use theme's divider color
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(2),
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100],
    maxHeight: '200px', // Set a maximum height
    overflowY: 'auto', // Enable vertical scrolling
}));

const CopyIconButton = styled(IconButton)(({ theme }) => ({
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 1, // Ensure it's above the content
    background: 'white'
}));

function ImportCVForm({ profile_Details, settings, handleCloseModal }: any) {
    const promptText = settings?.prompt ?? `Extract all the information from my CV and format it as a JSON string with the following structure. output json: {"basic":{"firstName":"","lastName":"","slogan":"","jobTitle":"","bio":"","linkdin_url":"","x_url":"","google_scholar":""},"workExperience":[{"jobTitle":"","companyName":"","joiningMonth":"","joiningYear":"","isCurrentlyWorking":true,"toMonth":"","toYear":"","description":""}],"projecthighlights":[{"title":"","link":"","description":""}],"education":[{"degreeName":"","instituteName":"","location":"","startYear":"","endYear":""},],"skills":[{"skillName":"","level":"Expert/Strong/Competent"}],"certificates":[{"title":"", "url":"","issuedYear":"","expiredOn":""}]}\n Ensure the output is a valid JSON string without any extra text or explanations.`;

    const { updateProfileBasicDetails } = userProfileServices();
    const { getAllSkills } = useUser();
    const showSnackbar = useSnackbar();
    const [copiedPrompt, setCopiedPrompt] = useState(false);
    const [pastedJson, setPastedJson] = useState('');
    const [confirmation, setConfirmation] = useState(false);

    const handleCopyPrompt = () => {
        navigator.clipboard.writeText(promptText);
        setCopiedPrompt(true);
        setTimeout(() => setCopiedPrompt(false), 1500);
    };

    const handlePasteChange = (event: any) => {
        const rawJson = event.target.value;
        setPastedJson(rawJson);
    };

    const removeEmptyStrings = (obj: any): any => {
        if (Array.isArray(obj)) {
            return obj.map(item => removeEmptyStrings(item)).filter(item => item !== null && item !== undefined);
        } else if (typeof obj === 'object' && obj !== null) {
            return Object.keys(obj).reduce((acc: any, key) => {
                const value = removeEmptyStrings(obj[key]);
                if (value !== "" && value !== null && value !== undefined && !(typeof value === 'object' && Object.keys(value).length === 0) && !(Array.isArray(value) && value.length === 0)) {
                    acc[key] = value;
                }
                return acc;
            }, {});
        }
        return obj;
    };

    const handleImport = async () => {
        try {
            setConfirmation(false);
            const parsedJson = JSON.parse(pastedJson);
            const validatedJson = removeEmptyStrings(parsedJson);
            if (validatedJson) {
                const payload = {
                    json: validatedJson, // json data
                    userId: profile_Details?.userId,  //profile ID
                    experienceTags_id: profile_Details?.experienceTags?.id // for update experience skill tag `_id`
                }
                const resUpdate = await updateProfileBasicDetails(payload, 'jsonData');
                if (resUpdate?.success) {
                    showSnackbar(resUpdate?.message, 'success');
                    getAllSkills();
                    handleCloseModal && handleCloseModal('basic-info', resUpdate?.data?.data);
                    handleCloseModal && handleCloseModal('work-experience');
                } else {
                    showSnackbar(resUpdate?.data?.message || 'An error occurred', 'error');
                }
            } else {
                showSnackbar('Invalid JSON format', 'error');
            }
        } catch (error) {
            console.error("Error parsing JSON:", error);
            showSnackbar('Invalid JSON format', 'error');
        }
    };

    const handleClose = (event: any, reason: any = null) => {
        // Only close if the reason is NOT backdropClick or escapeKeyDown
        if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
            handleCloseModal();
        }
    };

    return (
        <>
            <Dialog open={true} onClose={handleClose} maxWidth="lg" fullWidth>
                <DialogTitle>Import Data from CV</DialogTitle>
                <DialogContent dividers>
                    {/* Section 1: Message */}
                    <Typography variant="body1" gutterBottom>
                        Here's how to import from your CV: Open{' '}
                        <Link href="https://chat.openai.com/" target="_blank" rel="noopener noreferrer">
                            Chat GPT
                        </Link>
                        , upload your CV, then copy and paste the following prompt to instruct chatGPT to extract your content into a JSON string.
                    </Typography>

                    {/* Section 2: Prompt with Copy Button */}
                    <Box sx={{ position: "relative" }}>
                        <CopyIconButton aria-label="copy" onClick={handleCopyPrompt} size="small">
                            <Tooltip title={copiedPrompt ? 'Copied!' : 'Copy prompt'} placement="left">
                                <FileCopyIcon color={copiedPrompt ? 'success' : 'action'} />
                            </Tooltip>
                        </CopyIconButton>
                        <ScrollablePromptBox>
                            <Typography variant="body2" sx={{ flexGrow: 1, fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                                {promptText}
                            </Typography>
                        </ScrollablePromptBox>
                    </Box>

                    {/* Section 3: Textarea for Pasting JSON */}
                    <Typography variant="subtitle1" gutterBottom mt={2}>
                        Paste the JSON string here:
                    </Typography>

                    <TextareaAutosize
                        minRows={5}
                        style={{ width: '100%', padding: 8, fontFamily: 'monospace' }}
                        placeholder="Paste JSON output from ChatGPT"
                        value={pastedJson}
                        onChange={handlePasteChange}
                    />
                </DialogContent>

                <DialogActions>
                    <Button variant='outlined' onClick={handleClose}>Cancel</Button>
                    <Button variant='contained' onClick={() => setConfirmation(true)} color="primary">
                        Import
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={confirmation} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>Confirmation</DialogTitle>
                <DialogContent dividers>
                    <Typography variant="body1" gutterBottom>
                        Please ensure the json string contains only data you want to enter. Skills, Work Experience, Projects Highlight and Education data will be appended to (not replace) existing data, but all other fields (e.g. name and title) will be replaced if they exist in the provided JSON string.
                    </Typography>
                </DialogContent>

                <DialogActions>
                    <Button variant='outlined' onClick={() => setConfirmation(false)}>Cancel</Button>
                    <Button variant='contained' onClick={handleImport} color="primary">Confirm</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default ImportCVForm;