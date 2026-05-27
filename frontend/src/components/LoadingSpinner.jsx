import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ fullScreen = false }) => {
  return (
    <div className={`loading-overlay ${fullScreen ? 'fullscreen' : ''}`}>
      <div className="music-svg-container">
        <svg viewBox="0 0 512 512" width="60" height="60" className="music-svg">
          <defs>
            <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="rgba(255, 255, 255, 0.4)" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <path 
            className="music-path"
            d="M499.1 6.3c8.1 6 12.9 15.6 12.9 25.7v72V368c0 44.2-43 80-96 80s-96-35.8-96-80s43-80 96-80c11.2 0 22 1.6 32 4.6V147L192 223.8V432c0 44.2-43 80-96 80s-96-35.8-96-80s43-80 96-80c11.2 0 22 1.6 32 4.6V200 128c0-14.1 9.3-26.6 22.8-30.7l320-96c9.7-2.9 20.2-1.1 28.3 5z" 
            fill="transparent" 
            stroke="url(#neonGradient)" 
            strokeWidth="12"
            filter="url(#glow)"
          />
          <path 
            d="M499.1 6.3c8.1 6 12.9 15.6 12.9 25.7v72V368c0 44.2-43 80-96 80s-96-35.8-96-80s43-80 96-80c11.2 0 22 1.6 32 4.6V147L192 223.8V432c0 44.2-43 80-96 80s-96-35.8-96-80s43-80 96-80c11.2 0 22 1.6 32 4.6V200 128c0-14.1 9.3-26.6 22.8-30.7l320-96c9.7-2.9 20.2-1.1 28.3 5z" 
            fill="rgba(255,255,255,0.05)"
          />
        </svg>
      </div>
    </div>
  );
};

export default LoadingSpinner;
