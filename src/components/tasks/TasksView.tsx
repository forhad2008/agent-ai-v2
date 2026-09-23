import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCw,
  X,
  Wrench,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useAgent } from '../../context/AgentContext';
import { TaskItem, TaskPriority, TaskStatus } from '../../types';

export const TasksView: React.FC = () => {
  const {
    tasks,
    createTask,
    updateTaskStatus,
    selectedTask,
    setSelectedTask,
    handleSendMessage,
    setActiveView,
    settings,
    currentLanguage,
    t,
    deleteTaskWithSync,
  } = useAgent();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('Medium');

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const task = createTask(newTitle.trim(), newDesc.trim(), newPriority);
    setIsCreateOpen(false);
    setNewTitle('');
    setNewDesc('');
    setSelectedTask(task);
  };

  const handleExecuteInChat = (task: TaskItem) => {
    setActiveView('chat');
    handleSendMessage(`Execute task: "${task.title}". Description: ${task.description}`);
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'High':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Medium':
        return 'bg-emerald-600/20 text-emerald-300 border-emerald-600/40';
      case 'Low':
        return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
    }
  };

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'Running':
        return 'bg-emerald-600/15 text-emerald-300 border-emerald-600/30 animate-pulse';
      case 'Waiting for Approval':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/40 animate-pulse';
      case 'Planning':
        return 'bg-[#10B981]/15 text-emerald-300 border-[#10B981]/30';
      case 'Failed':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case 'Cancelled':
        return 'bg-slate-700/30 text-slate-400 border-slate-700/50';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div id="tasks_view" className="flex-1 overflow-y-auto p-3.5 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full text-[#F8FAFC]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#10B981]/25 pb-4 sm:pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#F8FAFC] flex items-center gap-2.5">
            <CheckSquare className="h-6 w-6 text-[#00D9A5]" />
            <span>{currentLanguage.labels.tasksTitle}</span>
          </h1>
          <p className="mt-1 text-xs text-[#94A3B8]">
            {t.tasksSubheader}
          </p>
        </div>

        <button
          id="btn_create_task_modal"
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#065f46] via-[#854D0E] to-[#10B981] hover:brightness-110 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-[#10B981]/20 transition-all shrink-0 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>{t.createTask}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchTasksPlaceholder}
            className="w-full rounded-2xl bg-[#010e09] pl-10 pr-4 py-2.5 text-xs text-[#F8FAFC] placeholder:text-[#94A3B8]/60 border border-[#10B981]/25 focus:border-[#10B981] focus:outline-none"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          {['All', 'Running', 'Waiting for Approval', 'Completed', 'Planning'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-xl px-3 py-1.5 font-medium transition-colors shrink-0 cursor-pointer ${
                statusFilter === status
                  ? 'bg-[#10B981]/20 text-[#00D9A5] border border-[#10B981]/40 shadow-[0_0_10px_rgba(16,185,129,0.25)]'
                  : 'bg-[#010e09] text-[#94A3B8] border border-[#10B981]/20 hover:bg-[#10B981]/15 hover:text-[#F8FAFC]'
              }`}
            >
              {status === 'All' ? t.allTasksFilter : status}
            </button>
          ))}
        </div>
      </div>

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            id={`task_card_${task.id}`}
            className="group flex flex-col justify-between rounded-2xl bg-[#010e09] p-4 sm:p-5 border border-[#10B981]/25 hover:border-[#10B981]/50 transition-all shadow-[0_0_20px_rgba(16,185,129,0.06)]"
          >
            <div>
              {/* Header Badges */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className={`rounded-lg px-2.5 py-0.5 text-[10px] font-mono font-semibold border ${getStatusBadge(task.status)}`}>
                  {task.status}
                </span>
                <span className={`rounded-lg px-2.5 py-0.5 text-[10px] font-mono font-medium border ${getPriorityBadge(task.priority)}`}>
                  {task.priority}
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="text-sm font-bold text-[#F8FAFC] group-hover:text-[#00D9A5] transition-colors mt-2">
                {task.title}
              </h3>
              <p className="mt-1 text-xs text-[#94A3B8] line-clamp-2 leading-relaxed">
                {task.description}
              </p>

              {/* Required Tools */}
              {task.requiredTools && task.requiredTools.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {task.requiredTools.map((tool, idx) => (
                    <span
                      key={idx}
                      className="rounded-lg bg-[#010e09] px-2 py-0.5 text-[10px] text-[#94A3B8] border border-[#10B981]/20"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Footer with Progress & Execution CTA */}
            <div className="mt-4 pt-3 border-t border-[#10B981]/15 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-[#94A3B8]">
                <span className="font-mono">{task.createdTime}</span>
                <span className="font-mono font-semibold text-[#00D9A5]">{task.progress}%</span>
              </div>

              <div className="h-1.5 w-full rounded-full bg-[#010e09] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    task.status === 'Completed'
                      ? 'bg-[#00D9A5]'
                      : task.status === 'Waiting for Approval'
                      ? 'bg-[#854D0E]'
                      : 'bg-[#10B981]'
                  }`}
                  style={{ width: `${task.progress}%` }}
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedTask(task)}
                    className="text-xs text-[#94A3B8] hover:text-[#F8FAFC] underline underline-offset-4"
                  >
                    View Details
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm(settings.language === 'Bangla' ? 'আপনি কি নিশ্চিতভাবে এই কাজটি ডিলিট করতে চান?' : 'Are you sure you want to delete this task permanently?')) {
                        deleteTaskWithSync(task.id);
                      }
                    }}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                    title={settings.language === 'Bangla' ? 'কাজ ডিলিট করুন' : 'Delete Task'}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>

                <button
                  onClick={() => handleExecuteInChat(task)}
                  className="flex items-center gap-1 rounded-xl bg-[#10B981]/20 px-3 py-1 text-xs font-semibold text-[#00D9A5] hover:bg-[#10B981]/30 transition-colors border border-[#10B981]/40 shadow-sm cursor-pointer"
                >
                  <Play className="h-3 w-3" />
                  <span>Execute in Chat</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Task Details Modal Drawer */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl bg-[#010e09] p-6 border border-[#10B981]/30 shadow-2xl text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#10B981]/25 pb-3">
              <div>
                <span className="font-mono text-[10px] text-[#94A3B8] uppercase">
                  Task ID: {selectedTask.id}
                </span>
                <h2 className="text-base font-bold text-[#F8FAFC] mt-0.5">
                  {selectedTask.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="rounded-lg p-1.5 text-[#94A3B8] hover:bg-[#010e09] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[#94A3B8] font-semibold uppercase text-[10px] tracking-wider block">
                  Description
                </span>
                <p className="text-[#F8FAFC] mt-1 text-xs leading-relaxed">
                  {selectedTask.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-[#010e09] p-3 rounded-xl border border-[#10B981]/25">
                <div>
                  <span className="text-[#94A3B8] text-[10px] uppercase">Status</span>
                  <p className="font-bold text-[#00D9A5] mt-0.5">{selectedTask.status}</p>
                </div>
                <div>
                  <span className="text-[#94A3B8] text-[10px] uppercase">Priority</span>
                  <p className="font-bold text-[#F8FAFC] mt-0.5">{selectedTask.priority}</p>
                </div>
              </div>

              {selectedTask.result && (
                <div>
                  <span className="text-[#94A3B8] font-semibold uppercase text-[10px] tracking-wider block">
                    {t.verifiedOutcome}
                  </span>
                  <div className="mt-1 rounded-xl bg-[#010e09] p-3 font-mono text-[11px] text-[#00D9A5] border border-[#10B981]/20 leading-relaxed">
                    {selectedTask.result}
                  </div>
                </div>
              )}

              {selectedTask.planSteps && selectedTask.planSteps.length > 0 && (
                <div>
                  <span className="text-[#94A3B8] font-semibold uppercase text-[10px] tracking-wider block mb-1">
                    {t.taskExecutionStages}
                  </span>
                  <div className="space-y-1.5 bg-[#010e09] p-3 rounded-xl border border-[#10B981]/20">
                    {selectedTask.planSteps.map((step, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-[#F8FAFC]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#00D9A5]"></span>
                        <span>{step.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#10B981]/25">
              <button
                onClick={() => setSelectedTask(null)}
                className="rounded-xl px-4 py-2 text-[#94A3B8] hover:bg-[#010e09]"
              >
                {t.closeModal}
              </button>
              <button
                onClick={() => {
                  handleExecuteInChat(selectedTask);
                  setSelectedTask(null);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#065f46] via-[#854D0E] to-[#10B981] px-4 py-2 text-xs font-bold text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>{t.runWithAgent}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#010e09] p-6 border border-[#10B981]/30 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#10B981]/25 pb-3 mb-4">
              <h2 className="text-base font-bold text-[#F8FAFC]">{t.createTask}</h2>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="rounded-lg p-1.5 text-[#94A3B8] hover:bg-[#010e09] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#94A3B8] font-medium mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Audit checkout flow and fix error states"
                  className="w-full rounded-xl bg-[#010e09] px-3.5 py-2.5 text-[#F8FAFC] border border-[#10B981]/25 focus:border-[#10B981] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#94A3B8] font-medium mb-1">
                  Objective & Details
                </label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Describe requirements, targeted files, and expected output..."
                  className="w-full rounded-xl bg-[#010e09] p-3 text-[#F8FAFC] border border-[#10B981]/25 focus:border-[#10B981] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#94A3B8] font-medium mb-1">
                  Priority
                </label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                  className="w-full rounded-xl bg-[#010e09] px-3 py-2 text-[#F8FAFC] border border-[#10B981]/25 focus:outline-none"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#10B981]/25">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="rounded-xl px-4 py-2 text-[#94A3B8] hover:bg-[#010e09]"
                >
                  {t.closeModal}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-[#065f46] via-[#854D0E] to-[#10B981] px-4 py-2 font-bold text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                >
                  {t.createTask}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
