import React, { useEffect, useRef, useState } from 'react';
import { statsData } from '../data/stats';

/**
 * Animated counter that counts up smoothly when scrolled into view.
 */
function StatCounter({ stat, isVisible, delay = 0 }) {
  const [currentValue, setCurrentValue] = useState(0);

  // Extract prefix, number, and suffix
  // Examples: "8+" -> prefix="", num=8, suffix="+"
  //           "$12M+" -> prefix="$", num=12, suffix="M+"
  //           "98%" -> prefix="", num=98, suffix="%"
  const match = stat.value.match(/^([^0-9]*)([0-9]+)(.*)$/);
  const prefix = match ? match[1] : '';
  const targetNum = match ? parseInt(match[2], 10) : 0;
  const suffix = match ? match[3] : '';

  useEffect(() => {
    if (!isVisible) return;

    let startTime = null;
    let animationFrameId;
    const duration = 1800; // ms

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp + delay;

      const progress = Math.min((timestamp - startTime) / duration, 1);
      if (progress > 0) {
        // Ease out quad: 1 - (1 - t) * (1 - t)
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        setCurrentValue(Math.floor(easeProgress * targetNum));
      }

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setCurrentValue(targetNum);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isVisible, targetNum, delay]);

  return (
    <div className="p-5 sm:p-6 rounded-[22px] bg-[#FBEFE9] border border-[rgba(23,23,23,0.06)] hover:border-[#E66F52]/30 flex flex-col justify-between hover-lift shadow-card hover:shadow-subtle transition-all duration-300 group">
      <span className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-[#E66F52] mb-2 font-mono group-hover:scale-105 transition-transform duration-300 origin-left">
        {isVisible ? (
          <>
            {prefix}
            {currentValue}
            {suffix}
          </>
        ) : (
          `${prefix}0${suffix}`
        )}
      </span>
      <div>
        <h4 className="text-sm sm:text-base font-semibold text-[#171717] group-hover:text-[#E66F52] transition-colors">
          {stat.label}
        </h4>
        <p className="text-xs text-[#5F5A57] mt-0.5 leading-relaxed">
          {stat.detail}
        </p>
      </div>
    </div>
  );
}

export default function Stats() {
  const containerRef = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pt-10 border-t border-[rgba(23,23,23,0.08)]"
    >
      {statsData.map((stat, idx) => (
        <StatCounter
          key={idx}
          stat={stat}
          isVisible={isInView}
          delay={idx * 150}
        />
      ))}
    </div>
  );
}
