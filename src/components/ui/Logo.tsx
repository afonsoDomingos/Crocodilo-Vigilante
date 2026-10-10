import React from 'react';
import Link from 'next/link';

interface LogoProps {
  variant?: 'full' | 'compact' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  withLink?: boolean;
  className?: string;
}

export function CrocodiloIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Crocodilo Vigilante Símbolo"
    >
      <defs>
        <linearGradient id="shieldGoldGrad" x1="10" y1="5" x2="90" y2="95" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F2CC70" />
          <stop offset="50%" stopColor="#D9AD45" />
          <stop offset="100%" stopColor="#9C7721" />
        </linearGradient>
        <linearGradient id="innerShieldGrad" x1="50" y1="10" x2="50" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1E1E1E" />
          <stop offset="100%" stopColor="#0D0D0D" />
        </linearGradient>
        <linearGradient id="crocGoldGrad" x1="25" y1="20" x2="75" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFF2B2" />
          <stop offset="40%" stopColor="#F2CC70" />
          <stop offset="80%" stopColor="#D9AD45" />
          <stop offset="100%" stopColor="#B38626" />
        </linearGradient>
      </defs>

      {/* Outer Protection Shield */}
      <path
        d="M50 4L14 18V48C14 70 29 89 50 96C71 89 86 70 86 48V18L50 4Z"
        fill="url(#innerShieldGrad)"
        stroke="url(#shieldGoldGrad)"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Subtle Inner Contour Shield */}
      <path
        d="M50 11L21 22V47C21 65 33 80 50 86C67 80 79 65 79 47V22L50 11Z"
        stroke="url(#shieldGoldGrad)"
        strokeWidth="1"
        strokeOpacity="0.4"
      />

      {/* Stylized Vigilant Crocodile Head & Armor Scales (Geometric & Modern) */}
      {/* Crocodile Snout and Forehead Profile */}
      <path
        d="M32 32L50 24L68 32L72 44L64 54L50 50L36 54L28 44L32 32Z"
        fill="url(#crocGoldGrad)"
        stroke="#F2CC70"
        strokeWidth="0.8"
      />

      {/* Crocodile Upper Jaw Plates */}
      <path
        d="M50 24V50"
        stroke="#805C12"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M40 37L50 42L60 37"
        stroke="#805C12"
        strokeWidth="1.2"
        fill="none"
      />

      {/* Vigilant Eyes (Sharp Triangular Facets) */}
      <polygon points="38,34 44,36 39,38" fill="#FFFFFF" />
      <polygon points="62,34 56,36 61,38" fill="#FFFFFF" />

      {/* Lower Protective Jaw / Chest Scales */}
      <path
        d="M36 57L50 53L64 57L58 72L50 78L42 72L36 57Z"
        fill="url(#shieldGoldGrad)"
      />
      
      {/* Central Scale Ridge Line */}
      <path
        d="M50 53V78"
        stroke="#1E1E1E"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export default function Logo({
  variant = 'full',
  size = 'md',
  withLink = true,
  className = '',
}: LogoProps) {
  const sizeMap = {
    sm: { icon: 'w-7 h-7', text: 'text-base', sub: 'text-[9px]' },
    md: { icon: 'w-9 h-9', text: 'text-lg', sub: 'text-[10px]' },
    lg: { icon: 'w-12 h-12', text: 'text-2xl', sub: 'text-xs' },
    xl: { icon: 'w-16 h-16', text: 'text-3xl', sub: 'text-sm' },
  };

  const currentSize = sizeMap[size];

  const content = (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <div className="relative flex-shrink-0">
        <CrocodiloIcon className={currentSize.icon} />
      </div>

      {variant !== 'icon' && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5 font-black tracking-wider uppercase">
            <span className="text-white">CROCODILO</span>
            <span className="gold-gradient-text">VIGILANTE</span>
          </div>
          {variant === 'full' && (
            <span className="text-[#A3A3A3] font-medium tracking-widest uppercase mt-0.5" style={{ fontSize: currentSize.sub.replace('text-[', '').replace(']', '') }}>
              Segurança Privada Desarmada
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (withLink) {
    return (
      <Link href="/" className="inline-block transition-transform hover:opacity-95 active:scale-95" aria-label="Ir para a página inicial">
        {content}
      </Link>
    );
  }

  return content;
}
