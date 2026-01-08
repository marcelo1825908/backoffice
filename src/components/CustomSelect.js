import React, { useState, useRef, useEffect } from 'react';

const CustomSelect = ({ value, onChange, options, className = '', disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  const handleSelect = (optionValue) => {
    onChange({ target: { value: optionValue } });
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-4 py-2 bg-pos-bg-secondary border-2 border-pos-border-primary rounded-xl text-pos-text-primary font-medium cursor-pointer focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 hover:border-pos-interactive-hover flex items-center justify-between ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <span>{selectedOption?.label || selectedOption?.value || 'Select...'}</span>
        <svg
          className={`w-5 h-5 text-pos-text-secondary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-pos-bg-secondary border-2 border-pos-border-primary rounded-xl shadow-2xl overflow-hidden">
          <div className="max-h-60 overflow-y-auto">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full text-left px-4 py-3 font-medium text-sm transition-all duration-150 ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'text-pos-text-primary hover:bg-pos-bg-tertiary'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option.label || option.value}</span>
                    {isSelected && (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;

