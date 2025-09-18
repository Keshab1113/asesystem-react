"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

export type ToastVariant =
  | "success"
  | "error"
  | "default"
  | "destructive"
  | "warning";

export interface ToastOptions {
  title?: string;
  description?: string;
  variant?: ToastVariant;
}

export interface ToastData {
  id: number;
  title?: string;
  description?: string;
  type: "success" | "error" | "default" | "warning";
}

export interface ToastContextType {
  toast: (options: ToastOptions) => number;
  removeToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = (): ToastContextType => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
};

let idCounter = 1;
const AUTO_DISMISS = 5000; // ms

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const toast = useCallback(
    ({ title, description, variant }: ToastOptions = {}): number => {
      // normalize variant
      const type =
        variant === "destructive" || variant === "error"
          ? "error"
          : variant === "success"
          ? "success"
          : variant === "warning"
          ? "warning"
          : "default";

      const id = idCounter++;

      // Prevent exact duplicates (same title + description + type)
      setToasts((prev) => {
        const exists = prev.some(
          (t) =>
            t.title === title &&
            t.description === description &&
            t.type === type
        );
        if (exists) return prev;
        return [...prev, { id, title, description, type }];
      });

      // auto remove
      setTimeout(() => removeToast(id), AUTO_DISMISS);

      return id;
    },
    [removeToast]
  );

  const api: ToastContextType = { toast, removeToast };

  return (
    <ToastContext.Provider value={api}>
      {children}

      {/* Toast container (top-right) */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 max-w-sm pointer-events-none">
        {toasts.map((t, index) => (
          <ToastItem
            key={t.id}
            toast={t}
            index={index}
            onClose={() => removeToast(t.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

interface ToastItemProps {
  toast: ToastData;
  index: number;
  onClose: () => void;
}

function ToastItem({ toast, index, onClose }: ToastItemProps) {
  const { title, description, type } = toast;
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Entrance animation
    const showTimeout = setTimeout(() => setIsVisible(true), index * 100);

    // Progress bar animation
    const interval = 50;
    const steps = AUTO_DISMISS / interval;
    let current = steps;

    const progressInterval = setInterval(() => {
      current -= 1;
      setProgress(Math.max(0, (current / steps) * 100));
      if (current <= 0) clearInterval(progressInterval);
    }, interval);

    return () => {
      clearTimeout(showTimeout);
      clearInterval(progressInterval);
    };
  }, [index]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 200);
  };

  const getVariantStyles = () => {
    switch (type) {
      case "success":
        return {
          container:
            "bg-gradient-to-r from-emerald-50 to-green-50 border-l-4 border-emerald-400 shadow-lg shadow-emerald-100/50",
          icon: "text-emerald-600",
          progress: "bg-gradient-to-r from-emerald-400 to-green-400",
        };
      case "error":
        return {
          container:
            "bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-400 shadow-lg shadow-red-100/50",
          icon: "text-red-600",
          progress: "bg-gradient-to-r from-red-400 to-rose-400",
        };
      case "warning":
        return {
          container:
            "bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-400 shadow-lg shadow-amber-100/50",
          icon: "text-amber-600",
          progress: "bg-gradient-to-r from-amber-400 to-yellow-400",
        };
      default:
        return {
          container:
            "bg-gradient-to-r from-slate-50 to-gray-50 border-l-4 border-blue-400 shadow-lg shadow-slate-100/50",
          icon: "text-blue-600",
          progress: "bg-gradient-to-r from-blue-400 to-indigo-400",
        };
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5" />;
      case "error":
        return <AlertCircle className="w-5 h-5" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const styles = getVariantStyles();

  return (
    <div
      className={`
        relative rounded-xl p-4 w-full backdrop-blur-sm pointer-events-auto
        transform transition-all duration-300 ease-out
        ${
          isVisible
            ? "translate-x-0 opacity-100 scale-100"
            : "translate-x-full opacity-0 scale-95"
        }
        ${styles.container}
        hover:scale-105 hover:shadow-xl
        group
      `}
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-white/60 rounded-xl" />

      <div className="relative flex items-start gap-3">
        {/* Icon with pulse animation */}
        <div className={`flex-shrink-0 ${styles.icon} animate-pulse`}>
          {getIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && (
            <div className="text-sm font-semibold text-gray-900 mb-1 leading-tight">
              {title}
            </div>
          )}
          {description && (
            <div className="text-xs text-gray-700 leading-relaxed break-words">
              {description}
            </div>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="flex-shrink-0 p-1.5 rounded-full bg-white/80 hover:bg-white transition-all duration-200 hover:scale-110 opacity-70 hover:opacity-100 group-hover:opacity-100"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Enhanced progress bar */}
      <div className="relative mt-3 h-1.5 bg-white/50 rounded-full overflow-hidden">
        <div
          className={`absolute top-0 left-0 h-full rounded-full transition-all duration-75 ease-linear ${styles.progress}`}
          style={{ width: `${progress}%` }}
        />
        {/* Shimmer effect */}
        <div
          className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full"
          style={{
            animation: "shimmer 2s ease-in-out infinite",
            transform: `translateX(${progress - 100}%)`,
          }}
        />
      </div>
    </div>
  );
}
export default useToast;
