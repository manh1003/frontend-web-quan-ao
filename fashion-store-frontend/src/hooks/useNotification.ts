import { useState, useCallback } from "react";
import type { ToastType } from "@/components/Toast";

interface NotificationState {
  showToast: boolean;
  toastMessage: string;
  toastType: ToastType;
  showConfirm: boolean;
  confirmTitle: string;
  confirmMessage: string;
  confirmAction: (() => void) | null;
}

export function useNotification() {
  const [state, setState] = useState<NotificationState>({
    showToast: false,
    toastMessage: "",
    toastType: "success",
    showConfirm: false,
    confirmTitle: "",
    confirmMessage: "",
    confirmAction: null,
  });

  const showToast = useCallback(
    (message: string, type: ToastType = "success") => {
      setState((prev) => ({
        ...prev,
        showToast: true,
        toastMessage: message,
        toastType: type,
      }));
    },
    []
  );

  const hideToast = useCallback(() => {
    setState((prev) => ({ ...prev, showToast: false }));
  }, []);

  const showConfirm = useCallback(
    (title: string, message: string, onConfirm: () => void) => {
      setState((prev) => ({
        ...prev,
        showConfirm: true,
        confirmTitle: title,
        confirmMessage: message,
        confirmAction: onConfirm,
      }));
    },
    []
  );

  const hideConfirm = useCallback(() => {
    setState((prev) => ({
      ...prev,
      showConfirm: false,
      confirmAction: null,
    }));
  }, []);

  const handleConfirm = useCallback(() => {
    if (state.confirmAction) {
      state.confirmAction();
    }
    hideConfirm();
  }, [state.confirmAction, hideConfirm]);

  return {
    // Toast
    showToast,
    hideToast,
    toastState: {
      show: state.showToast,
      message: state.toastMessage,
      type: state.toastType,
    },
    // Confirm
    showConfirm,
    hideConfirm,
    handleConfirm,
    confirmState: {
      show: state.showConfirm,
      title: state.confirmTitle,
      message: state.confirmMessage,
    },
  };
}