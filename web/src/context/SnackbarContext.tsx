// SnackbarContext.js
import React, { createContext, useState, useContext } from 'react';
import { Snackbar, Alert } from '@mui/material';

const SnackbarContext = createContext<any>(undefined);

export const useSnackbar = () => useContext(SnackbarContext);

export const SnackbarProvider = ({ children }: any) => {
    const [snackbarOpen, setSnackbarOpen] = useState<any>(false);
    const [alertMessage, setAlertMessage] = useState<any>('');
    const [alertSeverity, setAlertSeverity] = useState<any>('success'); // 'error', 'info', etc.

    const showSnackbar = (message: any, severity = 'success') => {
        setAlertMessage(message);
        setAlertSeverity(severity);
        setSnackbarOpen(true);
    };

    const handleClose = () => {
        setSnackbarOpen(false);
    };

    return (
        <SnackbarContext.Provider value={showSnackbar}>
            {children}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleClose} severity={alertSeverity} variant="filled" sx={{ width: '100%' }}>
                    {alertMessage}
                </Alert>
            </Snackbar>
        </SnackbarContext.Provider>
    );
};
