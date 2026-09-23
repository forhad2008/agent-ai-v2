import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Zap,
  CheckCircle2,
  ChevronRight,
  Bell,
  Plus,
  Trash2,
  Clock,
  Globe,
  PlusCircle,
  HelpCircle,
  Target,
} from 'lucide-react';
import { useAgent } from '../../context/AgentContext';

export const DashboardView: React.FC = () => {
  const {
    tasks,
    setActiveView,
    currentLanguage,
    setIsLanguageModalOpen,
    userProfile,
    alarms,
    addAlarm,
    toggleAlarm,
    deleteAlarm,
  } = useAgent();

  const [newAlarmTime, setNewAlarmTime] = useState('');
  const [newAlarmLabel, setNewAlarmLabel] = useState('');
  const [showQuickAlarmInput, setShowQuickAlarmInput] = useState(false);

  const handleCreateAlarm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlarmTime) return;

    const [hrsStr, minsStr] = newAlarmTime.split(':');
    const hrs = parseInt(hrsStr);
    const mins = parseInt(minsStr);

    const targetDate = new Date();
    targetDate.setHours(hrs, mins, 0, 0);
    if (targetDate.getTime() < Date.now()) {
      targetDate.setDate(targetDate.getDate() + 1);
    }

    const isBangla = currentLanguage.id === 'bn';
    const ampm = hrs >= 12 ? 'PM' : 'AM';
    const displayHrs = hrs % 12 || 12;
    const formattedTimeStr = `${displayHrs}:${mins.toString().padStart(2, '0')} ${ampm}`;

    const label = newAlarmLabel.trim() || (isBangla ? 'আমার কাস্টম অ্যালার্ম' : 'My Custom Alarm');
    addAlarm(formattedTimeStr, label, targetDate.getTime());

    setNewAlarmTime('');
    setNewAlarmLabel('');
    setShowQuickAlarmInput(false);
  };

  const addQuickTestAlarm = (seconds: number) => {
    const isBangla = currentLanguage.id === 'bn';
    const targetTs = Date.now() + seconds * 1000;
    const targetDate = new Date(targetTs);
    const timeStr = targetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const label = isBangla ? `${seconds} সেকেন্ডের ইনস্ট্যান্ট টেস্ট অ্যালার্ম` : `${seconds}s Instant Test Alarm`;
    addAlarm(timeStr, label, targetTs);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning,';
    if (hour >= 12 && hour < 17) return 'Good afternoon,';
    if (hour >= 17 && hour < 22) return 'Good evening,';
    return 'Good night,';
  };

  return (
    <div
      id="dashboard_view"
      className="flex-1 overflow-y-auto space-y-4 sm:space-y-6 max-w-5xl mx-auto w-full animate-fadeIn relative pb-8"
    >
      {/* ======================================================== */}
      {/* 1. TOP HERO CARD - 100% STYLE MATCH OF THE IMAGE MOCKUP */}
      {/* ======================================================== */}
      <div
        id="hero_agent_card"
        className="
          relative
          overflow-hidden
          rounded-3xl
          p-5
          xs:p-6
          sm:p-8
          md:p-10
          border
          border-[#10B981]/25
          bg-black/30
          backdrop-blur-[20px]
          shadow-[0_12px_40px_rgba(1,20,13,0.3)]
        "
      >
        {/* Subtle decorative grid layer */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] opacity-60" />

        {/* Ambient radial glows */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[#00D9A5]/10 blur-[120px]" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 h-80 w-80 rounded-full bg-[#10B981]/15 blur-[100px]" />

        {/* Real Logo.png Display on Desktop (Removed SVG animation and using logo.png as requested) */}
        <div className="absolute right-[5%] top-[10%] hidden md:flex items-center justify-center w-64 h-64 pointer-events-none select-none z-10">
          <div className="relative flex items-center justify-center">
            {/* Soft inner green aura */}
            <div className="absolute inset-0 rounded-full bg-[#00D9A5]/15 blur-3xl animate-pulse" />
            
            {/* Elegant glass card and logo background */}
            <div className="relative p-6 rounded-3xl bg-black/40 backdrop-blur-md border border-[#00D9A5]/30 shadow-[0_0_40px_rgba(0,217,165,0.4)]">
              <img
                src={`${import.meta.env.BASE_URL}logo.png`}
                alt="AI-Agents Logo"
                className="h-32 w-32 object-contain drop-shadow-[0_0_15px_rgba(0,217,165,0.7)]"
              />
            </div>
          </div>
        </div>

        {/* Left Side Content Column */}
        <div className="relative z-10 flex flex-col space-y-4 max-w-xl">
          
          {/* Tag: ● PERSONAL AI AGENT OS */}
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#00D9A5] shadow-[0_0_8px_#00D9A5] animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-white/80">
              Personal AI Agent OS
            </span>
          </div>

          {/* Mode Selector Pill: US United States Mode (with Flag & Chevron Down) */}
          <div className="flex">
            <button
              onClick={() => setIsLanguageModalOpen(true)}
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-[#10B981]/40
                bg-black/45
                px-3
                py-1.5
                text-xs
                font-semibold
                text-white
                shadow-[0_0_12px_rgba(16,185,129,0.15)]
                hover:border-[#00D9A5]/60
                transition-all
              "
            >
              <span className="text-sm">{currentLanguage.flag || '🇺🇸'}</span>
              <span className="text-white/95">
                {currentLanguage.id === 'en' ? 'United States Mode' : `${currentLanguage.country} Mode`}
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-[#00D9A5]" />
            </button>
          </div>

          {/* Greeting Block */}
          <div className="space-y-1">
            <h1 className="text-3xl xs:text-4xl sm:text-5xl font-black text-white/95 tracking-tight flex items-center gap-2">
              <span>{getGreeting()}</span>
              <span className="animate-bounce-subtle text-2xl">👋</span>
            </h1>
            <h2 
              className="text-3xl xs:text-4xl sm:text-5xl font-black tracking-tight drop-shadow-[0_0_15px_rgba(4,120,87,0.4)] w-fit"
              style={{ color: '#01a987' }}
            >
              {userProfile.name || 'Abdullah'}
            </h2>
          </div>

          {/* Subtitle statement description */}
          <p className="text-xs xs:text-sm sm:text-base text-white/70 leading-relaxed max-w-lg">
            Your personal AI agent is ready. I'm here to help you with your ideas, tasks, creative projectts, research, and more — turning your goals into real results.
          </p>

          {/* Two Horizontal Action Cards (Agent Status & Ready to assist) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            
            {/* Left box: AGENT STATUS */}
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#02140d]/40 p-3 sm:p-4 hover:border-[#00D9A5]/30 transition-all">
              <div className="flex items-center gap-3">
                {/* Glowing 4-point star icon inside circular frame */}
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#00D9A5]/30 bg-gradient-to-br from-[#10B981]/25 to-[#00D9A5]/10 text-[#00D9A5] shadow-[0_0_12px_rgba(0,217,165,0.2)]">
                  <svg className="h-5 w-5 text-[#00D9A5] animate-pulse" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L14.8 9.2L22 12L14.8 14.8L12 22L9.2 14.8L2 12L9.2 9.2L12 2Z" />
                  </svg>
                </div>
                <div>
                  <span className="block text-[9px] font-mono font-black tracking-widest text-white/50 uppercase">
                    AGENT STATUS
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-[#00D9A5] flex items-center gap-1.5 mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#00D9A5]" />
                    Agent Ready &amp; Active
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-[#94A3B8] font-mono block truncate mt-0.5">
                    Model: Gemini 3.5 Flash
                  </span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-white/30" />
            </div>

            {/* Right card: Ready to assist */}
            <div
              onClick={() => setActiveView('chat')}
              className="cursor-pointer flex items-center justify-between rounded-2xl border border-white/10 bg-[#02140d]/40 p-3 sm:p-4 hover:border-[#00D9A5]/30 transition-all group"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Glowing magic star icon inside rounded square */}
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#10B981]/25 bg-gradient-to-tr from-[#10B981]/20 to-[#00D9A5]/10 text-[#00D9A5]">
                  <Sparkles className="h-5 w-5 text-[#00D9A5] group-hover:scale-110 transition-transform" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-white leading-tight truncate">
                    Ready to assist
                  </h4>
                  <p className="text-[10px] sm:text-[11px] text-[#94A3B8] mt-0.5">
                    your next task
                  </p>
                </div>
              </div>
              
              {/* Circular Arrow Button */}
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#00D9A5] text-black group-hover:bg-[#10B981] group-hover:scale-110 transition-all shadow-md">
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>

          </div>

          {/* Central full-width glowing CTA button: "Open AI Chat →" */}
          <button
            id="hero_open_chat_cta_btn"
            onClick={() => setActiveView('chat')}
            className="
              relative
              w-full
              flex
              items-center
              justify-center
              gap-2.5
              rounded-full
              border
              border-[#00D9A5]/45
              bg-gradient-to-r
              from-[#012d1c]/40
              via-[#10B981]
              to-[#012d1c]/40
              hover:via-[#34D399]
              py-3.5
              px-6
              text-sm
              font-extrabold
              text-white
              shadow-[0_4px_20px_rgba(0,217,165,0.45)]
              hover:shadow-[0_6px_30px_rgba(0,217,165,0.6)]
              transition-all
              group
              transform
              active:scale-95
            "
          >
            {/* Star icon */}
            <svg className="h-4 w-4 text-white animate-pulse" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L14.8 9.2L22 12L14.8 14.8L12 22L9.2 14.8L2 12L9.2 9.2L12 2Z" />
            </svg>
            <span>Open AI Chat</span>
            <ArrowRight className="h-4 w-4 text-white group-hover:translate-x-1 transition-transform" />
          </button>

        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. BOTTOM GRID - CREATE & RESEARCH (MOCKUP MATCH 100%)    */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Card A: CREATE */}
        <div
          onClick={() => setActiveView('tasks')}
          className="
            cursor-pointer
            relative
            overflow-hidden
            rounded-3xl
            border
            border-white/10
            bg-black/35
            p-5
            hover:border-[#00D9A5]/40
            transition-all
            group
          "
        >
          {/* Corner graphic details */}
          <div className="absolute top-0 left-0 w-3 h-3 opacity-30 border-t border-l border-[#00D9A5]" />
          <div className="absolute bottom-0 right-0 w-3 h-3 opacity-30 border-b border-r border-[#00D9A5]" />

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {/* Lightning Bolt Circle */}
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#00D9A5]/30 bg-[#10B981]/15 text-[#00D9A5]">
                <Zap className="h-5 w-5 fill-[#00D9A5]/10 text-[#00D9A5]" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  CREATE
                </h3>
                <p className="text-[11px] sm:text-xs text-[#94A3B8] mt-1 leading-snug">
                  Build, design, automate, and bring your ideas to life.
                </p>
              </div>
            </div>

            {/* Small Circular Arrow button */}
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#00D9A5]/40 text-[#00D9A5] group-hover:bg-[#00D9A5] group-hover:text-black transition-all">
              <ArrowRight className="h-3 w-3" />
            </div>
          </div>

          {/* Active status indicator badge at bottom */}
          <div className="mt-4 flex">
            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-[#00D9A5] bg-[#00D9A5]/10 px-2 py-0.5 rounded-full border border-[#00D9A5]/20">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00D9A5] shadow-[0_0_6px_#00D9A5] animate-pulse" />
              ACTIVE
            </span>
          </div>
        </div>

        {/* Card B: RESEARCH */}
        <div
          onClick={() => setActiveView('ailab')}
          className="
            cursor-pointer
            relative
            overflow-hidden
            rounded-3xl
            border
            border-white/10
            bg-black/35
            p-5
            hover:border-[#00D9A5]/40
            transition-all
            group
          "
        >
          {/* Corner graphic details */}
          <div className="absolute top-0 left-0 w-3 h-3 opacity-30 border-t border-l border-[#00D9A5]" />
          <div className="absolute bottom-0 right-0 w-3 h-3 opacity-30 border-b border-r border-[#00D9A5]" />

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {/* Scope/Target Circle */}
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#00D9A5]/30 bg-[#10B981]/15 text-[#00D9A5]">
                <Target className="h-5 w-5 text-[#00D9A5]" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  RESEARCH
                </h3>
                <p className="text-[11px] sm:text-xs text-[#94A3B8] mt-1 leading-snug">
                  Get accurate information, insights and analysis.
                </p>
              </div>
            </div>

            {/* Small Circular Arrow button */}
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#00D9A5]/40 text-[#00D9A5] group-hover:bg-[#00D9A5] group-hover:text-black transition-all">
              <ArrowRight className="h-3 w-3" />
            </div>
          </div>

          {/* Available status indicator badge at bottom */}
          <div className="mt-4 flex">
            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-[#00D9A5] bg-[#00D9A5]/10 px-2 py-0.5 rounded-full border border-[#00D9A5]/20">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00D9A5] shadow-[0_0_6px_#00D9A5]" />
              2 available
            </span>
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* REAL-TIME ALARMS SYSTEM (RETAINED & STYLED TO FOREST THEME) */}
      {/* ======================================================== */}
      <div 
        id="section_alarms_scheduler"
        className="rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl border border-[#10B981]/25 bg-black/35 backdrop-blur-[20px]"
      >
        <div className="flex items-center justify-between border-b border-[rgba(16,185,129,0.15)] pb-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-[#10B981]/20 border border-[#10B981]/35">
              <Bell className="h-4.5 w-4.5 text-[#00D9A5]" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#F8FAFC]">
                Alarms &amp; Active Reminders
              </h3>
              <p className="text-[11px] sm:text-xs text-[#94A3B8]">
                Real-time synchronized device alerts and scheduled timers
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowQuickAlarmInput(!showQuickAlarmInput)}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#065f46] via-[#022c22] to-[#10B981] hover:from-[#10B981] px-3 py-1.5 text-xs font-bold text-white border border-[#10B981]/30 transition-all cursor-pointer shadow-md"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Alarm</span>
          </button>
        </div>

        {/* Preset list */}
        <div className="flex flex-wrap items-center gap-2 rounded-xl bg-black/40 p-2.5 border border-[#10B981]/15">
          <span className="text-[10px] font-bold text-[#34D399] uppercase tracking-wider mr-1 flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-[#00D9A5] animate-pulse" />
            Liveness Test presets:
          </span>
          <button
            type="button"
            onClick={() => addQuickTestAlarm(5)}
            className="rounded-lg bg-[#10B981]/20 hover:bg-[#10B981]/30 px-2.5 py-1 text-[10px] font-bold text-[#00D9A5] border border-[#10B981]/30"
          >
            5 Seconds
          </button>
          <button
            type="button"
            onClick={() => addQuickTestAlarm(10)}
            className="rounded-lg bg-[#10B981]/20 hover:bg-[#10B981]/30 px-2.5 py-1 text-[10px] font-bold text-[#00D9A5] border border-[#10B981]/30"
          >
            10 Seconds
          </button>
        </div>

        {showQuickAlarmInput && (
          <form onSubmit={handleCreateAlarm} className="bg-black/80 rounded-2xl p-4 border border-[#10B981]/20 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end animate-fadeIn">
            <div>
              <label className="block text-[10px] font-bold text-[#00D9A5] uppercase tracking-wider mb-1">Time (24h)</label>
              <input
                type="time"
                required
                value={newAlarmTime}
                onChange={(e) => setNewAlarmTime(e.target.value)}
                className="w-full rounded-xl bg-black/40 px-3 py-2 text-xs text-white border border-[#10B981]/20 focus:outline-none focus:border-[#00D9A5]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#00D9A5] uppercase tracking-wider mb-1">Label</label>
              <input
                type="text"
                placeholder="Standup sync..."
                value={newAlarmLabel}
                onChange={(e) => setNewAlarmLabel(e.target.value)}
                className="w-full rounded-xl bg-black/40 px-3 py-2 text-xs text-white border border-[#10B981]/20 focus:outline-none focus:border-[#00D9A5]"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 rounded-xl bg-[#10B981] hover:bg-[#00D9A5] py-2 text-xs font-bold text-black transition-all cursor-pointer"
              >
                Add Alert
              </button>
              <button
                type="button"
                onClick={() => setShowQuickAlarmInput(false)}
                className="rounded-xl bg-black/40 px-3 py-2 text-xs text-[#94A3B8] border border-white/5"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {alarms.length === 0 ? (
          <div className="h-12 flex items-center justify-center text-xs text-white/40 italic">
            No active alarms configured.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {alarms.map((alarm) => (
              <div 
                key={alarm.id} 
                className={`relative overflow-hidden rounded-2xl p-3 border transition-all ${alarm.enabled ? 'border-[#10B981]/30 bg-black/50' : 'border-white/5 bg-black/20 opacity-60'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${alarm.enabled ? 'bg-[#00D9A5]/20 text-[#00D9A5] animate-pulse' : 'bg-white/5 text-white/40'}`}>
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="block text-sm font-black font-mono text-[#F8FAFC]">
                      {alarm.time}
                    </span>
                    <span className="block text-[10px] text-[#00D9A5] truncate font-bold mt-0.5">
                      {alarm.label}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 absolute right-3 top-1/2 -translate-y-1/2">
                  <button
                    type="button"
                    onClick={() => toggleAlarm(alarm.id)}
                    className={`rounded-lg px-2 py-0.5 text-[9px] font-bold uppercase transition-all ${alarm.enabled ? 'bg-[#00D9A5]/20 text-[#00D9A5] border border-[#00D9A5]/40' : 'bg-white/5 text-white/40'}`}
                  >
                    {alarm.enabled ? 'On' : 'Off'}
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteAlarm(alarm.id)}
                    className="p-1.5 rounded-lg text-white/40 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
