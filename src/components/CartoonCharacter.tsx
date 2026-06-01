'use client';

import React from 'react';

export type CharacterType = 'dino' | 'bear';
export type CharacterState = 'idle' | 'speaking' | 'celebrating' | 'sad';

interface CartoonCharacterProps {
  type: CharacterType;
  state: CharacterState;
  onClick?: () => void;
  className?: string;
}

export default function CartoonCharacter({ type, state, onClick, className = 'w-40 h-40 md:w-64 md:h-64' }: CartoonCharacterProps) {
  // Common style classes based on states
  const getBodyClass = () => {
    switch (state) {
      case 'celebrating':
        return 'animate-bounce origin-bottom';
      case 'speaking':
        return 'origin-bottom';
      case 'sad':
        return 'translate-y-2 duration-300';
      case 'idle':
      default:
        return 'animate-float origin-bottom';
    }
  };

  const getMouthHeight = () => {
    switch (state) {
      case 'speaking':
        return '16'; // Dynamic in CSS via animate-mouth-speak but standard fallback
      case 'celebrating':
        return '24'; // Wide open happy smile
      case 'sad':
        return '4';   // Tiny unhappy line (curved down or straight)
      case 'idle':
      default:
        return '8';   // Gentle normal smile
    }
  };

  const getEyeExpression = () => {
    switch (state) {
      case 'celebrating':
        // Happy squinty eyes ^^
        return (
          <>
            {/* Left Eye Happy */}
            <path d="M 32 42 Q 40 34 48 42" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" fill="none" />
            {/* Right Eye Happy */}
            <path d="M 72 42 Q 80 34 88 42" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" fill="none" />
          </>
        );
      case 'sad':
        // Concerned/downward sloping eyes
        return (
          <>
            {/* Left Eye Sad */}
            <path d="M 34 38 Q 42 44 48 38" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" fill="none" />
            <circle cx="40" cy="44" r="5" fill="#1e293b" />
            {/* Right Eye Sad */}
            <path d="M 72 38 Q 78 44 86 38" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" fill="none" />
            <circle cx="80" cy="44" r="5" fill="#1e293b" />
          </>
        );
      case 'speaking':
      case 'idle':
      default:
        // Wide cute shiny eyes
        return (
          <>
            {/* Left Eye */}
            <circle cx="42" cy="42" r="9" fill="#1e293b" />
            <circle cx="44" cy="39" r="3.5" fill="#ffffff" />
            <circle cx="39" cy="44" r="1.5" fill="#ffffff" />
            
            {/* Right Eye */}
            <circle cx="78" cy="42" r="9" fill="#1e293b" />
            <circle cx="80" cy="39" r="3.5" fill="#ffffff" />
            <circle cx="75" cy="44" r="1.5" fill="#ffffff" />
          </>
        );
    }
  };

  const getCheekColor = () => {
    return state === 'sad' ? '#94a3b8' : '#f43f5e';
  };

  return (
    <div 
      className={`relative mx-auto cursor-pointer select-none transition-all duration-300 ${className} ${getBodyClass()}`}
      onClick={onClick}
    >
      {/* Background Speech Bubble Ring when speaking */}
      {state === 'speaking' && (
        <span className="absolute inset-0 rounded-full bg-yellow-300 opacity-25 animate-ping -z-10" />
      )}

      {type === 'dino' ? (
        /* ==================== CUTE DINO SVG ==================== */
        <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-lg">
          {/* Dino Spikes */}
          <path d="M 28 20 L 15 28 L 26 38 Z" fill="#22c55e" />
          <path d="M 20 40 L 5 50 L 18 60 Z" fill="#22c55e" />
          <path d="M 18 65 L 2 75 L 18 85 Z" fill="#22c55e" />

          {/* Dino Tail */}
          <path d="M 30 90 Q 5 110 20 115 Q 40 110 45 95 Z" fill="#4ade80" />
          <path d="M 10 102 L 2 108 L 12 112 Z" fill="#22c55e" />

          {/* Dino Main Body */}
          <rect x="25" y="30" width="70" height="70" rx="35" fill="#4ade80" />
          <circle cx="60" cy="45" r="35" fill="#4ade80" />

          {/* Dino Belly (Yellow Pastel patch) */}
          <path d="M 50 65 Q 60 55 70 65 Q 85 85 70 100 Q 50 100 50 65 Z" fill="#fef08a" />

          {/* Eyes Section */}
          {getEyeExpression()}

          {/* Blushing Cheeks */}
          <circle cx="31" cy="50" r="5" fill={getCheekColor()} opacity="0.6" />
          <circle cx="89" cy="50" r="5" fill={getCheekColor()} opacity="0.6" />

          {/* Dino Nose (Cute nostrils) */}
          <circle cx="56" cy="49" r="2.5" fill="#15803d" />
          <circle cx="64" cy="49" r="2.5" fill="#15803d" />

          {/* Mouth Section */}
          {state === 'sad' ? (
            // Sad curved mouth
            <path d="M 50 62 Q 60 54 70 62" stroke="#1e293b" strokeWidth="4.5" strokeLinecap="round" fill="none" />
          ) : state === 'speaking' ? (
            // Animated speaking mouth
            <ellipse 
              cx="60" 
              cy="62" 
              rx="10" 
              ry={getMouthHeight()} 
              fill="#be123c" 
              stroke="#1e293b" 
              strokeWidth="3"
              className="animate-mouth-speak origin-center" 
            />
          ) : (
            // Normal smiling / celebrating mouth
            <path 
              d={`M 50 59 Q 60 ${59 + parseInt(getMouthHeight())} 70 59`} 
              stroke="#1e293b" 
              strokeWidth="4.5" 
              strokeLinecap="round" 
              fill={state === 'celebrating' ? '#be123c' : 'none'} 
            />
          )}

          {/* Tiny Cute Dino Arms */}
          {state === 'celebrating' ? (
            // Arms raised up celebrating
            <>
              <path d="M 28 65 Q 18 50 25 45" stroke="#4ade80" strokeWidth="9" strokeLinecap="round" fill="none" />
              <path d="M 92 65 Q 102 50 95 45" stroke="#4ade80" strokeWidth="9" strokeLinecap="round" fill="none" />
            </>
          ) : (
            // Normal arms down/relaxed
            <>
              <path d="M 28 65 Q 18 75 26 80" stroke="#4ade80" strokeWidth="9" strokeLinecap="round" fill="none" />
              <path d="M 92 65 Q 102 75 94 80" stroke="#4ade80" strokeWidth="9" strokeLinecap="round" fill="none" />
            </>
          )}

          {/* Tiny Dino Feet */}
          <circle cx="48" cy="102" r="7" fill="#22c55e" />
          <circle cx="72" cy="102" r="7" fill="#22c55e" />
        </svg>
      ) : (
        /* ==================== CUTE BEAR SVG ==================== */
        <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-lg">
          {/* Bear Left Ear */}
          <circle cx="30" cy="28" r="16" fill="#b45309" />
          <circle cx="30" cy="28" r="9" fill="#fbcfe8" />

          {/* Bear Right Ear */}
          <circle cx="90" cy="28" r="16" fill="#b45309" />
          <circle cx="90" cy="28" r="9" fill="#fbcfe8" />

          {/* Bear Head & Body */}
          <rect x="25" y="45" width="70" height="55" rx="25" fill="#d97706" />
          <circle cx="60" cy="55" r="34" fill="#d97706" />

          {/* Bear Muzzle (Whiter mouth area) */}
          <ellipse cx="60" cy="65" rx="17" ry="12" fill="#fef3c7" />

          {/* Eyes Section */}
          {getEyeExpression()}

          {/* Blushing Cheeks */}
          <circle cx="34" cy="56" r="4.5" fill={getCheekColor()} opacity="0.6" />
          <circle cx="86" cy="56" r="4.5" fill={getCheekColor()} opacity="0.6" />

          {/* Bear Nose (Cute button nose) */}
          <path d="M 56 59 L 64 59 L 60 63 Z" fill="#1e293b" stroke="#1e293b" strokeWidth="1.5" strokeLinejoin="round" />

          {/* Mouth Section */}
          {state === 'sad' ? (
            // Sad curved mouth
            <path d="M 53 71 Q 60 66 67 71" stroke="#1e293b" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          ) : state === 'speaking' ? (
            // Animated speaking mouth
            <ellipse 
              cx="60" 
              cy="70" 
              rx="7" 
              ry={getMouthHeight() === '16' ? 12 : 6} 
              fill="#be123c" 
              stroke="#1e293b" 
              strokeWidth="2.5"
              className="animate-mouth-speak origin-center" 
            />
          ) : (
            // Smiling mouth
            <path 
              d={`M 53 68 Q 60 ${68 + parseInt(getMouthHeight()) * 0.6} 67 68`} 
              stroke="#1e293b" 
              strokeWidth="3.5" 
              strokeLinecap="round" 
              fill={state === 'celebrating' ? '#be123c' : 'none'} 
            />
          )}

          {/* Cute Bear Paws */}
          {state === 'celebrating' ? (
            <>
              <circle cx="28" cy="65" r="7.5" fill="#b45309" className="animate-bounce" />
              <circle cx="92" cy="65" r="7.5" fill="#b45309" className="animate-bounce" />
            </>
          ) : (
            <>
              <circle cx="30" cy="85" r="7.5" fill="#b45309" />
              <circle cx="90" cy="85" r="7.5" fill="#b45309" />
            </>
          )}

          {/* Bear Legs */}
          <circle cx="45" cy="100" r="9" fill="#b45309" />
          <circle cx="75" cy="100" r="9" fill="#b45309" />
        </svg>
      )}

      {/* Floating Sparkles when celebrating */}
      {state === 'celebrating' && (
        <div className="absolute inset-0 pointer-events-none">
          <span className="absolute top-2 left-6 text-2xl animate-bounce" style={{ animationDelay: '0.1s' }}>⭐</span>
          <span className="absolute top-0 right-8 text-xl animate-bounce" style={{ animationDelay: '0.3s' }}>✨</span>
          <span className="absolute bottom-6 left-2 text-xl animate-pulse">🎉</span>
          <span className="absolute bottom-12 right-2 text-2xl animate-bounce" style={{ animationDelay: '0.5s' }}>⭐</span>
        </div>
      )}
    </div>
  );
}
