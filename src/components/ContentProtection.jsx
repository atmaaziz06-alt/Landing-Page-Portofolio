import React from 'react';
import useContentProtection from '../hooks/useContentProtection';

export default function ContentProtection({ enabled, children, className = '' }) {
  const isCovered = useContentProtection(enabled);

  return (
    <div
      className={`content-protection relative ${className}`}
      onContextMenu={enabled ? (event) => event.preventDefault() : undefined}
      onDragStart={enabled ? (event) => event.preventDefault() : undefined}
      onTouchStart={enabled ? (event) => {
        if (event.touches.length > 1) event.preventDefault();
      } : undefined}
    >
      {children}
      {enabled && isCovered && (
        <div
          role="alert"
          className="absolute inset-0 z-40 flex items-center justify-center bg-black p-6 text-center text-sm font-semibold text-white"
        >
          Security Policy: Screen recording and screenshots are restricted.
        </div>
      )}
    </div>
  );
}
