import { Modal, Box, Button } from '@mui/material';
import React, { useRef } from 'react';

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    width: {
        xs: '90%',
        sm: '70%',
        md: '50%',
        lg: '40%',
        xl: '30%',
    },
    maxHeight: '90vh',
    overflowY: 'auto',
};

const CustomModal = ({ open, handleClose, children, style }: any) => {

    return (
        <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
            <Box sx={{ ...modalStyle, ...style }}>
                {children}
            </Box>
        </Modal>
    );
};

export default CustomModal;