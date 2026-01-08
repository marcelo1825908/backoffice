import React from 'react';

export const Skeleton = ({ className = '', width, height }) => {
  return (
    <div
      className={`bg-pos-bg-tertiary animate-pulse rounded ${className}`}
      style={{ width, height }}
    ></div>
  );
};

export const SkeletonTable = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-12 flex-1 bg-pos-bg-tertiary" />
          ))}
        </div>
      ))}
    </div>
  );
};

export default Skeleton;

