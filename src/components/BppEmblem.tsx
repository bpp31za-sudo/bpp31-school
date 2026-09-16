import React from 'react';

interface BppEmblemProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * ตราสัญลักษณ์ตำรวจตระเวนชายแดน (Border Patrol Police Crest)
 * พร้อมโล่เขียวพรานไพร แถบทอง และดาวตำรวจ
 */
export const BppEmblem: React.FC<BppEmblemProps> = ({ className = '', size = 'md' }) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 ${sizeMap[size]} ${className}`}
      title="กองกำกับการตำรวจตระเวนชายแดนที่ 31"
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-md"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#14532d" />
            <stop offset="50%" stopColor="#166534" />
            <stop offset="100%" stopColor="#0f3d24" />
          </linearGradient>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="40%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#ca8a04" />
          </linearGradient>
          <linearGradient id="maroonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#991b1b" />
            <stop offset="100%" stopColor="#450a0a" />
          </linearGradient>
        </defs>

        {/* Outer Golden Border Shield */}
        <path
          d="M50 5 L88 20 C88 56 68 85 50 95 C32 85 12 56 12 20 Z"
          fill="url(#goldGrad)"
          stroke="#a16207"
          strokeWidth="1.5"
        />

        {/* Inner Green Shield (BPP Hunter Green) */}
        <path
          d="M50 9 L83 23 C83 54 65 80 50 89 C35 80 17 54 17 23 Z"
          fill="url(#shieldGrad)"
          stroke="#facc15"
          strokeWidth="1.5"
        />

        {/* Top Maroon Ribbon Header */}
        <path
          d="M25 24 Q50 18 75 24 L72 32 Q50 26 28 32 Z"
          fill="url(#maroonGrad)"
          stroke="#fde047"
          strokeWidth="0.75"
        />

        {/* Gold Star at center top */}
        <polygon
          points="50,22 52,27 57,27 53,30 55,35 50,32 45,35 47,30 43,27 48,27"
          fill="#fef08a"
          stroke="#ca8a04"
          strokeWidth="0.5"
        />

        {/* Police Wheel / Chakr Symbol */}
        <circle cx="50" cy="50" r="16" fill="#14532d" stroke="url(#goldGrad)" strokeWidth="2.5" />
        <circle cx="50" cy="50" r="11" fill="#0f3d24" stroke="#fef08a" strokeWidth="1" />

        {/* 8 spokes / sun rays */}
        <line x1="50" y1="36" x2="50" y2="42" stroke="#facc15" strokeWidth="2" strokeLinecap="round" />
        <line x1="50" y1="58" x2="50" y2="64" stroke="#facc15" strokeWidth="2" strokeLinecap="round" />
        <line x1="36" y1="50" x2="42" y2="50" stroke="#facc15" strokeWidth="2" strokeLinecap="round" />
        <line x1="58" y1="50" x2="64" y2="50" stroke="#facc15" strokeWidth="2" strokeLinecap="round" />
        <line x1="40" y1="40" x2="44" y2="44" stroke="#facc15" strokeWidth="1.75" strokeLinecap="round" />
        <line x1="56" y1="56" x2="60" y2="60" stroke="#facc15" strokeWidth="1.75" strokeLinecap="round" />
        <line x1="40" y1="60" x2="44" y2="56" stroke="#facc15" strokeWidth="1.75" strokeLinecap="round" />
        <line x1="56" y1="44" x2="60" y2="40" stroke="#facc15" strokeWidth="1.75" strokeLinecap="round" />

        {/* Golden Diamond Core */}
        <polygon points="50,45 55,50 50,55 45,50" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.75" />

        {/* Text 31 on emblem */}
        <text
          x="50"
          y="76"
          textAnchor="middle"
          fill="#fef08a"
          fontWeight="bold"
          fontSize="10"
          fontFamily="sans-serif"
          stroke="#713f12"
          strokeWidth="0.5"
          letterSpacing="0.5"
        >
          ตชด.๓๑
        </text>

        {/* Bottom Banner Ribbon */}
        <path
          d="M26 80 Q50 86 74 80 L76 86 Q50 92 24 86 Z"
          fill="url(#goldGrad)"
          stroke="#854d0e"
          strokeWidth="0.5"
        />
        <text
          x="50"
          y="85.5"
          textAnchor="middle"
          fill="#451a03"
          fontWeight="bold"
          fontSize="5.5"
          fontFamily="sans-serif"
        >
          บก.ตชด.ภาค ๓
        </text>
      </svg>
    </div>
  );
};
