import React from 'react';

/**
 * Modern, professional loading spinner with dark theme
 * Supports different sizes and optional text
 */
const LoadingSpinner = ({ 
  size = 'md', 
  text = '', 
  fullScreen = false,
  className = '',
  darkBg = true
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  };

  const borderWidths = {
    sm: '2px',
    md: '3px',
    lg: '4px',
    xl: '4px'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const spinner = (
    <div className={`flex flex-col items-center justify-center ${darkBg ? 'bg-gray-900 rounded-xl p-8 shadow-2xl border border-gray-800' : ''} ${className}`}>
      {/* Modern animated spinner with gradient */}
      <div className="relative">
        {/* Outer rotating ring */}
        <div 
          className={`
            ${sizeClasses[size]} 
            border-transparent 
            rounded-full 
            animate-spin
            shadow-lg
          `}
          style={{
            borderTopWidth: borderWidths[size],
            borderBottomWidth: borderWidths[size],
            borderTopColor: 'rgb(96, 165, 250)', // Lighter blue for dark theme
            borderBottomColor: 'rgb(96, 165, 250)',
            boxShadow: '0 0 20px rgba(96, 165, 250, 0.6)'
          }}
        ></div>
        
        {/* Inner pulsing circle */}
        <div 
          className={`
            absolute inset-0 
            ${size === 'sm' ? 'm-1' : size === 'md' ? 'm-2' : size === 'lg' ? 'm-3' : 'm-4'}
            rounded-full 
            bg-blue-400/30 
            animate-pulse
          `}
        ></div>
        
        {/* Center dot */}
        <div 
          className={`
            absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
            ${size === 'sm' ? 'w-1.5 h-1.5' : size === 'md' ? 'w-2 h-2' : size === 'lg' ? 'w-3 h-3' : 'w-4 h-4'}
            bg-blue-400 
            rounded-full
            shadow-lg
          `}
          style={{
            boxShadow: '0 0 10px rgba(96, 165, 250, 0.9)'
          }}
        ></div>
      </div>
      
      {/* Optional text */}
      {text && (
        <p className={`mt-4 text-gray-200 ${textSizeClasses[size]} font-medium`}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gray-900/95 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
