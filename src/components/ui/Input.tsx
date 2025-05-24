import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    label, 
    helperText, 
    error, 
    fullWidth = true, 
    leftIcon, 
    rightIcon, 
    className = '', 
    ...props 
  }, ref) => {
    const inputWrapperClasses = `
      relative flex items-center
      ${fullWidth ? 'w-full' : ''}
      ${error ? 'border-error-500' : 'border-gray-300'} 
      border rounded-lg overflow-hidden
      focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100
      transition-all duration-200
    `;

    const inputClasses = `
      py-2 px-3 w-full bg-white text-gray-900 text-sm
      placeholder:text-gray-400 focus:outline-none
      ${leftIcon ? 'pl-9' : ''}
      ${rightIcon ? 'pr-9' : ''}
      ${error ? 'text-error-500' : ''}
      ${props.disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}
      ${className}
    `;

    return (
      <div className={`${fullWidth ? 'w-full' : ''} mb-1`}>
        {label && (
          <label 
            className="block text-sm font-medium text-gray-700 mb-1" 
            htmlFor={props.id}
          >
            {label}
          </label>
        )}
        
        <div className={inputWrapperClasses}>
          {leftIcon && (
            <div className="absolute left-2.5 text-gray-500">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            className={inputClasses}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute right-2.5 text-gray-500">
              {rightIcon}
            </div>
          )}
        </div>
        
        {(helperText || error) && (
          <p className={`mt-1 text-xs ${error ? 'text-error-500' : 'text-gray-500'}`}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;