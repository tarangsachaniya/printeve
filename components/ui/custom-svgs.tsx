import React from "react";

export function BusinessCardSVG(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="10" y="18" width="38" height="24" rx="3" fill="#3B82F6" fillOpacity="0.5" />
      <rect x="16" y="24" width="38" height="24" rx="3" fill="#2563EB" />
      <circle cx="24" cy="32" r="4" fill="white" />
      <rect x="32" y="30" width="14" height="2" rx="1" fill="white" fillOpacity="0.9" />
      <rect x="32" y="34" width="10" height="2" rx="1" fill="white" fillOpacity="0.9" />
      <rect x="32" y="38" width="16" height="2" rx="1" fill="white" fillOpacity="0.9" />
    </svg>
  );
}

export function MarketingKitSVG(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M10 24C10 21.7909 11.7909 20 14 20H26L30 26H50C52.2091 26 54 27.7909 54 30V48C54 50.2091 52.2091 52 50 52H14C11.7909 52 10 50.2091 10 48V24Z"
        fill="#FBBF24"
      />
      <rect x="20" y="14" width="24" height="28" fill="white" rx="2" />
      <rect x="24" y="20" width="16" height="2" rx="1" fill="#E2E8F0" />
      <rect x="24" y="24" width="12" height="2" rx="1" fill="#E2E8F0" />
      <path
        d="M10 32C10 29.7909 11.7909 28 14 28H50C52.2091 28 54 29.7909 54 32V48C54 50.2091 52.2091 52 50 52H14C11.7909 52 10 50.2091 10 48V32Z"
        fill="#F59E0B"
      />
    </svg>
  );
}

export function PackagingSVG(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M32 16L54 28V48L32 60L10 48V28L32 16Z" fill="#D97706" />
      <path d="M32 16L54 28L32 40L10 28L32 16Z" fill="#FBBF24" />
      <path d="M10 28L32 40V60L10 48V28Z" fill="#B45309" />
      <path d="M32 40V60L54 48V28L32 40Z" fill="#D97706" />
      <path d="M26 25L38 31" stroke="#FDE68A" strokeWidth="4" strokeLinecap="round" />
      <path d="M32 40V52" stroke="#FDE68A" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function BannerSVG(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="18" y="52" width="28" height="6" rx="2" fill="#64748B" />
      <rect x="30" y="58" width="4" height="4" fill="#475569" />
      <rect x="30" y="10" width="4" height="44" fill="#94A3B8" />
      <rect x="22" y="14" width="20" height="36" fill="#3B82F6" />
      <rect x="26" y="20" width="12" height="4" rx="1" fill="white" fillOpacity="0.9" />
      <rect x="26" y="28" width="8" height="2" rx="1" fill="white" fillOpacity="0.8" />
      <rect x="26" y="32" width="10" height="2" rx="1" fill="white" fillOpacity="0.8" />
      <rect x="20" y="12" width="24" height="4" rx="1" fill="#475569" />
    </svg>
  );
}

export function FlyerSVG(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="16" y="8" width="32" height="48" rx="2" fill="#E2E8F0" />
      <rect x="20" y="14" width="24" height="16" rx="1" fill="#3B82F6" />
      <rect x="20" y="34" width="16" height="3" rx="1.5" fill="#94A3B8" />
      <rect x="20" y="40" width="24" height="2" rx="1" fill="#CBD5E1" />
      <rect x="20" y="44" width="24" height="2" rx="1" fill="#CBD5E1" />
      <rect x="20" y="48" width="18" height="2" rx="1" fill="#CBD5E1" />
    </svg>
  );
}

export function BrochureSVG(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M14 16L26 12V48L14 52V16Z" fill="#2563EB" />
      <path d="M26 12H38V48H26V12Z" fill="#3B82F6" />
      <path d="M38 12L50 16V52L38 48V12Z" fill="#60A5FA" />
      <rect x="29" y="18" width="6" height="2" fill="white" fillOpacity="0.8" />
      <rect x="29" y="22" width="6" height="2" fill="white" fillOpacity="0.8" />
    </svg>
  );
}

export function PosterSVG(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="14" y="10" width="36" height="44" rx="2" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
      <rect x="18" y="14" width="28" height="24" rx="1" fill="#0EA5E9" />
      <circle cx="38" cy="22" r="4" fill="#FDE047" />
      <path d="M18 38L24 28L30 38H18Z" fill="#0284C7" />
      <path d="M26 38L34 24L46 38H26Z" fill="#0369A1" />
      <rect x="18" y="42" width="20" height="3" rx="1.5" fill="#94A3B8" />
      <rect x="18" y="48" width="14" height="2" rx="1" fill="#CBD5E1" />
    </svg>
  );
}

export function StickerSVG(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="32" cy="32" r="20" fill="#EC4899" />
      <path d="M46 46C46 46 38 46 38 38C38 38 46 38 46 46Z" fill="white" />
      <path d="M46 46C46 46 38 46 38 38C38 46 46 46 46 46Z" fill="#BE185D" />
      <circle cx="32" cy="28" r="6" fill="white" fillOpacity="0.3" />
      <rect x="24" y="38" width="16" height="4" rx="2" fill="white" />
    </svg>
  );
}

export function BulkPrintingSVG(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M16 42L32 50L48 42V46L32 54L16 46V42Z" fill="#94A3B8" />
      <path d="M16 36L32 44L48 36V40L32 48L16 40V36Z" fill="#CBD5E1" />
      <path d="M16 30L32 38L48 30V34L32 42L16 34V30Z" fill="#E2E8F0" />
      <path d="M32 18L48 26L32 34L16 26L32 18Z" fill="#3B82F6" />
      <path d="M32 24L40 28L32 32L24 28L32 24Z" fill="#60A5FA" />
    </svg>
  );
}
