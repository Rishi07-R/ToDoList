import React from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { getLocalDateStr } from '../data/initialTasks';
import {
  CATEGORY_META,
  NavSection,
  Task,
  TaskCategory,
} from '../types/task';
import { formatDueDateLabel } from '../utils/taskHelpers';

interface OverviewViewProps {
  tasks: Task[];
  onSelectTask: (taskId: string) => void;
  onToggleComplete: (taskId: string) => void;
  onNavigate: (section: NavSection) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  tasks,
  onSelectTask,
  onToggleComplete,
  onNavigate,
}) => {
  const todayStr = getLocalDateStr(0);

  const openTasks = tasks.filter((t) => t.status !== 'completed');
  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const dueTodayOrOverdue = openTasks.filter(
    (t) => t.dueDate !== '' && t.dueDate <= todayStr
  );
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length;
  const totalEstimatedMins = openTasks.reduce(
    (sum, t) => sum + (t.estimatedMinutes ?? 0),
    0
  );

  // 7-day completion activity
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const offset = i - 6;
    const dateStr = getLocalDateStr(offset);
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, (m || 1) - 1, d || 1);
    const dayLabel =
      offset === 0
        ? 'Today'
        : dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    const count = completedTasks.filter(
      (t) => t.completedAt && t.completedAt.slice(0, 10) === dateStr
    ).length;
    return { dateStr, dayLabel, count };
  });

  const maxDayCount = Math.max(1, ...last7Days.map((d) => d.count));

  const categories: TaskCategory[] = ['study', 'projects', 'personal', 'inbox'];

  const highPriorityFocus = openTasks
    .filter((t) => t.priority === 'high')
    .sort((a, b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999'))
    .slice(0, 5);

  const completionPct =
    tasks.length > 0
      ? Math.round((completedTasks.length / tasks.length) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* 4-Column KPI Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-[10px] shadow-level-1 p-5">
          <div className="text-[12px] font-medium text-[#64748B]">
            Open tasks
          </div>
          <div className="mt-1.5 text-[28px] leading-[34px] font-bold text-[#0F172A] tabular-nums tracking-[-0.02em]">
            {openTasks.length}
          </div>
          <div className="mt-1 text-[12px] text-[#64748B] tabular-nums">
            {inProgressCount} currently in progress
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-[10px] shadow-level-1 p-5">
          <div className="text-[12px] font-medium text-[#64748B]">
            Due today & overdue
          </div>
          <div className="mt-1.5 text-[28px] leading-[34px] font-bold text-[#4F46E5] tabular-nums tracking-[-0.02em]">
            {dueTodayOrOverdue.length}
          </div>
          <div className="mt-1 text-[12px] text-[#64748B] tabular-nums">
            Scheduled for immediate focus
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-[10px] shadow-level-1 p-5">
          <div className="text-[12px] font-medium text-[#64748B]">
            Completion rate
          </div>
          <div className="mt-1.5 text-[28px] leading-[34px] font-bold text-[#0F172A] tabular-nums tracking-[-0.02em]">
            {completionPct}%
          </div>
          <div className="mt-1 text-[12px] text-[#64748B] tabular-nums">
            {completedTasks.length} of {tasks.length} total tasks
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-[10px] shadow-level-1 p-5">
          <div className="text-[12px] font-medium text-[#64748B]">
            Estimated backlog
          </div>
          <div className="mt-1.5 text-[28px] leading-[34px] font-bold text-[#0F172A] tabular-nums tracking-[-0.02em]">
            {Math.floor(totalEstimatedMins / 60)}h {totalEstimatedMins % 60}m
          </div>
          <div className="mt-1 text-[12px] text-[#64748B]">
            Across open estimated items
          </div>
        </div>
      </div>

      {/* 2-Column Analytical Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* 7-Day Completion Activity */}
        <section className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-[10px] shadow-level-1 p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-[16px] font-semibold text-[#0F172A]">
                7-day completion trend
              </h2>
              <p className="text-[13px] text-[#64748B] mt-0.5">
                Tasks marked complete per day over the past week
              </p>
            </div>
            <span className="text-[13px] font-semibold text-[#4F46E5] tabular-nums">
              {last7Days.reduce((a, b) => a + b.count, 0)} completed
            </span>
          </div>

          <div className="grid grid-cols-7 gap-3 items-end h-44 pt-4 border-b border-[#E2E8F0] pb-3">
            {last7Days.map((day) => {
              const pct = Math.round((day.count / maxDayCount) * 100);
              return (
                <div
                  key={day.dateStr}
                  className="flex flex-col items-center justify-end h-full gap-2"
                >
                  <span className="text-[11px] font-medium text-[#64748B] tabular-nums">
                    {day.count > 0 ? day.count : ''}
                  </span>
                  <div className="w-full max-w-[36px] flex-1 flex items-end">
                    <div
                      className={`w-full rounded-t-md transition-all duration-200 ${
                        day.dayLabel === 'Today'
                          ? 'bg-[#4F46E5]'
                          : day.count > 0
                            ? 'bg-[#C3C0FF]'
                            : 'bg-[#F1F5F9]'
                      }`}
                      style={{
                        height: day.count > 0 ? `${Math.max(16, pct)}%` : '6px',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-7 gap-3 pt-2.5 text-center">
            {last7Days.map((day) => (
              <span
                key={day.dateStr}
                className={`text-[11px] font-medium tabular-nums ${
                  day.dayLabel === 'Today' ? 'text-[#4F46E5]' : 'text-[#64748B]'
                }`}
              >
                {day.dayLabel}
              </span>
            ))}
          </div>
        </section>

        {/* Category Breakdown */}
        <section className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-[10px] shadow-level-1 p-6">
          <div className="mb-5">
            <h2 className="text-[16px] font-semibold text-[#0F172A]">
              Workload by category
            </h2>
            <p className="text-[13px] text-[#64748B] mt-0.5">
              Active and completed distribution across workspace areas
            </p>
          </div>

          <div className="space-y-4">
            {categories.map((catId) => {
              const meta = CATEGORY_META[catId];
              const catTasks = tasks.filter((t) => t.category === catId);
              const catDone = catTasks.filter(
                (t) => t.status === 'completed'
              ).length;
              const catOpen = catTasks.length - catDone;
              const pct =
                catTasks.length > 0
                  ? Math.round((catDone / catTasks.length) * 100)
                  : 0;

              return (
                <div key={catId} className="space-y-1.5">
                  <div className="flex items-center justify-between text-[13px]">
                    <button
                      type="button"
                      onClick={() => onNavigate(catId)}
                      className="inline-flex items-center gap-1.5 font-semibold hover:underline"
                      style={{ color: meta.textColor }}
                    >
                      <span>{meta.label}</span>
                      <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
                    </button>
                    <div className="text-[12px] text-[#64748B] tabular-nums">
                      <span className="font-medium text-[#0F172A]">
                        {catOpen}
                      </span>{' '}
                      open · {catDone} done
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#F1F5F9] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-200"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: meta.barColor,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* High Priority Focus List */}
      <section className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-[10px] shadow-level-1 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-[16px] font-semibold text-[#0F172A]">
              High priority focus queue
            </h2>
            <p className="text-[13px] text-[#64748B] mt-0.5">
              Top open tasks marked as high priority
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('today')}
            className="text-[13px] font-medium text-[#4F46E5] hover:underline"
          >
            Go to Today
          </button>
        </div>

        {highPriorityFocus.length === 0 ? (
          <p className="text-[13px] text-[#64748B] py-4">
            No open high-priority tasks remaining.
          </p>
        ) : (
          <div className="divide-y divide-[#F1F5F9]">
            {highPriorityFocus.map((task) => {
              const cat = CATEGORY_META[task.category];
              const due = formatDueDateLabel(task.dueDate, task.dueTime);
              return (
                <div
                  key={task.id}
                  onClick={() => onSelectTask(task.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectTask(task.id);
                    }
                  }}
                  className="flex items-center justify-between gap-3 py-3 hover:bg-[#F8FAFC] px-2 -mx-2 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      aria-label={`Complete "${task.title}"`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleComplete(task.id);
                      }}
                      className="w-[18px] h-[18px] rounded-[4px] border-[1.5px] border-[#CBD5E1] hover:border-[#4F46E5] bg-[#FFFFFF] flex items-center justify-center shrink-0"
                    >
                      <Check className="w-3 h-3 opacity-0" />
                    </button>
                    <span className="text-[14px] font-medium text-[#0F172A] truncate">
                      {task.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[12px] shrink-0">
                    <span
                      className="font-medium"
                      style={{ color: cat.textColor }}
                    >
                      {cat.label}
                    </span>
                    {task.dueDate && (
                      <>
                        <span className="text-[#CBD5E1]" aria-hidden="true">
                          ·
                        </span>
                        <span
                          className={`tabular-nums ${
                            due.isOverdue
                              ? 'text-[#BA1A1A] font-medium'
                              : due.isToday
                                ? 'text-[#4F46E5] font-medium'
                                : 'text-[#64748B]'
                          }`}
                        >
                          {due.label}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
