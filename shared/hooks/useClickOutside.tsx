'use client';
import { useEffect, useRef, useCallback } from 'react';

const useClickOutside = (toggle: () => void) => {
  const divRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (divRef.current && !divRef.current.contains(event.target as Node)) {
        if (toggle && typeof toggle === 'function') {
          toggle();
        }
      }
    },
    [toggle],
  );

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      handleClickOutside(event);
    };

    window.addEventListener('mousedown', handleClick);

    return () => {
      window.removeEventListener('mousedown', handleClick);
    };
  }, [handleClickOutside]);

  return divRef;
};

export default useClickOutside;

// We use useCallback to memoize the handleClickOutside function. This ensures that the function only changes if the toggle function changes.
