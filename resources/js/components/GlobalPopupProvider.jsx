import React from 'react';
import { usePopupMessage } from '../hooks/usePopupMessage';
import PopupMessage from './PopupMessage';
import { initializeGlobalPopup } from '../utils/popupUtils';

const GlobalPopupProvider = ({ children }) => {
    const popupInstance = usePopupMessage();

    // Initialize global popup instance
    React.useEffect(() => {
        initializeGlobalPopup(popupInstance);
    }, [popupInstance]);

    return (
        <>
            {children}
            <PopupMessage
                show={popupInstance.popup.show}
                onClose={popupInstance.hidePopup}
                title={popupInstance.popup.title}
                message={popupInstance.popup.message}
                type={popupInstance.popup.type}
                confirmText={popupInstance.popup.confirmText}
                cancelText={popupInstance.popup.cancelText}
                onConfirm={popupInstance.popup.onConfirm}
                onCancel={popupInstance.popup.onCancel}
            />
        </>
    );
};

export default GlobalPopupProvider;
