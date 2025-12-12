import toast from 'react-hot-toast';

// Toast configuration constants
const TOAST_CONFIG = {
  SUCCESS: {
    duration: 4000,
    style: {
      background: '#10b981',
      color: '#fff',
      fontSize: '16px',
      fontWeight: '600',
      padding: '16px',
      borderRadius: '8px'
    }
  },
  ERROR: {
    duration: 4000,
    style: {
      background: '#ef4444',
      color: '#fff',
      fontSize: '16px',
      fontWeight: '600',
      padding: '16px',
      borderRadius: '8px'
    }
  },
  WARNING: {
    duration: 4000,
    style: {
      background: '#f59e0b',
      color: '#fff',
      fontSize: '16px',
      fontWeight: '600',
      padding: '16px',
      borderRadius: '8px'
    }
  },
  INFO: {
    duration: 4000,
    style: {
      background: '#3b82f6',
      color: '#fff',
      fontSize: '16px',
      fontWeight: '600',
      padding: '16px',
      borderRadius: '8px'
    }
  }
};

// Toast utility functions
export const showSuccessToast = (message: string, options?: any) => {
  toast.success(message, { ...TOAST_CONFIG.SUCCESS, ...options });
};

export const showErrorToast = (message: string, options?: any) => {
  toast.error(message, { ...TOAST_CONFIG.ERROR, ...options });
};

export const showWarningToast = (message: string, options?: any) => {
  toast(message, { 
    icon: '⚠️',
    ...TOAST_CONFIG.WARNING, 
    ...options 
  });
};

export const showInfoToast = (message: string, options?: any) => {
  toast(message, { 
    icon: 'ℹ️',
    ...TOAST_CONFIG.INFO, 
    ...options 
  });
};

// Validation error toast with icons
export const showValidationErrors = (errors: { [key: string]: string }) => {
  const errorIcons: { [key: string]: string } = {
    name: '📝',
    email: '📧',
    password: '🔒',
    phoneNumber: '📱',
    confirmPassword: '🔐',
    username: '👤',
    address: '🏠',
    age: '📅',
    phone: '📞'
  };

  Object.entries(errors).forEach(([field, message]) => {
    const icon = errorIcons[field] || '❌';
    showErrorToast(`${icon} ${message}`);
  });
};

// Loading toast with promise
export const showLoadingToast = (promise: Promise<any>, messages: {
  loading: string;
  success: string;
  error: string;
}) => {
  return toast.promise(promise, messages, {
    style: {
      fontSize: '16px',
      fontWeight: '600'
    },
    success: TOAST_CONFIG.SUCCESS,
    error: TOAST_CONFIG.ERROR,
    loading: {
      style: {
        background: '#3b82f6',
        color: '#fff',
        fontSize: '16px',
        fontWeight: '600'
      }
    }
  });
};

export default {
  success: showSuccessToast,
  error: showErrorToast,
  warning: showWarningToast,
  info: showInfoToast,
  validationErrors: showValidationErrors,
  loading: showLoadingToast
};
