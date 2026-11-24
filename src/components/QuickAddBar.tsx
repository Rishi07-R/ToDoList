import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Calendar, CornerDownLeft, Flag, Plus, Tag } from 'lucide-react';
import { getLocalDateStr } from '../data/initialTasks';
import {
  CATEGORY_META,
  NavSection,
  PRIORITY_META,
  TaskCategory,
  TaskPriority,
} from '../types/task';
import { parseQuickAddInput } from '../utils/taskHelpers';

interface QuickAddBarProps {
  activeNav: NavSection;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  onAddTask: (payload: {
    title: string;
    category: TaskCategory;
    priority: TaskPriority;
    dueDate: string;
  }) => void;
}

export const QuickAddBar: React.FC<QuickAddBarProps> = ({
  activeNav,
  inputRef,
  onAddTask,
}) => {
  const defaultCategory: TaskCategory =
    activeNav === 'study' || activeNav === 'projects' || activeNav === 'personal'
      ? activeNav
      : 'inbox';
  const defaultDate = activeNav === 'today' ? getLocalDateStr(0) : '';

  const [rawTitle, setRawTitle] = useState('');
  const [selectedCategory, setSelectedCategory] =
    useState<TaskCategory>(defaultCategory);
  const [selectedPriority, setSelectedPriority] =
    useState<TaskPriority>('medium');
  const [selectedDate, setSelectedDate] = useState<string>(defaultDate);

  const internalRef = useRef<HTMLInputElement | null>(null);
  const resolvedRef = inputRef ?? internalRef;

  useEffect(() => {
    setSelectedCategory(defaultCategory);
    setSelectedDate(defaultDate);
  }, [defaultCategory, defaultDate]);

  const parsed = useMemo(() => parseQuickAddInput(rawTitle), [rawTitle]);

  const effectiveCategory = parsed.detectedCategory ?? selectedCategory;
  const effectivePriority = parsed.detectedPriority ?? selectedPriority;
  const effectiveDate = parsed.detectedDate ?? selectedDate;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitle = parsed.cleanTitle;
    if (!finalTitle) return;

    onAddTask({
      title: finalTitle,
      category: effectiveCategory,
      priority: effectivePriority,
      dueDate: effectiveDate,
    });
    setRawTitle('');
    setSelectedPriority('medium');
    setSelectedCategory(defaultCategory);
    setSelectedDate(defaultDate);
  };

  const todayStr = getLocalDateStr(0);
  const tomorrowStr = getLocalDateStr(1);

  const dateDisplay =
    effectiveDate === todayStr
      ? 'Today'
      : effectiveDate === tomorrowStr
        ? 'Tomorrow'
        : effectiveDate
          ? effectiveDate
          : 'No date';

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-[10px] shadow-level-1 input-focus-ring transition-all duration-150"
    >
      <div className="flex items-center gap-3 px-4 h-12">
        <Plus
          className="w-[18px] h-[18px] text-[#4F46E5] shrink-0"
          strokeWidth={2}
        />
        <input
          ref={resolvedRef}
          type="text"
          value={rawTitle}
          onChange={(e) => setRawTitle(e.target.value)}
          placeholder="Add a task... try #study, #projects, !high, @today"
          aria-label="Quick add task"
          className="flex-1 bg-transparent text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none min-w-0"
        />
        <button
          type="submit"
          disabled={!parsed.cleanTitle}
          className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12px] font-medium bg-[#4F46E5] text-white hover:bg-[#4338CA] active:bg-[#3730A3] disabled:opacity-40 disabled:pointer-events-none transition-colors shrink-0 whitespace-nowrap"
        >
          <span>Add task</span>
          <CornerDownLeft className="w-3.5 h-3.5" strokeWidth={2} />
        </button>
      </div>

      {/* Inline Quick Controls & Auto-detected tokens */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 border-t border-[#F1F5F9] text-[12px]">
        <div className="flex flex-wrap items-center gap-2">
          {/* Category selector */}
          <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] cursor-pointer transition-colors">
            <Tag
              className="w-3.5 h-3.5"
              style={{ color: CATEGORY_META[effectiveCategory].textColor }}
              strokeWidth={1.75}
            />
            <select
              aria-label="Task category"
              value={effectiveCategory}
              onChange={(e) =>
                setSelectedCategory(e.target.value as TaskCategory)
              }
              className="bg-transparent text-[#0F172A] font-medium focus:outline-none cursor-pointer"
            >
              <option value="inbox">Inbox</option>
              <option value="study">Study</option>
              <option value="projects">Projects</option>
              <option value="personal">Personal</option>
            </select>
          </label>

          {/* Priority selector */}
          <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] cursor-pointer transition-colors">
            <Flag
              className="w-3.5 h-3.5"
              style={{ color: PRIORITY_META[effectivePriority].color }}
              strokeWidth={1.75}
            />
            <select
              aria-label="Task priority"
              value={effectivePriority}
              onChange={(e) =>
                setSelectedPriority(e.target.value as TaskPriority)
              }
              className="bg-transparent text-[#0F172A] font-medium focus:outline-none cursor-pointer"
            >
              <option value="high">High priority</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </label>

          {/* Due date quick selector */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] transition-colors">
            <Calendar className="w-3.5 h-3.5 text-[#64748B]" strokeWidth={1.75} />
            <select
              aria-label="Quick due date"
              value={
                effectiveDate === todayStr
                  ? 'today'
                  : effectiveDate === tomorrowStr
                    ? 'tomorrow'
                    : effectiveDate === ''
                      ? 'none'
                      : 'custom'
              }
              onChange={(e) => {
                const v = e.target.value;
                if (v === 'today') setSelectedDate(todayStr);
                else if (v === 'tomorrow') setSelectedDate(tomorrowStr);
                else if (v === 'none') setSelectedDate('');
              }}
              className="bg-transparent text-[#0F172A] font-medium focus:outline-none cursor-pointer"
            >
              <option value="none">Unscheduled</option>
              <option value="today">Today</option>
              <option value="tomorrow">Tomorrow</option>
              {effectiveDate &&
                effectiveDate !== todayStr &&
                effectiveDate !== tomorrowStr && (
                  <option value="custom">{dateDisplay}</option>
                )}
            </select>
          </div>
        </div>

        <span className="hidden sm:inline text-[11px] text-[#64748B] tabular-nums">
          Press <kbd className="font-mono text-[#0F172A]">N</kbd> to quick-focus
        </span>
      </div>
    </form>
  );
};
