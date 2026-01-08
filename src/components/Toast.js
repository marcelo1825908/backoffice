import { useEffect } from "react";

const Toast = ({ message, type = "error", onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = type === "error" ? "bg-red-500" : type === "success" ? "bg-green-500" : "bg-blue-500";
  const icon = type === "error" ? "⚠️" : type === "success" ? "✓" : "ℹ️";

  return (
    <div className="fixed top-8 right-8 z-[9999] animate-slide-down">
      <div className={`${bgColor} text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[300px] max-w-[500px] border-2 ${type === 'success' ? 'border-green-400' : type === 'error' ? 'border-red-400' : 'border-blue-400'}`}>
        <span className="text-2xl font-bold">{icon}</span>
        <span className="flex-1 text-base font-semibold">{message}</span>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 text-xl font-bold ml-2 transition-opacity hover:opacity-70"
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Toast;

