// ToastContext.js
import React, { createContext, useContext, useState } from 'react';
import { CToast, CToastBody, CToastClose, CToaster } from '@coreui/react';

const ToastContext = createContext(null);

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = (message, type = 'success') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prevToasts) => [...prevToasts, { id, message, type }]);
    };

    const removeToast = (id) => {
        setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    };

    return (
        <ToastContext.Provider value={addToast}>
            {children}
            <CToaster position="top-end"
                style={{
                    position: "fixed",
                    top: "1rem",
                    right: "1rem",
                    zIndex: "9999999",
                }}
            >
                {toasts.map((toast) => (
                    <CToast
                        key={toast.id}
                        delay={2500}
                        autohide={true}
                        visible={true}
                        color={toast.type}
                        className="align-items-center"
                    >
                        <div className="d-flex">
                            <CToastBody className='text-white'>{toast.message}</CToastBody>
                            <CToastClose className="me-2 m-auto" onClick={() => removeToast(toast.id)} />
                        </div>
                    </CToast>
                ))}
            </CToaster>
        </ToastContext.Provider>
    );
};
