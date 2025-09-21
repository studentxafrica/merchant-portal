import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Trash2,
  Plus,
} from "lucide-react";

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to perform this action?" as string | React.ReactNode,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default", // 'default', 'destructive', 'success'
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title?: string;
  message?: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive" | "success"; // Define variants
}) => {
  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Variant configurations
  const variantConfig = {
    default: {
      icon: <HelpCircle className="w-6 h-6 text-blue-500" />,
      confirmButton: "bg-blue-600 hover:bg-blue-700",
    },
    destructive: {
      icon: <AlertTriangle className="w-6 h-6 text-red-500" />,
      confirmButton: "bg-red-600 hover:bg-red-700",
    },
    success: {
      icon: <CheckCircle2 className="w-6 h-6 text-green-500" />,
      confirmButton: "bg-green-600 hover:bg-green-700",
    },
  };

  const currentVariant = variantConfig[variant] || variantConfig.default;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-background rounded-lg border shadow-lg max-w-md w-full animate-in zoom-in-95">
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className="mt-0.5">{currentVariant.icon}</div>
            <div className="space-y-2">
              <h2 className="text-lg font-semibold leading-none tracking-tight">
                {title}
              </h2>
              <p className="text-sm text-muted-foreground">{message}</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="px-4 py-2"
            >
              {cancelText}
            </Button>
            <Button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`${currentVariant.confirmButton} px-4 py-2`}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};