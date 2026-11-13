import { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext(() => {});

// const showToast = useToast();  showToast('Event created', 'success');
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, message, type }]);
    setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 5000);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
