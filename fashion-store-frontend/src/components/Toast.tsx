import { CheckCircle, AlertCircle, X, Info, AlertTriangle } from "lucide-react";
import { useEffect } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

export function Toast({
  message,
  type = "success",
  duration = 3000,
  onClose,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const config = {
    success: {
      icon: CheckCircle,
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
      progressColor: "bg-green-500",
    },
    error: {
      icon: AlertCircle,
      bgColor: "bg-red-100",
      iconColor: "text-red-600",
      progressColor: "bg-red-500",
    },
    warning: {
      icon: AlertTriangle,
      bgColor: "bg-yellow-100",
      iconColor: "text-yellow-600",
      progressColor: "bg-yellow-500",
    },
    info: {
      icon: Info,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
      progressColor: "bg-blue-500",
    },
  };

  const { icon: Icon, bgColor, iconColor, progressColor } = config[type];

  return (
    <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-top-5 duration-300">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-4 min-w-[320px] max-w-md">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className={`h-10 w-10 rounded-full ${bgColor} flex items-center justify-center`}>
              <Icon className={`h-6 w-6 ${iconColor}`} />
            </div>
          </div>

          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{message}</p>
          </div>

          <button
            onClick={onClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full ${progressColor} animate-progress`}
            style={{
              animation: `progress ${duration}ms linear forwards`,
            }}
          />
        </div>
      </div>
    </div>
  );
}