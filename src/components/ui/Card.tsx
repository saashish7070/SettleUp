import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  as?: keyof JSX.IntrinsicElements;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = false,
  as: Component = 'div',
}) => {
  const baseClasses = 'bg-white rounded-xl shadow-sm transition-all duration-200';
  const hoverClasses = hoverable ? 'hover:shadow-md hover:-translate-y-1' : '';
  const clickableClasses = onClick ? 'cursor-pointer' : '';
  
  return (
    <Component
      className={`${baseClasses} ${hoverClasses} ${clickableClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </Component>
  );
};

export default Card;