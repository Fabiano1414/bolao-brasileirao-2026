import { useEffect, useRef, useState } from 'react';
import { useInView } from '@/hooks/useInView';

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}

export const AnimatedCounter = ({
  value,
  prefix = '',
  suffix = '',
  duration = 2,
  className = ''
}: AnimatedCounterProps) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let startTime: number;
      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);

        const easeOutExpo = 1 - Math.pow(2, -10 * progress);
        setCount(Math.floor(easeOutExpo * value));

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }
  }, [isInView, value, duration]);

  return (
    <span
      ref={ref}
      className={`block transition-all duration-500 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'} ${className}`}
    >
      {prefix}{count.toLocaleString('pt-BR')}{suffix}
    </span>
  );
};
