import toast from 'react-hot-toast';

// Toast utility functions
export const showSuccessToast = (message: string, options?: any) => {
  return toast.success(message, {
    duration: 4000,
    style: {
      background: '#10b981',
      color: '#fff',
      fontSize: '14px',
      fontWeight: '600',
      padding: '12px 16px',
      borderRadius: '8px'
    },
    ...options
  });
};

export const showErrorToast = (message: string, options?: any) => {
  return toast.error(message, {
    duration: 4000,
    style: {
      background: '#ef4444',
      color: '#fff',
      fontSize: '14px',
      fontWeight: '600',
      padding: '12px 16px',
      borderRadius: '8px'
    },
    ...options
  });
};

export const showWarningToast = (message: string, options?: any) => {
  return toast(message, { 
    icon: '⚠️',
    duration: 4000,
    style: {
      background: '#f59e0b',
      color: '#fff',
      fontSize: '14px',
      fontWeight: '600',
      padding: '12px 16px',
      borderRadius: '8px'
    },
    ...options 
  });
};

export const showInfoToast = (message: string, options?: any) => {
  return toast(message, { 
    icon: 'ℹ️',
    duration: 4000,
    style: {
      background: '#3b82f6',
      color: '#fff',
      fontSize: '14px',
      fontWeight: '600',
      padding: '12px 16px',
      borderRadius: '8px'
    },
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
    loading: {
      style: {
        background: '#3b82f6',
        color: '#fff',
        fontSize: '14px',
        fontWeight: '600',
        padding: '12px 16px',
        borderRadius: '8px'
      }
    },
    success: {
      style: {
        background: '#10b981',
        color: '#fff',
        fontSize: '14px',
        fontWeight: '600',
        padding: '12px 16px',
        borderRadius: '8px'
      }
    },
    error: {
      style: {
        background: '#ef4444',
        color: '#fff',
        fontSize: '14px',
        fontWeight: '600',
        padding: '12px 16px',
        borderRadius: '8px'
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
