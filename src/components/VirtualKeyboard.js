import React, { useState } from 'react';

const VirtualKeyboard = ({ value = '', onChange, onInput, onBackspace, onClear, disabled = false }) => {
  const [isShift, setIsShift] = useState(false);
  const [isCaps, setIsCaps] = useState(false);

  const handleKeyPress = (key) => {
    if (disabled) return;
    
    if (onInput) {
      onInput(key);
    } else if (onChange) {
      onChange((value || '') + key);
    }
  };

  const handleBackspacePress = () => {
    if (disabled) return;
    if (onBackspace) {
      onBackspace();
    } else if (onChange) {
      onChange((value || '').slice(0, -1));
    }
  };

  const handleClearPress = () => {
    if (disabled) return;
    if (onClear) {
      onClear();
    } else if (onChange) {
      onChange('');
    }
  };

  const handleSpace = () => {
    handleKeyPress(' ');
  };

  const handleEnter = () => {
    handleKeyPress('\n');
  };

  const getKeyValue = (lower, upper) => {
    if (isCaps || isShift) {
      return isShift ? upper : lower.toUpperCase();
    }
    return lower;
  };

  // First row: Numbers and symbols
  const row1 = [
    { lower: '1', upper: '!' },
    { lower: '2', upper: '@' },
    { lower: '3', upper: '#' },
    { lower: '4', upper: '$' },
    { lower: '5', upper: '%' },
    { lower: '6', upper: '^' },
    { lower: '7', upper: '&' },
    { lower: '8', upper: '*' },
    { lower: '9', upper: '(' },
    { lower: '0', upper: ')' },
    { lower: '-', upper: '_' },
    { lower: '=', upper: '+' }
  ];

  // Second row: Letters Q-P
  const row2 = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', { lower: '[', upper: '{' }, { lower: ']', upper: '}' }];

  // Third row: Letters A-L
  const row3 = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', { lower: ';', upper: ':' }, { lower: "'", upper: '"' }];

  // Fourth row: Letters Z-M
  const row4 = ['z', 'x', 'c', 'v', 'b', 'n', 'm', { lower: ',', upper: '<' }, { lower: '.', upper: '>' }, { lower: '/', upper: '?' }];

  const renderKey = (key, className = '', isSpecial = false, uniqueId = '') => {
    let displayKey = key;
    let keyToPress = key;
    let uniqueKey = uniqueId || displayKey;

    if (typeof key === 'object' && key.lower !== undefined) {
      displayKey = isShift ? key.upper : key.lower;
      keyToPress = isShift ? key.upper : key.lower;
      uniqueKey = uniqueId || `key-${key.lower}-${key.upper}`;
    } else if (typeof key === 'string' && key.length === 1 && /[a-z]/.test(key)) {
      displayKey = getKeyValue(key, key.toUpperCase());
      keyToPress = getKeyValue(key, key.toUpperCase());
      uniqueKey = uniqueId || `key-${key}`;
    } else if (typeof key === 'string') {
      displayKey = key;
      keyToPress = key;
      uniqueKey = uniqueId || `key-${key}`;
    }

    return (
      <button
        key={uniqueKey}
        type="button"
        onClick={() => {
          if (isSpecial) {
            if (key === 'Shift') {
              setIsShift(!isShift);
            } else if (key === 'Caps') {
              setIsCaps(!isCaps);
            } else if (key === 'Backspace') {
              handleBackspacePress();
            } else if (key === 'Clear') {
              handleClearPress();
            } else if (key === 'Space') {
              handleSpace();
            } else if (key === 'Enter') {
              handleEnter();
            }
          } else {
            handleKeyPress(keyToPress);
            if (isShift) {
              setIsShift(false);
            }
          }
        }}
        className={`key-btn ${className} ${isSpecial ? 'special-key' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={disabled}
      >
        {key === 'Backspace' ? '⌫' : key === 'Caps' ? 'Caps' : key === 'Shift' ? '⇧' : key === 'Clear' ? 'Clear' : key === 'Space' ? 'Space' : key === 'Enter' ? 'Enter' : displayKey}
      </button>
    );
  };

  return (
    <div className="full-keyboard bg-gray-800 p-3 rounded-lg">
      {/* Row 1: Numbers and symbols */}
      <div className="keyboard-row">
        {row1.map((key, index) => renderKey(key, '', false, `row1-${index}`))}
        {renderKey('Backspace', 'backspace-key', true, 'backspace')}
      </div>

      {/* Row 2: Q-P */}
      <div className="keyboard-row">
        {row2.map((key, index) => renderKey(key, '', false, `row2-${index}`))}
        {renderKey({ lower: '\\', upper: '|' }, '', false, 'backslash')}
      </div>

      {/* Row 3: A-L */}
      <div className="keyboard-row">
        {renderKey('Caps', 'caps-key', true, 'caps')}
        {row3.map((key, index) => renderKey(key, '', false, `row3-${index}`))}
        {renderKey('Enter', 'enter-key', true, 'enter')}
      </div>

      {/* Row 4: Z-M */}
      <div className="keyboard-row">
        {renderKey('Shift', 'shift-key', true, 'shift-left')}
        {row4.map((key, index) => renderKey(key, '', false, `row4-${index}`))}
        {renderKey('Shift', 'shift-key', true, 'shift-right')}
      </div>

      {/* Row 5: Space and Clear */}
      <div className="keyboard-row">
        {renderKey('Clear', 'clear-key', true, 'clear-left')}
        {renderKey('Space', 'space-key', true, 'space')}
        {renderKey('Clear', 'clear-key', true, 'clear-right')}
      </div>
    </div>
  );
};

export default VirtualKeyboard;

