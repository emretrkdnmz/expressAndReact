import React, { useMemo } from 'react';
import './AnimatedBackground.css';

const AnimatedBackground = React.memo(({ activeTheme = 'purple', isPlaying = false }) => {
  // 1. Purple theme floating notes
  const notes = useMemo(() => {
    if (activeTheme !== 'purple') return null;
    return Array.from({ length: 36 }).map((_, i) => {
      const left = Math.random() * 100;
      const animationDuration = (10 + Math.random() * 15) / (isPlaying ? 1.7 : 1);
      const animationDelay = Math.random() * 15;
      const opacity = 0.05 + Math.random() * 0.15;
      const fontSize = 18 + Math.random() * 28;
      const symbols = ['♪', '♫', '♬', '♩'];
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];

      return (
        <div 
          key={`note-${i}`} 
          className={`music-note ${isPlaying ? 'note-playing' : ''}`}
          style={{
            left: `${left}%`,
            animationDuration: `${animationDuration}s`,
            animationDelay: `-${animationDelay}s`,
            opacity,
            fontSize: `${fontSize}px`
          }}
        >
          {symbol}
        </div>
      );
    });
  }, [activeTheme, isPlaying]);

  // 2. Space theme twinkling stars
  const stars = useMemo(() => {
    if (activeTheme !== 'space') return null;
    return Array.from({ length: 68 }).map((_, i) => {
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const size = 1 + Math.random() * 2.5;
      const animationDuration = (1.5 + Math.random() * 3) / (isPlaying ? 1.8 : 1);
      const animationDelay = Math.random() * 4;

      return (
        <div 
          key={`star-${i}`} 
          className={`nebula-star ${isPlaying ? 'star-playing' : ''}`}
          style={{
            left: `${left}%`,
            top: `${top}%`,
            width: `${size}px`,
            height: `${size}px`,
            animationDuration: `${animationDuration}s`,
            animationDelay: `-${animationDelay}s`
          }}
        />
      );
    });
  }, [activeTheme, isPlaying]);

  // 3. Jungle theme fireflies
  const fireflies = useMemo(() => {
    if (activeTheme !== 'jungle') return null;
    return Array.from({ length: 55 }).map((_, i) => {
      const left = Math.random() * 100;
      const top = 10 + Math.random() * 90;
      const size = 3 + Math.random() * 4;
      const animationDuration = (5 + Math.random() * 8) / (isPlaying ? 1.7 : 1);
      const animationDelay = Math.random() * 8;

      return (
        <div 
          key={`firefly-${i}`} 
          className={`forest-firefly ${isPlaying ? 'firefly-playing' : ''}`}
          style={{
            left: `${left}%`,
            top: `${top}%`,
            width: `${size}px`,
            height: `${size}px`,
            animationDuration: `${animationDuration}s`,
            animationDelay: `-${animationDelay}s`
          }}
        />
      );
    });
  }, [activeTheme, isPlaying]);

  // 4. Light theme pastel bubbles
  const lightParticles = useMemo(() => {
    if (activeTheme !== 'light') return null;
    return Array.from({ length: 30 }).map((_, i) => {
      const left = Math.random() * 100;
      const size = 12 + Math.random() * 22;
      const animationDuration = (8 + Math.random() * 12) / (isPlaying ? 1.7 : 1);
      const animationDelay = Math.random() * 10;
      const opacity = 0.06 + Math.random() * 0.14;

      return (
        <div 
          key={`light-${i}`} 
          className={`light-bubble ${isPlaying ? 'bubble-playing' : ''}`}
          style={{
            left: `${left}%`,
            width: `${size}px`,
            height: `${size}px`,
            animationDuration: `${animationDuration}s`,
            animationDelay: `-${animationDelay}s`,
            opacity
          }}
        />
      );
    });
  }, [activeTheme, isPlaying]);

  // 5. Pure Dark OLED theme subtle drifting particles
  const darkParticles = useMemo(() => {
    if (activeTheme !== 'dark') return null;
    return Array.from({ length: 45 }).map((_, i) => {
      const left = Math.random() * 100;
      const size = 1.5 + Math.random() * 3.5;
      const animationDuration = (6 + Math.random() * 10) / (isPlaying ? 1.8 : 1);
      const animationDelay = Math.random() * 8;
      const opacity = 0.15 + Math.random() * 0.25;

      return (
        <div 
          key={`dark-p-${i}`} 
          className={`dark-particle ${isPlaying ? 'particle-playing' : ''}`}
          style={{
            left: `${left}%`,
            width: `${size}px`,
            height: `${size}px`,
            animationDuration: `${animationDuration}s`,
            animationDelay: `-${animationDelay}s`,
            opacity
          }}
        />
      );
    });
  }, [activeTheme, isPlaying]);

  // 6. Sunset theme floating particles
  const sunsetParticles = useMemo(() => {
    if (activeTheme !== 'sunset') return null;
    return Array.from({ length: 30 }).map((_, i) => {
      const left = Math.random() * 100;
      const bottom = -20 - Math.random() * 40;
      const size = 3 + Math.random() * 5;
      const animationDuration = (8 + Math.random() * 12) / (isPlaying ? 1.7 : 1);
      const animationDelay = Math.random() * 10;

      return (
        <div 
          key={`sunset-p-${i}`}
          className={`sunset-particle ${isPlaying ? 'sunset-playing' : ''}`}
          style={{
            left: `${left}%`,
            bottom: `${bottom}px`,
            width: `${size}px`,
            height: `${size}px`,
            animationDuration: `${animationDuration}s`,
            animationDelay: `-${animationDelay}s`
          }}
        />
      );
    });
  }, [activeTheme, isPlaying]);

  return (
    <div className={`animated-background theme-${activeTheme} ${isPlaying ? 'is-playing' : ''}`}>
      {/* 1. Purple elements */}
      {activeTheme === 'purple' && (
        <>
          <div className="gradient-pulse"></div>
          {notes}
        </>
      )}

      {/* 2. Aurora elements */}
      {activeTheme === 'aurora' && (
        <div className="aurora-container">
          <div className="aurora-blob blob-1"></div>
          <div className="aurora-blob blob-2"></div>
          <div className="aurora-blob blob-3"></div>
        </div>
      )}

      {/* 3. Sunset elements */}
      {activeTheme === 'sunset' && (
        <div className="sunset-container">
          <div className="sunset-sun"></div>
          <div className="sunset-glow-1"></div>
          <div className="sunset-glow-2"></div>
          <div className="sunset-particles">
            {sunsetParticles}
          </div>
        </div>
      )}

      {/* 4. Space elements */}
      {activeTheme === 'space' && (
        <div className="space-container">
          <div className="nebula-dust dust-1"></div>
          <div className="nebula-dust dust-2"></div>
          {stars}
        </div>
      )}

      {/* 5. Jungle elements */}
      {activeTheme === 'jungle' && (
        <div className="jungle-container">
          <div className="forest-mist"></div>
          {fireflies}
        </div>
      )}

      {/* 6. Light elements */}
      {activeTheme === 'light' && (
        <div className="light-container">
          <div className="light-glow-1"></div>
          <div className="light-glow-2"></div>
          {lightParticles}
        </div>
      )}

      {/* 7. OLED Dark elements */}
      {activeTheme === 'dark' && (
        <div className="dark-container">
          <div className="dark-glow"></div>
          {darkParticles}
        </div>
      )}
    </div>
  );
});

AnimatedBackground.displayName = 'AnimatedBackground';

export default AnimatedBackground;
