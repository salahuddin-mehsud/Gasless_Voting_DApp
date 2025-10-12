import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../utils/helpers.js';

const Modal = ({ isOpen, onClose, children, className }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={cn(
        'relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto',
        className
      )}>
        {children}
      </div>
    </div>,
    document.body
  );
};

const ModalHeader = ({ children, onClose, className }) => {
  return (
    <div className={cn('flex items-center justify-between p-6 border-b', className)}>
      <div className="text-lg font-semibold">{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      )}
    </div>
  );
};

const ModalContent = ({ children, className }) => {
  return (
    <div className={cn('p-6', className)}>
      {children}
    </div>
  );
};

const ModalFooter = ({ children, className }) => {
  return (
    <div className={cn('flex items-center justify-end gap-3 p-6 border-t', className)}>
      {children}
    </div>
  );
};

export { Modal, ModalHeader, ModalContent, ModalFooter };