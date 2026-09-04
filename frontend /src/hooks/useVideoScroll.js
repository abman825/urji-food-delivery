import { useState, useEffect } from 'react';

export function useVideoScroll(containerRef, videoRef) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    const handleLoaded = () => video.pause();
    const handleScroll = () => {
      if (video.duration) {
        const rect = container.getBoundingClientRect();
        const totalScrollable = rect.height - window.innerHeight;
        const progress = Math.max(0, Math.min(1, -rect.top / totalScrollable));
        setScrollProgress(progress);
        video.currentTime = progress * video.duration;

        if (progress >= 0.25 && progress <= 0.88) {
          const stepProgress = (progress - 0.25) / (0.88 - 0.25);
          setActiveCardIndex(Math.min(5, Math.floor(stepProgress * 6)));
        }
      }
    };

    video.addEventListener('loadedmetadata', handleLoaded);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      video.removeEventListener('loadedmetadata', handleLoaded);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [containerRef, videoRef]);

  return { scrollProgress, activeCardIndex };
}