import React from 'react';

function SvgWrapper({ children, size = 24, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.25)] ${className}`}
    >
      {children}
    </svg>
  );
}

export default function PlanetIcon({ name, size = 24, className = '' }) {
  const strokeProps = { stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };

  switch (name) {
    case 'Sol':
      return (
        <SvgWrapper size={size} className={className}>
          <circle cx="12" cy="12" r="4.5" {...strokeProps} />
          {[...Array(8)].map((_, i) => {
            const a = (i * Math.PI) / 4;
            const x1 = 12 + Math.cos(a) * 7.5;
            const y1 = 12 + Math.sin(a) * 7.5;
            const x2 = 12 + Math.cos(a) * 10.5;
            const y2 = 12 + Math.sin(a) * 10.5;
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} {...strokeProps} />;
          })}
        </SvgWrapper>
      );
    case 'Lua':
      return (
        <SvgWrapper size={size} className={className}>
          <path d="M14.5 4.5A7.5 7.5 0 1 0 19.5 15a6 6 0 0 1-5-10.5z" {...strokeProps} />
        </SvgWrapper>
      );
    case 'Mercúrio':
      return (
        <SvgWrapper size={size} className={className}>
          <circle cx="12" cy="11" r="3.5" {...strokeProps} />
          <path d="M8.5 6.5c1 1.2 2.4 2 3.5 2s2.5-.8 3.5-2M12 14.5v4M9.5 17h5" {...strokeProps} />
        </SvgWrapper>
      );
    case 'Vênus':
      return (
        <SvgWrapper size={size} className={className}>
          <circle cx="12" cy="9" r="4" {...strokeProps} />
          <path d="M12 13v6M9.5 16h5" {...strokeProps} />
        </SvgWrapper>
      );
    case 'Marte':
      return (
        <SvgWrapper size={size} className={className}>
          <circle cx="10" cy="14" r="4" {...strokeProps} />
          <path d="M13 11l5-5M14.5 6H18v3.5" {...strokeProps} />
        </SvgWrapper>
      );
    case 'Júpiter':
      return (
        <SvgWrapper size={size} className={className}>
          <path d="M6.5 9.5h8c1.9 0 2.8 2.3 1.4 3.6-.7.7-1.6.9-2.6.9H9.5M13 6.5v11" {...strokeProps} />
        </SvgWrapper>
      );
    case 'Saturno':
      return (
        <SvgWrapper size={size} className={className}>
          <circle cx="12" cy="12" r="4" {...strokeProps} />
          <ellipse cx="12" cy="12" rx="8" ry="3.5" {...strokeProps} />
        </SvgWrapper>
      );
    case 'Urano':
      return (
        <SvgWrapper size={size} className={className}>
          <circle cx="12" cy="12" r="3.5" {...strokeProps} />
          <path d="M12 3v5M12 16v5M7 12H3M21 12h-4" {...strokeProps} />
        </SvgWrapper>
      );
    case 'Netuno':
      return (
        <SvgWrapper size={size} className={className}>
          <path d="M7 6c0 3 2.2 5 5 5s5-2 5-5M12 11v9M9 20h6" {...strokeProps} />
        </SvgWrapper>
      );
    case 'Plutão':
      return (
        <SvgWrapper size={size} className={className}>
          <circle cx="10" cy="10" r="3" {...strokeProps} />
          <path d="M14 7v10M9 17h6" {...strokeProps} />
        </SvgWrapper>
      );
    default:
      return (
        <SvgWrapper size={size} className={className}>
          <circle cx="12" cy="12" r="4" {...strokeProps} />
        </SvgWrapper>
      );
  }
}

