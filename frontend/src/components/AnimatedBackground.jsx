import React, { useMemo } from 'react';
import './AnimatedBackground.css';

const AnimatedBackground = React.memo(() => {
  // Rastgele müzik notaları oluşturuyoruz
  const notes = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => {
      const left = Math.random() * 100;
      const animationDuration = 15 + Math.random() * 20; // 15-35 saniye arası yavaş yükseliş
      const animationDelay = Math.random() * 15;
      const opacity = 0.05 + Math.random() * 0.15; // Çok hafif transparan
      const fontSize = 24 + Math.random() * 40; // Farklı boyutlar
      const symbols = ['♪', '♫', '♬', '♩'];
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];

      return (
        <div 
          key={i} 
          className="music-note"
          style={{
            left: `${left}%`,
            animationDuration: `${animationDuration}s`,
            animationDelay: `-${animationDelay}s`, // Ekranın yarısından başlaması için negatif delay
            opacity,
            fontSize: `${fontSize}px`
          }}
        >
          {symbol}
        </div>
      );
    });
  }, []);

  return (
    <div className="animated-background">
      <div className="gradient-pulse"></div>
      {notes}
    </div>
  );
});

export default AnimatedBackground;
