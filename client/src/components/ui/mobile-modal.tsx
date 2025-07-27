import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface MobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function MobileModal({ isOpen, onClose, title, children }: MobileModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-t-3xl w-full max-w-md mx-4 mt-auto slide-up">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
            <button 
              onClick={onClose}
              className="text-ios-gray text-2xl hover:text-gray-900 transition-colors"
            >
              <X />
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
