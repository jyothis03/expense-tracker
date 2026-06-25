import { useState, useEffect, useRef } from "react";

export default function Toast({ toast, onUndo, onExpire }) {
  const [remaining, setRemaining] = useState(5);
  const timerRef = useRef(null);
  const expiryRef = useRef(null);

  useEffect(() => {
    if (!toast) return;

    setRemaining(5);

    // Countdown display
    timerRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Auto-expire after 5s
    expiryRef.current = setTimeout(() => {
      onExpire(toast.id);
    }, 5000);

    return () => {
      clearInterval(timerRef.current);
      clearTimeout(expiryRef.current);
    };
  }, [toast]);

  if (!toast) return null;

  const handleUndo = () => {
    clearInterval(timerRef.current);
    clearTimeout(expiryRef.current);
    onUndo(toast.id);
  };

  return (
    <div className="toast" role="status" aria-live="polite">
      <span className="toast__message">Expense deleted</span>
      <button className="toast__undo" onClick={handleUndo}>
        Undo
      </button>
      <span className="toast__timer">{remaining}s</span>
    </div>
  );
}
