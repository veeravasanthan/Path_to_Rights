/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function BrandLogo({ className = '', size = 'md' }: BrandLogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  return (
    <svg 
      viewBox="0 0 200 200" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`${sizeClasses[size]} ${className}`}
    >
      <defs>
        {/* Pathway gradient - transitioning from brilliant gold to warm amber under the scales */}
        <linearGradient id="pathwayGrad" x1="100" y1="190" x2="100" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#EA580C" stopOpacity="0.9" /> {/* orange-600 */}
          <stop offset="60%" stopColor="#D97706" /> {/* amber-600 */}
          <stop offset="100%" stopColor="#F59E0B" /> {/* amber-500 */}
        </linearGradient>

        {/* Scales gradient - luxury metallic gold shine */}
        <linearGradient id="scalesGrad" x1="30" y1="50" x2="170" y2="150" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F59E0B" /> {/* amber-500 */}
          <stop offset="35%" stopColor="#FBBF24" /> {/* amber-400 */}
          <stop offset="70%" stopColor="#D97706" /> {/* amber-600 */}
          <stop offset="100%" stopColor="#B45309" /> {/* amber-700 */}
        </linearGradient>

        <filter id="softGlow" x="-10%" y="-10%" width="120%" height="120%" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#D97706" floodOpacity="0.15" />
        </filter>
      </defs>

      {/* 1. Curved Pathway ('Vazhi') - runs forward from the horizon deep under the scales */}
      <path 
        d="M 100 80 
           C 95 90, 85 140, 40 190 
           L 160 190 
           C 115 140, 105 90, 100 80 Z" 
        fill="url(#pathwayGrad)" 
        opacity="0.85"
      />
      
      {/* 2. Dotted Center Line of the Pathway (representing the guidance of the application) */}
      <path 
        d="M 100 85 C 99 110, 94 150, 100 190" 
        stroke="#FEF3C7" 
        strokeWidth="3.5" 
        strokeDasharray="8 6" 
        strokeLinecap="round"
        opacity="0.9"
      />

      {/* 3. The Pillar/Plinth (Base of the Scales of Justice) */}
      {/* Plinth Base */}
      <path 
        d="M 65 155 L 135 155 C 135 155, 130 147, 120 147 L 80 147 C 70 147, 65 155, 65 155 Z" 
        fill="url(#scalesGrad)" 
      />
      {/* Pillar Stem */}
      <rect 
        x="95" 
        y="50" 
        width="10" 
        height="100" 
        rx="2" 
        fill="url(#scalesGrad)" 
        filter="url(#softGlow)"
      />
      <circle 
        cx="100" 
        cy="45" 
        r="8" 
        fill="url(#scalesGrad)" 
      />

      {/* 4. Crossbeam of the Scales (balanced horizontally, perfectly fair) */}
      <path 
        d="M 40 65 
           C 55 58, 80 52, 100 52 
           C 120 52, 145 58, 160 65 
           L 160 70 
           C 145 63, 120 57, 100 57 
           C 80 57, 55 63, 40 70 Z" 
        fill="url(#scalesGrad)" 
      />

      {/* 5. Left Hanging Pan */}
      {/* Hanger cords */}
      <path d="M 40 68 L 22 108 M 40 68 L 58 108" stroke="url(#scalesGrad)" strokeWidth="2" strokeLinecap="round" />
      {/* Left Pan */}
      <path 
        d="M 15 108 C 15 125, 65 125, 65 108 Z" 
        fill="url(#scalesGrad)" 
        filter="url(#softGlow)"
      />

      {/* 6. Right Hanging Pan */}
      {/* Hanger cords */}
      <path d="M 160 68 L 142 108 M 160 68 L 178 108" stroke="url(#scalesGrad)" strokeWidth="2" strokeLinecap="round" />
      {/* Right Pan */}
      <path 
        d="M 135 108 C 135 125, 185 125, 185 108 Z" 
        fill="url(#scalesGrad)" 
        filter="url(#softGlow)"
      />
    </svg>
  );
}
