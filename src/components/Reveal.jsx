import React, { useEffect, useRef, useState } from 'react';

/**
 * Reusable Reveal animation wrapper triggered on scroll using IntersectionObserver.
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.className]
 * @param {'fade-up' | 'fade-in' | 'scale-up'} [props.variant='fade-up']
 * @param {number} [props.delay=0] Delay in milliseconds
 * @param {number} [props.threshold=0.15] Intersection threshold
 */
export default function Reveal({
  children,
  className = '',
  variant = 'fade-up',
  delay = 0,
  threshold = 0.15,
}) {
  const [isRevealed, setIsRevealed] = useState(() => {
    if (typeof window === 'undefined') return true;
    return !('IntersectionObserver' in window);
  });
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || isRevealed) return;

    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsRevealed(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [threshold, isRevealed]);

  const variantClass =
    variant === 'fade-in'
      ? 'reveal-fade-in'
      : variant === 'scale-up'
      ? 'reveal-scale-up'
      : 'reveal-fade-up';

  return (
    <div
      ref={elementRef}
      style={{
        transitionDelay: isRevealed ? `${delay}ms` : '0ms',
      }}
      className={`${variantClass} ${isRevealed ? 'is-revealed' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
