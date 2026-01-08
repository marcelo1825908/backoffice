import React from 'react';

const Header = ({ title, subtitle }) => {
  return (
    <header className="sticky top-0 z-40 bg-pos-bg-secondary border-b-2 border-pos-border-primary shadow-lg mb-10">
      <div className="px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-pos-text-primary">{title}</h1>
            {subtitle && (
              <p className="text-sm text-pos-text-secondary mt-1">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

