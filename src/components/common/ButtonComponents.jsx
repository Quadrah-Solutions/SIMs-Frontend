// src/components/common/ButtonComponents.js
import React from 'react';
import { Link } from 'react-router-dom';

// Icon Button Component
export const IconButton = ({ 
  icon, 
  onClick, 
  title, 
  color = 'blue', 
  className = '', 
  disabled = false,
  href,
  size = 'md'
}) => {
  const colorClasses = {
    blue: 'text-blue-600 hover:text-blue-900 hover:bg-blue-50',
    green: 'text-green-600 hover:text-green-900 hover:bg-green-50',
    red: 'text-red-600 hover:text-red-900 hover:bg-red-50',
    purple: 'text-purple-600 hover:text-purple-900 hover:bg-purple-50',
    gray: 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
    yellow: 'text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50'
  };

  const sizeClasses = {
    sm: 'p-1',
    md: 'p-1.5',
    lg: 'p-2'
  };

  const buttonClass = `transition duration-200 rounded ${sizeClasses[size]} ${colorClasses[color]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`;

  const commonProps = {
    className: buttonClass,
    title,
    disabled,
    onClick: disabled ? undefined : onClick
  };

  if (href) {
    return (
      <Link to={href} {...commonProps}>
        {icon}
      </Link>
    );
  }

  return (
    <button type="button" {...commonProps}>
      {icon}
    </button>
  );
};

// View Details Button Component
export const ViewDetailsButton = ({ id, className = '', size = 'md' }) => (
  <IconButton
    href={`/students/${id}`}
    title="View Student Details"
    color="blue"
    size={size}
    className={className}
    icon={
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    }
  />
);

// Edit Button Component
export const EditButton = ({ onClick, className = '', size = 'md', disabled = false }) => (
  <IconButton
    onClick={onClick}
    title="Edit Student"
    color="green"
    size={size}
    className={className}
    disabled={disabled}
    icon={
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    }
  />
);

// Delete Button Component
export const DeleteButton = ({ onClick, className = '', size = 'md', disabled = false }) => (
  <IconButton
    onClick={onClick}
    title="Delete"
    color="red"
    size={size}
    className={className}
    disabled={disabled}
    icon={
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    }
  />
);

// Add Button Component
export const AddButton = ({ onClick, className = '', size = 'md', disabled = false }) => (
  <IconButton
    onClick={onClick}
    title="Add"
    color="blue"
    size={size}
    className={className}
    disabled={disabled}
    icon={
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    }
  />
);

// Download Button Component
export const DownloadButton = ({ onClick, className = '', size = 'md', disabled = false }) => (
  <IconButton
    onClick={onClick}
    title="Download"
    color="gray"
    size={size}
    className={className}
    disabled={disabled}
    icon={
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    }
  />
);

// Add this to your ButtonComponents.js
export const ViewVisitButton = ({ id, className = '', size = 'md' }) => (
  <IconButton
    href={`/visits/${id}`}
    title="View Visit Details"
    color="blue"
    size={size}
    className={className}
    icon={
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    }
  />
);

// Action Button Component for larger buttons
export const ActionButton = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = '', 
  disabled = false,
  type = 'button'
}) => {
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white',
    info: 'bg-blue-500 hover:bg-blue-600 text-white'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${variantClasses[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
};