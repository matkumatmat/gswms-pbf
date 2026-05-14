import React from 'react';

export type ButtonVariant =
  | 'primary'
  | 'primary-light'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'ghost'
  | 'ghost-neutral'
  | 'icon-only';

export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  children,
  className = '',
  ...rest
}) => {
  const isDisabled = disabled || isLoading;

  const baseClass = 'btn';
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-${size}`;
  const stateClass = isDisabled ? 'btn-disabled' : '';

  const combinedClassName = [
    baseClass,
    variantClass,
    sizeClass,
    stateClass,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const spinner = (
    <span className="btn-spinner" aria-label="loading">
      <svg
        className="animate-spin h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </span>
  );

  const content = (
    <>
      {isLoading && spinner}
      {!isLoading && icon && iconPosition === 'left' && (
        <span className="btn-icon-left">{icon}</span>
      )}
      {children && <span className="btn-text">{children}</span>}
      {!isLoading && icon && iconPosition === 'right' && (
        <span className="btn-icon-right">{icon}</span>
      )}
    </>
  );

  return (
    <button
      className={combinedClassName}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      {...rest}
    >
      {content}
    </button>
  );
};
