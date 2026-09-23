import React from 'react';
import { Bell, Volume2 } from 'lucide-react';
import { AgentProvider, useAgent } from './context/AgentContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { ChatView } from './components/chat/ChatView';
import { TasksView } from './components/tasks/TasksView';
import { FilesView } from './components/files/FilesView';
import { ToolsView } from './components/tools/ToolsView';
import { ApprovalsView } from './components/approvals/ApprovalsView';
import { ActivityView } from './components/activity/ActivityView';
import { SettingsView } from './components/settings/SettingsView';
import { UserProfileView } from './components/profile/UserProfileView';
import { AILabView } from './components/ailab/AILabView';
import { LanguageModeModal } from './components/common/LanguageModeModal';
import { InstallGuideModal } from './components/common/InstallGuideModal';

const MainLayout: React.FC = () => {
  const { activeView, triggeredAlarm, setTriggeredAlarm } = useAgent();

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'profile':
        return <UserProfileView />;
      case 'chat':
        return <ChatView />;
      case 'ailab':
        return <AILabView />;
      case 'tasks':
        return <TasksView />;
      case 'files':
        return <FilesView />;
      case 'tools':
        return <ToolsView />;
      case 'approvals':
        return <ApprovalsView />;
      case 'activity':
        return <ActivityView />;
      case 'results':
        return <TasksView />;
      case 'automations':
        return <TasksView />;
      case 'integrations':
        return <ToolsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-black text-[#F8FAFC] font-sans antialiased">
      {/* 100% Saturated Vivid Forest Sunlit Background representing image mockup exactly */}
      <div className="absolute inset-0 w-full h-full pointer-events-none select-none z-0 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1920&q=80"
          alt="Glowing sunlit forest nature background"
          className="w-full h-full object-cover transition-all duration-700"
          style={{ filter: 'brightness(0.95) saturate(145%) contrast(110%)' }}
        />
        {/* Magic sunrays and leaf shadows glass vignette layer */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/80 pointer-events-none" />
      </div>

      {/* Ambient glowing dust & green light particle indicators */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-10">
        <div className="absolute -top-32 left-[15%] h-[550px] w-[550px] rounded-full bg-gradient-to-br from-[#10B981]/25 via-transparent to-transparent blur-[140px]" />
        <div className="absolute right-[-80px] top-[15%] h-[600px] w-[600px] rounded-full bg-gradient-to-bl from-[#00D9A5]/25 via-transparent to-transparent blur-[160px]" />
      </div>

      {/* Main floating desktop frames (Padded to match mockup image borders exactly) */}
      <div className="relative z-40 flex h-full w-full flex-col p-3 sm:p-5 gap-3 sm:gap-4 overflow-hidden">
        {/* Floating top bar */}
        <Header />

        <div className="flex min-h-0 flex-1 gap-3 sm:gap-4 overflow-hidden">
          {/* Floating side bar */}
          <Sidebar />

          {/* Floating content canvas */}
          <main
            className="
              relative
              flex-1
              min-w-0
              rounded-2xl
              overflow-y-auto
              overflow-x-hidden
              bg-transparent
              scrollbar-thin
              scrollbar-track-transparent
              scrollbar-thumb-[#00D9A5]/30
            "
          >
            {renderActiveView()}
          </main>
        </div>
      </div>

      {/* Modals & alert portals */}
      <LanguageModeModal />
      <InstallGuideModal />

      {/* Alarm ringing popup overlay */}
      {triggeredAlarm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in">
          <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-[#00D9A5]/30 bg-[#02140d]/95 p-6 shadow-[0_0_50px_rgba(0,217,165,0.25)] text-center space-y-5">
            <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-[#10B981]/10 to-[#00D9A5]/10 border border-[#00D9A5]/30">
              <div className="absolute inset-0 rounded-full border border-[#00D9A5]/20 animate-ping" />
              <Bell className="h-10 w-10 text-[#00D9A5] animate-bounce" />
            </div>

            <div className="space-y-1.5">
              <span className="inline-block rounded-full bg-[#00D9A5]/10 px-3 py-1 text-[10px] font-bold tracking-widest text-[#00D9A5] uppercase border border-[#00D9A5]/20">
                🚨 Agent OS Alarm
              </span>
              <h2 className="text-xl font-black text-white tracking-tight">
                {triggeredAlarm.label}
              </h2>
              <p className="text-xs text-[#94A3B8]">
                Alarm Time: <span className="font-mono font-bold text-[#00D9A5]">{triggeredAlarm.time}</span>
              </p>
            </div>

            <div className="rounded-2xl bg-[#010e09] p-3 border border-white/5 flex items-center justify-center gap-2 text-[11px] text-[#00D9A5]">
              <Volume2 className="h-3.5 w-3.5 text-[#00D9A5] animate-pulse" />
              <span className="font-semibold">🔊 Playing "Pirates of the Caribbean" Theme Song...</span>
            </div>

            <button
              type="button"
              onClick={() => setTriggeredAlarm(null)}
              className="w-full rounded-2xl bg-gradient-to-r from-[#065f46] via-[#854D0E] to-[#10B981] hover:from-[#10B981] hover:via-[#854D0E] hover:to-[#065f46] py-3 text-xs font-black text-white shadow-lg shadow-[#01140d]/40 transition-all transform active:scale-95 cursor-pointer"
            >
              DISMISS ALARM
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AgentProvider>
      <MainLayout />
    </AgentProvider>
  );
}
