import toast from "react-hot-toast";

const showSuccess = (message: string = "Success") => {
  toast(message, {
    duration: 2000,
    position: "bottom-right",
    style: {
      background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      color: "#ffffff",
      fontWeight: "500",
      padding: "16px 24px",
      borderRadius: "12px",
      boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
    },
    className: "",

    ariaProps: {
      role: "status",
      "aria-live": "polite",
    },
    removeDelay: 1000,
    toasterId: "default",
  });
};

const showError = (message: string = "Error") => {
  toast(message, {
    duration: 2000,
    position: "bottom-right",
    style: {
      background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
      color: "#ffffff",
      fontWeight: "500",
      padding: "16px 24px",
      borderRadius: "12px",
      boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
    },
    className: "",

    ariaProps: {
      role: "status",
      "aria-live": "polite",
    },
    removeDelay: 1000,
    toasterId: "default",
  });
};

export { showError, showSuccess };
