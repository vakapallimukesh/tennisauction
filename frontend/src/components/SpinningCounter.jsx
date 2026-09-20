import React, { useState, useEffect, useMemo, useRef } from 'react';

/**
 * Transitions.dev Spinning Counter Component
 * Animated slot-reel counter for prices/numbers with directional motion blur and staggered settling.
 */
export default function SpinningCounter({
  value = 0,
  suffix = ' pts',
  prefix = '',
  spins = 3,
  duration = 1400,
  stagger = 90,
  className = ''
}) {
  const [isSpinning, setIsSpinning] = useState(false);
  const containerRef = useRef(null);

  // Format the number into a string, e.g. "12,000"
  const formattedNumber = useMemo(() => {
    if (value === undefined || value === null) return '0';
    return Number(value).toLocaleString('en-IN');
  }, [value]);

  // Breakdown characters into digits & non-digit symbols
  const columns = useMemo(() => {
    const chars = formattedNumber.split('');
    let digitCount = 0;
    return chars.map((char) => {
      const isDigit = /\d/.test(char);
      const digitIndex = isDigit ? digitCount++ : null;
      const targetDigit = isDigit ? parseInt(char, 10) : 0;

      // Build strip of digits: 0-9 for (spins) cycles, then 0..targetDigit
      let stripDigits = [];
      if (isDigit) {
        for (let s = 0; s < spins; s++) {
          for (let d = 0; d <= 9; d++) {
            stripDigits.push(d);
          }
        }
        for (let d = 0; d <= targetDigit; d++) {
          stripDigits.push(d);
        }
      }

      return {
        char,
        isDigit,
        digitIndex,
        targetDigit,
        stripDigits,
        targetOffset: isDigit ? spins * 10 + targetDigit : 0
      };
    });
  }, [formattedNumber, spins]);

  // Trigger animation on mount or when value changes
  useEffect(() => {
    setIsSpinning(false);
    const timer = setTimeout(() => {
      setIsSpinning(true);
    }, 40);

    return () => clearTimeout(timer);
  }, [formattedNumber]);

  return (
    <div className={`t-reel inline-flex items-center font-variant-numeric tabular-nums select-none ${className}`}>
      {/* Hidden SVG Filter for Vertical Motion Streak */}
      <svg width="0" height="0" className="absolute pointer-events-none" style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="reel-motion-blur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0 2" />
          </filter>
        </defs>
      </svg>

      {prefix && <span className="mr-1">{prefix}</span>}

      {columns.map((col, idx) => {
        if (!col.isDigit) {
          // Non-digit characters (e.g. comma, space)
          return (
            <span key={`sym-${idx}`} className="inline-flex items-center justify-center px-0.5">
              {col.char}
            </span>
          );
        }

        const delay = (col.digitIndex || 0) * stagger;
        const transformStyle = isSpinning
          ? `translateY(-${col.targetOffset}em)`
          : 'translateY(0em)';
        const transitionStyle = isSpinning
          ? `transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`
          : 'none';

        return (
          <div key={`col-${idx}`} className="t-reel-col">
            <div
              className="t-reel-strip"
              style={{
                transform: transformStyle,
                transition: transitionStyle
              }}
            >
              {col.stripDigits.map((d, dIdx) => (
                <div key={`digit-${idx}-${dIdx}`} className="t-reel-digit">
                  {d}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {suffix && <span className="ml-1.5">{suffix}</span>}
    </div>
  );
}
