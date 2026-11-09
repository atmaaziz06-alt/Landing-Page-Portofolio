import React, { useEffect, useRef, useState } from 'react';

const variantClasses = {
  text: 'skeleton-text',
  title: 'skeleton-title',
  avatar: 'skeleton-avatar',
  image: 'skeleton-image',
  card: 'skeleton-card'
};

export default function Skeleton({ variant = 'text', className = '' }) {
  if (variant === 'card') {
    return (
      <div className={`skeleton skeleton-card ${className}`} aria-hidden="true">
        <div className="skeleton-shape skeleton-card-image" />
        <div className="skeleton-card-copy">
          <div className="skeleton-shape skeleton-card-title" />
          <div className="skeleton-shape skeleton-card-line" />
          <div className="skeleton-shape skeleton-card-line skeleton-card-line-short" />
        </div>
      </div>
    );
  }

  const shapeClass = variantClasses[variant] || variantClasses.text;
  return (
    <div
      className={`skeleton skeleton-shape ${shapeClass} ${className}`}
      aria-hidden="true"
    />
  );
}

export function SkeletonMedia({ src, children, className = '' }) {
  const mediaRef = useRef(null);
  const [loadedSource, setLoadedSource] = useState(null);
  const [delayedSource, setDelayedSource] = useState(null);
  const isBusy = loadedSource !== src || delayedSource !== src;

  useEffect(() => {
    const delay = Number.parseFloat(
      window.getComputedStyle(document.documentElement)
        .getPropertyValue('--skeleton-min-delay')
    );
    const timerId = window.setTimeout(() => setDelayedSource(src), delay);
    const image = mediaRef.current?.querySelector('img');
    if (image?.complete && image.naturalWidth > 0) {
      setLoadedSource(src);
    }

    return () => window.clearTimeout(timerId);
  }, [src]);

  const child = React.Children.only(children);
  const originalClassName = child.props.className || '';

  return (
    <div
      ref={mediaRef}
      className={`skeleton-media ${isBusy ? '' : 'is-loaded'} ${className}`}
      aria-busy={isBusy}
    >
      {isBusy && (
        <>
          <Skeleton variant="image" className="skeleton-media-placeholder" />
          <span className="sr-only">Memuat konten</span>
        </>
      )}
      {React.cloneElement(child, {
        className: `${originalClassName} skeleton-content`,
        onLoad: (event) => {
          child.props.onLoad?.(event);
          setLoadedSource(src);
        },
        onError: (event) => {
          child.props.onError?.(event);
          setLoadedSource(src);
        }
      })}
    </div>
  );
}
