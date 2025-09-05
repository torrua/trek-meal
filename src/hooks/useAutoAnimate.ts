// src/hooks/useAutoAnimate.ts

import { useRef, useEffect, RefObject } from 'react';

export function useAutoAnimate<T extends HTMLElement>(): [RefObject<T>] {
  const elementRef = useRef<T>(null);
  const prevRectRef = useRef<DOMRect | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const ro = new ResizeObserver(() => {
      const newRect = element.getBoundingClientRect();

      if (prevRectRef.current && prevRectRef.current.height !== newRect.height) {
        const heightChange = newRect.height - prevRectRef.current.height;
        element.style.transition = 'none';

        requestAnimationFrame(() => {
          element.style.transform = `translateY(${-heightChange}px)`;
          element.style.opacity = '0';

          requestAnimationFrame(() => {
            element.style.transition = 'transform 300ms ease, opacity 300ms ease';
            element.style.transform = '';
            element.style.opacity = '1';
          });
        });
      }

      prevRectRef.current = newRect;
    });

    ro.observe(element);

    return () => ro.disconnect();
  }, []);

  return [elementRef];
}
