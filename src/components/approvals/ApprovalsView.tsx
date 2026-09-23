import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, Lock } from 'lucide-react';
import { useAgent } from '../../context/AgentContext';
import { ApprovalCard } from '../chat/ApprovalCard';

export const ApprovalsView: React.FC = () => {
  const { approvals, currentLanguage, t } = useAgent();
  const [filter, setFilter] = useState<'pending' | 'resolved' | 'all'>('pending');

  const pendingList = approvals.filter((a) => a.status === 'pending');
  const resolvedList = approvals.filter((a) => a.status !== 'pending');

  const displayedApprovals =
    filter === 'pending' ? pendingList : filter === 'resolved' ? resolvedList : approvals;

  return (
    <div id="approvals_view" className="flex-1 overflow-y-auto p-3.5 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full text-[#F8FAFC]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#10B981]/25 pb-4 sm:pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#F8FAFC] flex items-center gap-2.5">
            <ShieldCheck className="h-6 w-6 text-[#00D9A5]" />
            <span>{currentLanguage.labels.approvalsTitle}</span>
          </h1>
          <p className="mt-1 text-xs text-[#94A3B8]">
            {t.approvalsSubheader}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-xl bg-[#10B981]/15 px-3.5 py-1.5 font-mono text-xs font-semibold text-[#00D9A5] border border-[#10B981]/30 shadow-[0_0_12px_rgba(16,185,129,0.25)]">
            {pendingList.length} Pending Actions
          </span>
        </div>
      </div>

      {/* Safety Policy Explainer Banner */}
      <div className="rounded-2xl bg-[#010e09] p-5 border border-[#10B981]/25 shadow-[0_0_25px_rgba(16,185,129,0.1)]">
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#10B981]/20 text-[#00D9A5] border border-[#10B981]/30 shrink-0">
            <Lock className="h-5 w-5 text-[#00D9A5]" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#00D9A5]">
              Agent Security & Permission Enforcement Policy
            </h3>
            <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
              {t.securityPolicyNotice}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#10B981]/25 pb-3 text-xs">
        <button
          onClick={() => setFilter('pending')}
          className={`rounded-xl px-3.5 py-1.5 font-semibold transition-all cursor-pointer ${
            filter === 'pending'
              ? 'bg-[#10B981]/15 text-[#00D9A5] border border-[#10B981]/30 shadow-[0_0_10px_rgba(16,185,129,0.25)]'
              : 'text-[#94A3B8] hover:text-[#F8FAFC]'
          }`}
        >
          {t.pendingReviewFilter} ({pendingList.length})
        </button>
        <button
          onClick={() => setFilter('resolved')}
          className={`rounded-xl px-3.5 py-1.5 font-semibold transition-all cursor-pointer ${
            filter === 'resolved'
              ? 'bg-[#00D9A5]/20 text-[#00D9A5] border border-[#00D9A5]/50 shadow-[0_0_10px_rgba(0,217,165,0.3)]'
              : 'text-[#94A3B8] hover:text-[#F8FAFC]'
          }`}
        >
          {t.auditHistoryFilter} ({resolvedList.length})
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`rounded-xl px-3.5 py-1.5 font-semibold transition-all cursor-pointer ${
            filter === 'all'
              ? 'bg-[#10B981]/15 text-[#00D9A5] border border-[#10B981]/20'
              : 'text-[#94A3B8] hover:text-[#F8FAFC]'
          }`}
        >
          {t.allRecordsFilter}
        </button>
      </div>

      {/* List of Approval Cards */}
      <div className="space-y-4 max-w-3xl">
        {displayedApprovals.length === 0 ? (
          <div className="rounded-2xl bg-[#010e09] p-8 text-center border border-[#10B981]/25">
            <CheckCircle2 className="mx-auto h-8 w-8 text-[#00D9A5] mb-2" />
            <h3 className="text-sm font-bold text-[#F8FAFC]">{t.noApprovalsWaiting}</h3>
            <p className="text-xs text-[#94A3B8] mt-1">
              {t.noApprovalsDesc}
            </p>
          </div>
        ) : (
          displayedApprovals.map((item) => (
            <ApprovalCard key={item.id} approval={item} />
          ))
        )}
      </div>
    </div>
  );
};
