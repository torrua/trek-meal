import React from 'react';

const VARIANTS = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
  secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-200 border border-gray-300',
};

function Button({ children, onClick, type = 'button', variant = 'primary', className = '' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export default Button;