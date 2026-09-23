import React from 'react';
import {
  Home,
  MessageSquare,
  CheckSquare,
  ShieldCheck,
  Activity,
  FileText,
  Folder,
  Settings,
  User,
  Download,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useAgent, ActiveView } from '../../context/AgentContext';

export const Sidebar: React.FC = () => {
  const { activeView, setActiveView, tasks, approvals, setIsInstallModalOpen } = useAgent();

  const handleInstallClick = () => {
    setIsInstallModalOpen(true);
  };

  const navItems: {
    id: ActiveView;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }[] = [
    {
      id: 'dashboard',
      label: 'Home',
      icon: Home,
    },
    {
      id: 'profile',
      label: 'Agent Library',
      icon: User,
    },
    {
      id: 'chat',
      label: 'Chat',
      icon: MessageSquare,
    },
    {
      id: 'ailab',
      label: 'Workflows',
      icon: Sparkles,
    },
    {
      id: 'tasks',
      label: 'Tools',
      icon: CheckSquare,
      badge: 3,
    },
    {
      id: 'approvals',
      label: 'Knowledge',
      icon: ShieldCheck,
      badge: 1,
    },
    {
      id: 'activity',
      label: 'Activity',
      icon: Activity,
    },
    {
      id: 'results',
      label: 'History',
      icon: FileText,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
    },
    {
      id: 'files',
      label: 'Files',
      icon: Folder,
    },
  ];

  return (
    <aside
      id="app_sidebar"
      className="
        relative
        flex
        h-full
        w-[95px]
        xs:w-[110px]
        sm:w-[135px]
        md:w-[170px]
        lg:w-[195px]
        shrink-0
        flex-col
        rounded-2xl
        border
        border-[#10B981]/25
        bg-black/35
        p-2
        sm:p-3
        backdrop-blur-[24px]
        shadow-[0_8px_32px_rgba(1,20,13,0.35)]
        transition-all
      "
    >
      {/* Sidebar background leaf particles subtle shadow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
        <div className="absolute -left-12 bottom-10 h-48 w-48 rounded-full bg-[#10B981]/15 blur-[80px]" />
      </div>

      {/* Navigation List */}
      <div className="relative z-10 flex flex-1 flex-col py-1 overflow-y-auto no-scrollbar">
        <nav className="space-y-1 sm:space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                id={`sidebar_nav_${item.id}`}
                onClick={() => setActiveView(item.id)}
                className={`
                  group
                  relative
                  flex
                  w-full
                  items-center
                  gap-1.5
                  sm:gap-2.5
                  rounded-xl
                  px-2
                  sm:px-3
                  py-2
                  sm:py-2.5
                  text-left
                  transition-all
                  duration-200
                  ${
                    isActive
                      ? `
                        bg-gradient-to-r
                        from-[#065f46]
                        via-[#022c22]
                        to-[#10B981]
                        text-white
                        border
                        border-white/20
                        shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_0_15px_rgba(16,185,129,0.4)]
                      `
                      : `
                        text-white/60
                        hover:bg-white/[0.05]
                        hover:text-white
                      `
                  }
                `}
              >
                {/* Icon */}
                <Icon
                  className={`
                    h-3.5
                    w-3.5
                    sm:h-4.5
                    sm:w-4.5
                    shrink-0
                    transition-all
                    ${isActive ? 'text-[#00D9A5] drop-shadow-[0_0_6px_#00D9A5]' : 'group-hover:text-[#00D9A5]'}
                  `}
                />

                {/* Label */}
                <span className="hidden sm:block flex-1 text-xs font-semibold tracking-tight truncate">
                  {item.label}
                </span>

                {/* Badge (Mockup Accurate circular green badges) */}
                {item.badge !== undefined && (
                  <span
                    className="
                      flex
                      h-4.5
                      w-4.5
                      items-center
                      justify-center
                      rounded-full
                      bg-[#00D9A5]
                      text-black
                      text-[9px]
                      font-bold
                      shadow-[0_0_8px_rgba(0,217,165,0.7)]
                    "
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom PWA button + High fidelity decorative brand card */}
      <div className="relative z-10 pt-2 shrink-0 space-y-2">
        {/* PWA Install Button styled identically to image ("Install Agent >") */}
        <button
          id="btn_sidebar_install_app"
          onClick={handleInstallClick}
          className="
            flex
            w-full
            items-center
            justify-between
            rounded-xl
            border
            border-[#00D9A5]/40
            bg-[#02140d]/40
            px-2.5
            py-2
            text-[10px]
            sm:text-xs
            font-bold
            text-white
            shadow-[0_0_12px_rgba(0,217,165,0.2)]
            transition-all
            hover:bg-[#10B981]/15
            hover:scale-[1.02]
            active:scale-[0.98]
          "
        >
          <div className="flex items-center gap-1.5 truncate">
            <Download className="h-3.5 w-3.5 text-[#00D9A5]" />
            <span className="truncate">Install Agent</span>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-white/50" />
        </button>

        {/* Floating Brand Card with Botanical Corner Ornaments */}
        <div
          id="sidebar_promo_card"
          className="
            relative
            overflow-hidden
            rounded-xl
            border
            border-[#00D9A5]/25
            bg-[#02140d]/80
            p-2.5
            text-center
          "
        >
          {/* Fern / leafy corner ornaments representing forest vibe */}
          <div className="absolute top-0 left-0 w-4 h-4 opacity-40 border-t border-l border-[#00D9A5]" />
          <div className="absolute bottom-0 right-0 w-4 h-4 opacity-40 border-b border-r border-[#00D9A5]" />

          {/* Core branding logo image */}
          <div className="flex justify-center mb-1.5">
            <img
              src={`${import.meta.env.BASE_URL}logo.png`}
              alt="AI-Agents Logo"
              className="h-8 w-8 object-contain drop-shadow-[0_0_6px_rgba(0,217,165,0.7)]"
            />
          </div>

          <h4 className="text-[10px] sm:text-[11px] font-black tracking-widest text-white leading-none">
            AI-AGENTS
          </h4>
          <p className="text-[8px] sm:text-[9px] text-[#94A3B8] mt-1 leading-snug">
            Smarter Agents.<br />Better Possibilities.
          </p>
        </div>
      </div>
    </aside>
  );
};
