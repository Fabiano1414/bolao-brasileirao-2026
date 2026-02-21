import { useState, useEffect } from 'react';
import type { RefObject } from 'react';

export function useInView(ref: RefObject<Element | null>, options?: { once?: boolean; margin?: string }) {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsInView(true);
        else if (!options?.once) setIsInView(false);
      },
      { threshold: 0.1, rootMargin: options?.margin ?? '0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, options?.once, options?.margin]);

  return isInView;
}
