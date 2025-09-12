"use client"

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

// Toast Types
export type ToastVariant = "success" | "error" | "default" | "destructive";

export interface ToastOptions {
  title?: string;
  description?: string;
  variant?: ToastVariant;
}

export interface ToastData {
  id: number;
  title?: string;
  description?: string;
  type: "success" | "error" | "default";
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
const AUTO_DISMISS = 4000; // ms

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
        variant === "destructive"
          ? "error"
          : variant === "success"
          ? "success"
          : variant === "error"
          ? "error"
          : "default";

      const id = idCounter++;

      // Prevent exact duplicates (same title + description + type)
      setToasts((prev) => {
        const exists = prev.some(
          (t) => t.title === title && t.description === description && t.type === type
        );
        if (exists) return prev;
        return [...prev, { id, title, description, type }];
      });

      // auto remove
      setTimeout(() => removeToast(id), AUTO_DISMISS);

      return id; // return id so caller can dismiss manually if they want
    },
    [removeToast]
  );

  const api: ToastContextType = { toast, removeToast };

  return (
    <ToastContext.Provider value={api}>
      {children}

      {/* Toast container (top-right) */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 max-w-xs">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

interface ToastItemProps {
  toast: ToastData;
  onClose: () => void;
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  const { title, description, type } = toast;

  // progress animation using state
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const interval = 50; // ms
    const steps = AUTO_DISMISS / interval;
    let current = steps;
    const id = setInterval(() => {
      current -= 1;
      setProgress(Math.max(0, (current / steps) * 100));
      if (current <= 0) clearInterval(id);
    }, interval);

    return () => clearInterval(id);
  }, []);

  const icon =
    type === "success" ? (
      <CheckCircle className="w-5 h-5" />
    ) : type === "error" ? (
      <AlertCircle className="w-5 h-5" />
    ) : (
      <Info className="w-5 h-5" />
    );

  const variantClasses =
    type === "success"
      ? "bg-white/90 border border-green-100 shadow-md"
      : type === "error"
      ? "bg-white/90 border border-red-100 shadow-md"
      : "bg-white/90 border border-slate-100 shadow-md";

  return (
    <div className={`rounded-lg p-3 w-full ${variantClasses} animate-fade-in`}>
      <div className="flex items-start gap-3">
        <div className="pt-0.5 text-slate-700">{icon}</div>
        <div className="flex-1">
          {title && <div className="text-sm font-semibold text-slate-900">{title}</div>}
          {description && <div className="text-xs text-slate-600 mt-0.5">{description}</div>}
        </div>
        <button
          onClick={onClose}
          className="opacity-70 hover:opacity-100 rounded p-1"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      {/* progress bar */}
      <div className="h-1 bg-slate-100 rounded-full overflow-hidden mt-3">
        <div
          className="h-full rounded-full transition-all duration-50"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

// Small CSS-in-JS tailwind-friendly animation helper classes (you can add these to your globals.css if you prefer):
// .animate-fade-in { animation: toastIn 180ms cubic-bezier(.2,.9,.2,1); }
// @keyframes toastIn { from { transform: translateY(-6px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }

export default useToast;