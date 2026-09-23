import React from 'react';
import {
  Menu,
  ShieldCheck,
  ChevronDown,
  User,
  Globe,
} from 'lucide-react';
import { useAgent } from '../../context/AgentContext';

export const Header: React.FC = () => {
  const { setActiveView, currentLanguage, setIsLanguageModalOpen, userProfile } = useAgent();

  return (
    <header
      id="app_header"
      className="
        relative
        z-50
        flex
        h-[64px]
        w-full
        shrink-0
        items-center
        justify-between
        rounded-2xl
        border
        border-[#10B981]/25
        bg-black/30
        px-4
        sm:px-6
        backdrop-blur-[24px]
        shadow-[0_8px_32px_rgba(1,20,13,0.35)]
        transition-all
      "
    >
      {/* Sleek specular light trails */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#10B981]/30 to-transparent" />

      {/* LEFT: Menu + Brand Logo (MOCKUP ACCURATE) */}
      <div className="flex min-w-0 items-center gap-1 sm:gap-2">
        {/* Hamburger Menu (Mockup Style) */}
        <button
          id="btn_header_menu"
          onClick={() => setActiveView('dashboard')}
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            text-white/80
            transition-all
            hover:bg-white/[0.08]
            hover:text-white
            group
          "
          aria-label="Toggle menu"
        >
          <svg
            className="h-7 w-7 sm:h-8 sm:w-8 text-current transition-all group-hover:scale-105"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            {/* Top line */}
            <line x1="4" y1="6" x2="20" y2="6" />
            {/* Middle line offset */}
            <line x1="4" y1="12" x2="16" y2="12" />
            {/* Bottom line */}
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        </button>

        {/* Brand Lockup with holographic green A-logo */}
        <div
          onClick={() => setActiveView('dashboard')}
          className="flex items-center gap-1.5 sm:gap-2 cursor-pointer select-none"
        >
          {/* Real Green logo.png Logo */}
          <div className="relative flex h-9 w-9 items-center justify-center">
            <img
              src={`${import.meta.env.BASE_URL}logo.png`}
              alt="AI-Agents Logo"
              className="relative h-8 w-8 object-contain"
            />
          </div>

          <div className="leading-none">
            <div className="flex items-center gap-1.5 text-[9px] xs:text-[11px] sm:text-[14px] md:text-[15px] font-black tracking-widest text-white whitespace-nowrap">
              AI-AGENTS
            </div>
            <div className="mt-0.5 text-[6px] xs:text-[7px] sm:text-[8px] font-bold tracking-[0.16em] xs:tracking-[0.24em] text-[#94A3B8] whitespace-nowrap">
              Agent-forest08
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: Online status, country language dropdown, user profile (MOCKUP ACCURATE) */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* "Online" status pill */}
        <div
          id="header_security_pill"
          className="
            flex
            items-center
            gap-1
            sm:gap-1.5
            rounded-full
            border
            border-[#00D9A5]/30
            bg-[#02140d]/60
            px-2
            py-0.5
            sm:px-3
            sm:py-1
            text-[9px]
            xs:text-[10px]
            sm:text-[11px]
            font-bold
            text-white/90
            shadow-[0_0_12px_rgba(0,217,165,0.15)]
          "
        >
          <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D9A5] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-[#00D9A5]"></span>
          </span>
          <span>Online</span>
        </div>

        {/* Language dropdown button */}
        <button
          id="btn_language_mode_header"
          onClick={() => setIsLanguageModalOpen(true)}
          className="
            flex
            items-center
            gap-1
            sm:gap-1.5
            rounded-full
            border
            border-white/10
            bg-white/[0.06]
            px-2
            py-0.5
            sm:px-3
            sm:py-1
            text-[9px]
            xs:text-[10px]
            sm:text-[11px]
            font-medium
            text-[#E2E8F0]
            transition-all
            hover:border-[#00D9A5]/40
            hover:bg-[#10B981]/10
          "
        >
          <span className="text-[10px] sm:text-xs">
            {currentLanguage?.flag || '🇺🇸'}
          </span>
          <span className="font-semibold text-white/95">
            {currentLanguage?.id === 'en' ? 'US' : currentLanguage?.id?.toUpperCase() || 'US'}
          </span>
          <ChevronDown className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-white/60" />
        </button>

        {/* User profile picture */}
        <div
          id="header_user_avatar"
          onClick={() => setActiveView('profile')}
          className="
            relative
            flex
            h-9
            w-9
            items-center
            justify-center
            cursor-pointer
            rounded-full
            p-[1.5px]
            bg-gradient-to-r
            from-[#00D9A5]
            to-[#10B981]
            shadow-[0_0_15px_rgba(0,217,165,0.4)]
            hover:scale-105
            transition-transform
          "
          title="User Profile & Settings"
        >
          <div className="flex h-full w-full items-center justify-center rounded-full overflow-hidden bg-black/40">
            {userProfile.profileImage ? (
              <img src={userProfile.profileImage} alt={userProfile.name} className="h-full w-full object-cover rounded-full" />
            ) : (
              <User className="h-4 w-4 text-white fill-white/80" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
