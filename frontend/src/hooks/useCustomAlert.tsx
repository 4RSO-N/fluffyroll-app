import { useState, useCallback } from 'react';

interface AlertConfig {
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  buttons?: Array<{
    text: string;
    onPress?: () => void;
    style?: 'default' | 'destructive' | 'cancel';
  }>;
  icon?: string;
}

export const useCustomAlert = () => {
  const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const showAlert = useCallback((config: AlertConfig) => {
    setAlertConfig(config);
    setIsVisible(true);
  }, []);

  const hideAlert = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => setAlertConfig(null), 200); // Delay to allow exit animation
  }, []);

  const showSuccess = useCallback((title: string, message: string, onPress?: () => void) => {
    showAlert({
      title,
      message,
      type: 'success',
      buttons: [{ text: 'Great!', onPress }],
    });
  }, [showAlert]);

  const showError = useCallback((title: string, message: string, onPress?: () => void) => {
    showAlert({
      title,
      message,
      type: 'error',
      buttons: [{ text: 'OK', onPress }],
    });
  }, [showAlert]);

  const showWarning = useCallback((title: string, message: string, onPress?: () => void) => {
    showAlert({
      title,
      message,
      type: 'warning',
      buttons: [{ text: 'OK', onPress }],
    });
  }, [showAlert]);

  const showInfo = useCallback((title: string, message: string, onPress?: () => void) => {
    showAlert({
      title,
      message,
      type: 'info',
      buttons: [{ text: 'OK', onPress }],
    });
  }, [showAlert]);

  const showConfirmation = useCallback((
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    confirmText = 'Confirm',
    cancelText = 'Cancel'
  ) => {
    showAlert({
      title,
      message,
      type: 'info',
      buttons: [
        { text: cancelText, style: 'default', onPress: onCancel },
        { text: confirmText, style: 'cancel', onPress: onConfirm },
      ],
    });
  }, [showAlert]);

  return {
    alertConfig,
    isVisible,
    hideAlert,
    showAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirmation,
  };
};