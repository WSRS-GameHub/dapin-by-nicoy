"use client";

import { useEffect } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

type ToastType = "success" | "error";

export default function Toast({
  type,
  message,
  onClose,
}: {
  type: ToastType;
  message: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const isSuccess = type === "success";

  return (
    <div
      className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg max-w-[90%] w-fit ${
        isSuccess ? "bg-teal text-white" : "bg-red-500 text-white"
      }`}
      role="alert"
    >
      {isSuccess ? (
        <CheckCircle2 size={18} className="flex-shrink-0" />
      ) : (
        <XCircle size={18} className="flex-shrink-0" />
      )}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-1 flex-shrink-0 opacity-80 hover:opacity-100">
        <X size={16} />
      </button>
    </div>
  );
}