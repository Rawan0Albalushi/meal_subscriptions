import { useState } from 'react';

export const usePopupMessage = () => {
    const [popup, setPopup] = useState({
        show: false,
        title: '',
        message: '',
        type: 'info',
        confirmText: null,
        cancelText: null,
        onConfirm: null,
        onCancel: null
    });

    const showPopup = (title, message, type = 'info', options = {}) => {
        setPopup({
            show: true,
            title,
            message,
            type,
            confirmText: options.confirmText || null,
            cancelText: options.cancelText || null,
            onConfirm: options.onConfirm || null,
            onCancel: options.onCancel || null
        });
    };

    const showConfirm = (title, message, onConfirm, options = {}) => {
        setPopup({
            show: true,
            title,
            message,
            type: 'confirm',
            confirmText: options.confirmText || null,
            cancelText: options.cancelText || null,
            onConfirm: () => {
                onConfirm();
                hidePopup();
            },
            onCancel: () => {
                options.onCancel && options.onCancel();
                hidePopup();
            }
        });
    };

    const showSuccess = (message, title = null) => {
        showPopup(
            title || 'Success',
            message,
            'success'
        );
    };

    const showError = (message, title = null) => {
        showPopup(
            title || 'Error',
            message,
            'error'
        );
    };

    const showWarning = (message, title = null) => {
        showPopup(
            title || 'Warning',
            message,
            'warning'
        );
    };

    const showInfo = (message, title = null) => {
        showPopup(
            title || 'Information',
            message,
            'info'
        );
    };

    const hidePopup = () => {
        setPopup(prev => ({ ...prev, show: false }));
    };

    return {
        popup,
        showPopup,
        showConfirm,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        hidePopup
    };
};
