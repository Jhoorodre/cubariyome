import React, { useRef, useState, useEffect, useCallback } from 'react';
// CORREÇÃO: Voltando para o caminho de importação da v1, que é o que está no seu package.json
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/outline'; 
import { classNames } from '../utils/strings';

const ScrollableCarousel = ({ children }) => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollability = useCallback(() => {
    const el = scrollRef.current;
    if (el) {
      const isOverflowing = el.scrollWidth > el.clientWidth;
      // Adicionado um pequeno buffer de 1px para evitar erros de arredondamento do navegador
      setCanScrollLeft(isOverflowing && el.scrollLeft > 1);
      setCanScrollRight(isOverflowing && el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
    }
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateScrollability();

    const resizeObserver = new ResizeObserver(updateScrollability);
    resizeObserver.observe(el);

    window.addEventListener('resize', updateScrollability);
    
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateScrollability);
    };
  }, [children, updateScrollability]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = current.clientWidth * 0.8;
      current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="relative group">
      <div
        ref={scrollRef}
        onScroll={updateScrollability}
        className="flex space-x-4 overflow-x-auto no-scrollbar py-2"
      >
        {children}
      </div>

      <button
        onClick={() => scroll('left')}
        aria-label="Scroll left"
        className={classNames(
          "absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 p-2 bg-white/80 dark:bg-gray-800/80 text-gray-800 dark:text-white rounded-full shadow-md",
          "opacity-0 group-hover:opacity-100 transition-all duration-300",
          "hover:bg-white dark:hover:bg-gray-700 focus:outline-none",
          "disabled:opacity-0 disabled:cursor-not-allowed"
        )}
        disabled={!canScrollLeft}
      >
        <ArrowLeftIcon className="h-6 w-6" />
      </button>

      <button
        onClick={() => scroll('right')}
        aria-label="Scroll right"
        className={classNames(
          "absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 p-2 bg-white/80 dark:bg-gray-800/80 text-gray-800 dark:text-white rounded-full shadow-md",
          "opacity-0 group-hover:opacity-100 transition-all duration-300",
          "hover:bg-white dark:hover:bg-gray-700 focus:outline-none",
          "disabled:opacity-0 disabled:cursor-not-allowed"
        )}
        disabled={!canScrollRight}
      >
        <ArrowRightIcon className="h-6 w-6" />
      </button>
    </div>
  );
};

export default ScrollableCarousel;
