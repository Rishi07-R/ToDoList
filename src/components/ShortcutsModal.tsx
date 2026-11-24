import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { key: 'N', description: 'Focus quick-add task input' },
  { key: '/', description: 'Focus live task search' },
  { key: '1', description: 'Switch to List view' },
  { key: '2', description: 'Switch to Board view' },
  { key: 'Esc', description: 'Close active drawer or modal' },
  { key: '#study', description: 'Auto-tag category inside quick-add' },
  { key: '!high', description: 'Auto-set priority inside quick-add' },
  { key: '@today', description: 'Auto-schedule date inside quick-add' },
];

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({
  open,
  onClose,
}) => {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
    >
      <div
        className="fixed inset-0 bg-[#0F172A]/20 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-md bg-[#FFFFFF] border border-[#E2E8F0] rounded-[10px] shadow-level-3 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
          <h2 className="text-[16px] font-semibold text-[#0F172A]">
            Keyboard shortcuts & quick tokens
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close shortcuts"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 divide-y divide-[#F1F5F9]">
          {SHORTCUTS.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0 text-[13px]"
            >
              <span className="text-[#464555]">{item.description}</span>
              <kbd className="px-2 py-0.5 rounded bg-[#F8FAFC] border border-[#E2E8F0] font-mono text-[12px] text-[#0F172A]">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
