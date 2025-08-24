import React from 'react';

interface ActionButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}

export const ActionButton = ({ onClick, children, disabled = false }: ActionButtonProps) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/30 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
  >
    {children}
  </button>
);