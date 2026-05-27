import { useState, useEffect, useRef } from 'react';

const useIntersectionObserver = (options = { threshold: 0.1, rootMargin: '0px 0px 200px 0px' }) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const targetRef = useRef(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    // Use .content-rounded as the scrolling root if it exists, otherwise use browser viewport
    const rootElement = document.querySelector('.content-rounded');

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsIntersecting(true);
        // Stop observing once it has intersected, because we only need to fetch once
        observer.unobserve(target);
      }
    }, { ...options, root: rootElement });

    observer.observe(target);

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, [options.threshold, options.rootMargin]); // Added basic dependencies, but usually options object is static

  return [targetRef, isIntersecting];
};

export default useIntersectionObserver;
