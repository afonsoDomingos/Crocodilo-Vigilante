import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
  variant?: 'full' | 'compact' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  withLink?: boolean;
  className?: string;
}

export function CrocodiloIcon({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <div className={`relative inline-flex items-center justify-center flex-shrink-0 ${className}`}>
      <Image
        src="/logo-crocodilo.png"
        alt="Crocodilo Vigilante"
        width={64}
        height={43}
        className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(217,173,69,0.35)]"
        priority
      />
    </div>
  );
}

export default function Logo({
  variant = 'full',
  size = 'md',
  withLink = true,
  className = '',
}: LogoProps) {
  const sizeMap = {
    sm: {
      imgW: 42,
      imgH: 28,
      imgClass: 'h-8 w-auto',
      title: 'text-sm font-black',
      sub: 'text-[9px]',
    },
    md: {
      imgW: 56,
      imgH: 37,
      imgClass: 'h-11 w-auto',
      title: 'text-base font-black',
      sub: 'text-[10px]',
    },
    lg: {
      imgW: 76,
      imgH: 51,
      imgClass: 'h-16 w-auto',
      title: 'text-xl font-black',
      sub: 'text-xs',
    },
    xl: {
      imgW: 105,
      imgH: 70,
      imgClass: 'h-24 w-auto',
      title: 'text-2xl font-black',
      sub: 'text-sm',
    },
  };

  const currentSize = sizeMap[size];

  const content = (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <div className="relative flex-shrink-0 flex items-center">
        <Image
          src="/logo-crocodilo.png"
          alt="Crocodilo Vigilante Segurança"
          width={currentSize.imgW}
          height={currentSize.imgH}
          className={`${currentSize.imgClass} object-contain filter drop-shadow-[0_3px_10px_rgba(217,173,69,0.4)] transition-transform duration-300 hover:scale-105`}
          priority
        />
      </div>

      {variant !== 'icon' && (
        <div className="flex flex-col leading-none justify-center">
          <div className={`flex items-center gap-1.5 tracking-wider uppercase ${currentSize.title}`}>
            <span className="text-white">CROCODILO</span>
            <span className="gold-gradient-text">VIGILANTE</span>
          </div>
          {variant === 'full' && (
            <span className={`text-[#A3A3A3] font-medium tracking-widest uppercase mt-0.5 ${currentSize.sub}`}>
              Segurança Privada Desarmada
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (withLink) {
    return (
      <Link
        href="/"
        className="inline-block transition-transform hover:opacity-95 active:scale-95"
        aria-label="Ir para a página inicial da Crocodilo Vigilante"
      >
        {content}
      </Link>
    );
  }

  return content;
}
