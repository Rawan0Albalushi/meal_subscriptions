import { usePopupMessage } from '../hooks/usePopupMessage';

// Global popup instance
let globalPopupInstance = null;

// Initialize global popup instance
export const initializeGlobalPopup = (popupInstance) => {
    globalPopupInstance = popupInstance;
};

// Beautiful alert replacement
export const showAlert = (message, title = null, type = 'info') => {
    if (globalPopupInstance) {
        const { showPopup } = globalPopupInstance;
        showPopup(
            title || (type === 'success' ? 'تم بنجاح' : 
                    type === 'error' ? 'خطأ' : 
                    type === 'warning' ? 'تحذير' : 'معلومات'),
            message,
            type
        );
    } else {
        // Fallback to browser alert if popup not initialized
        alert(message);
    }
};

// Beautiful confirm replacement
export const showConfirm = (message, title = 'تأكيد', onConfirm, onCancel = null) => {
    if (globalPopupInstance) {
        const { showConfirm: showConfirmPopup } = globalPopupInstance;
        showConfirmPopup(
            title,
            message,
            onConfirm,
            {
                confirmText: 'تأكيد',
                cancelText: 'إلغاء',
                onCancel: onCancel
            }
        );
    } else {
        // Fallback to browser confirm if popup not initialized
        if (confirm(message)) {
            onConfirm();
        } else if (onCancel) {
            onCancel();
        }
    }
};

// Convenience methods
export const showSuccess = (message, title = 'تم بنجاح') => {
    showAlert(message, title, 'success');
};

export const showError = (message, title = 'خطأ') => {
    showAlert(message, title, 'error');
};

export const showWarning = (message, title = 'تحذير') => {
    showAlert(message, title, 'warning');
};

export const showInfo = (message, title = 'معلومات') => {
    showAlert(message, title, 'info');
};

// Export success message for common operations
export const showExportSuccess = (count, itemType = 'طلب') => {
    showSuccess(
        `تم تصدير ${count} ${itemType} بنجاح`,
        'تم التصدير بنجاح'
    );
};

export const showDeleteConfirm = (itemName, onConfirm, onCancel = null) => {
    showConfirm(
        `هل أنت متأكد من حذف ${itemName}؟`,
        'تأكيد الحذف',
        onConfirm,
        onCancel
    );
};

export const showSaveSuccess = (itemType = 'العنصر') => {
    showSuccess(
        `تم حفظ ${itemType} بنجاح`,
        'تم الحفظ بنجاح'
    );
};

export const showUpdateSuccess = (itemType = 'العنصر') => {
    showSuccess(
        `تم تحديث ${itemType} بنجاح`,
        'تم التحديث بنجاح'
    );
};

export const showDeleteSuccess = (itemType = 'العنصر') => {
    showSuccess(
        `تم حذف ${itemType} بنجاح`,
        'تم الحذف بنجاح'
    );
};

export const showNotFound = (itemType = 'العنصر') => {
    showError(
        `لم يتم العثور على ${itemType}`,
        'غير موجود'
    );
};

export const showOperationFailed = (operation = 'العملية') => {
    showError(
        `فشل في ${operation}`,
        'فشل العملية'
    );
};
