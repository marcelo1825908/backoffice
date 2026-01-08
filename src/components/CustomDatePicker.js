import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

const CustomDatePicker = ({ value, onChange, min, className = '', size = 'normal', showTodayButton = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null);
  const pickerRef = useRef(null);
  const inputRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    if (value) {
      setSelectedDate(new Date(value));
      setCurrentMonth(new Date(value));
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target) && 
          inputRef.current && !inputRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      if (inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect();
        setPosition({
          top: rect.bottom + window.scrollY + 8,
          left: rect.left + window.scrollX,
          width: rect.width
        });
      }
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleScroll = () => {
      if (isOpen && inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect();
        setPosition({
          top: rect.bottom + window.scrollY + 8,
          left: rect.left + window.scrollX,
          width: rect.width
        });
      }
    };

    if (isOpen) {
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleScroll);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isOpen]);

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handleDateSelect = (day) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(newDate);
    onChange({ target: { value: formatDate(newDate) } });
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
    onChange({ target: { value: formatDate(today) } });
    setIsOpen(false);
  };

  const isDateDisabled = (day) => {
    if (!min) return false;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const minDate = new Date(min);
    minDate.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date < minDate;
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day) => {
    if (!selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      currentMonth.getMonth() === selectedDate.getMonth() &&
      currentMonth.getFullYear() === selectedDate.getFullYear()
    );
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const sizeClasses = {
    normal: 'px-4 py-2.5 text-base',
    large: 'px-6 pr-4 py-5 text-3xl'
  };

  const calendarContent = isOpen && (
    <div
      ref={pickerRef}
      className="fixed z-[9999] bg-pos-bg-primary border-2 border-pos-border-primary rounded-xl shadow-2xl p-4"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: `${Math.max(position.width, 320)}px`
      }}
    >
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="p-2 text-pos-text-primary hover:bg-pos-bg-secondary rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="text-lg font-bold text-pos-text-primary">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </div>
        <button
          type="button"
          onClick={handleNextMonth}
          className="p-2 text-pos-text-primary hover:bg-pos-bg-secondary rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day Names Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-semibold text-pos-text-secondary py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }
          
          const disabled = isDateDisabled(day);
          const isTodayDate = isToday(day);
          const isSelectedDate = isSelected(day);

          return (
            <button
              key={day}
              type="button"
              onClick={() => !disabled && handleDateSelect(day)}
              disabled={disabled}
              className={`aspect-square rounded-lg text-sm font-medium transition-all duration-150 ${
                disabled
                  ? 'text-pos-text-muted cursor-not-allowed opacity-50'
                  : isSelectedDate
                  ? 'bg-blue-600 text-white shadow-lg scale-105'
                  : isTodayDate
                  ? 'bg-pos-bg-secondary text-pos-text-primary border-2 border-blue-500'
                  : 'text-pos-text-primary hover:bg-pos-bg-secondary'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Clear and Today Buttons */}
      {showTodayButton && (
        <div className="mt-4 pt-4 border-t border-pos-border-primary">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedDate(null);
                onChange({ target: { value: '' } });
                setIsOpen(false);
              }}
              className="flex-1 py-2 px-4 bg-pos-bg-secondary text-pos-text-primary rounded-lg font-medium hover:bg-pos-bg-tertiary transition-colors border-2 border-pos-border-primary"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          readOnly
          value={formatDisplayDate(value)}
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full ${sizeClasses[size]} bg-pos-bg-primary border-2 border-pos-border-primary rounded-xl text-pos-text-primary font-medium cursor-pointer focus:outline-none focus:border-blue-500 transition-all duration-200 hover:border-blue-500 pr-12 ${className}`}
          placeholder="Select date"
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-0 top-0 h-full px-4 flex items-center justify-center text-pos-text-secondary hover:text-pos-text-primary transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
      {isOpen && createPortal(calendarContent, document.body)}
    </div>
  );
};

export default CustomDatePicker;

