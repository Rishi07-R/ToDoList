import React from 'react';
import { Check, CircleDot, Trash2 } from 'lucide-react';
import {
  CATEGORY_META,
  NavSection,
  PRIORITY_META,
  Task,
  TaskCategory,
  TaskStatus,
} from '../types/task';
import { formatDueDateLabel } from '../utils/taskHelpers';

interface TaskRowProps {
  task: Task;
  isSelected: boolean;
  onToggleComplete: (taskId: string) => void;
  onSelectTask: (taskId: string) => void;
  onUpdateStatus: (taskId: string, status: TaskStatus) => void;
  onDeleteTask: (taskId: string) => void;
  onFilterCategory: (section: NavSection) => void;
}

export const TaskRow: React.FC<TaskRowProps> = ({
  task,
  isSelected,
  onToggleComplete,
  onSelectTask,
  onUpdateStatus,
  onDeleteTask,
  onFilterCategory,
}) => {
  const isCompleted = task.status === 'completed';
  const catMeta = CATEGORY_META[task.category];
  const priMeta = PRIORITY_META[task.priority];
  const dueInfo = formatDueDateLabel(task.dueDate, task.dueTime);

  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = task.subtasks.length;

  const handleCategoryClick = (e: React.MouseEvent, category: TaskCategory) => {
    e.stopPropagation();
    onFilterCategory(category);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelectTask(task.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelectTask(task.id);
        }
      }}
      className={`group flex items-start justify-between gap-3 px-4 py-3 bg-[#FFFFFF] rounded-[10px] border transition-all duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#4F46E5] ${
        isSelected
          ? 'border-[#4F46E5] shadow-level-2'
          : 'border-[#E2E8F0] shadow-level-1 hover:border-[#CBD5E1] hover:shadow-level-2'
      }`}
    >
      <div className="flex items-start gap-3 min-w-0 flex-1">
        {/* 18px TaskFlow Core Checkbox */}
        <button
          type="button"
          role="checkbox"
          aria-checked={isCompleted}
          aria-label={`Mark "${task.title}" as ${isCompleted ? 'incomplete' : 'complete'}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete(task.id);
          }}
          className={`mt-0.5 w-[18px] h-[18px] rounded-[4px] flex items-center justify-center shrink-0 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4F46E5] ${
            isCompleted
              ? 'bg-[#4F46E5] border-[1.5px] border-[#4F46E5] text-white'
              : 'bg-[#FFFFFF] border-[1.5px] border-[#CBD5E1] hover:border-[#4F46E5]'
          }`}
        >
          {isCompleted && <Check className="w-3 h-3" strokeWidth={2.5} />}
        </button>

        {/* Task Content & Clean Unboxed Metadata */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`text-[14px] leading-[20px] font-medium truncate transition-colors duration-150 ${
                isCompleted ? 'text-[#64748B] line-through' : 'text-[#0F172A]'
              }`}
            >
              {task.title}
            </span>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] leading-[16px] text-[#64748B]">
            <button
              type="button"
              onClick={(e) => handleCategoryClick(e, task.category)}
              className="font-medium hover:underline focus-visible:outline-none"
              style={{ color: catMeta.textColor }}
            >
              {catMeta.label}
            </button>

            <span aria-hidden="true">·</span>

            <span
              className="font-medium"
              style={{
                color:
                  task.priority === 'high' && !isCompleted
                    ? priMeta.color
                    : '#64748B',
              }}
            >
              {priMeta.shortLabel} priority
            </span>

            {task.status === 'in_progress' && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-medium text-[#4F46E5]">In progress</span>
              </>
            )}

            {task.dueDate && (
              <>
                <span aria-hidden="true">·</span>
                <span
                  className={`tabular-nums ${
                    dueInfo.isOverdue && !isCompleted
                      ? 'text-[#BA1A1A] font-medium'
                      : dueInfo.isToday && !isCompleted
                        ? 'text-[#4F46E5] font-medium'
                        : 'text-[#64748B]'
                  }`}
                >
                  {dueInfo.label}
                </span>
              </>
            )}

            {totalSubtasks > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">
                  {completedSubtasks}/{totalSubtasks} subtasks
                </span>
              </>
            )}

            {task.estimatedMinutes ? (
              <>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{task.estimatedMinutes}m</span>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* Hover Quick Actions */}
      <div className="flex items-center gap-1 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 transition-opacity duration-150">
        {!isCompleted && (
          <button
            type="button"
            title={
              task.status === 'in_progress'
                ? 'Move back to To Do'
                : 'Mark In Progress'
            }
            aria-label={
              task.status === 'in_progress'
                ? 'Move back to To Do'
                : 'Mark In Progress'
            }
            onClick={(e) => {
              e.stopPropagation();
              onUpdateStatus(
                task.id,
                task.status === 'in_progress' ? 'todo' : 'in_progress'
              );
            }}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              task.status === 'in_progress'
                ? 'text-[#4F46E5] bg-[#EEF2FF]'
                : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
            }`}
          >
            <CircleDot className="w-4 h-4" strokeWidth={1.75} />
          </button>
        )}
        <button
          type="button"
          title="Delete task"
          aria-label={`Delete "${task.title}"`}
          onClick={(e) => {
            e.stopPropagation();
            onDeleteTask(task.id);
          }}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#64748B] hover:text-[#BA1A1A] hover:bg-[#FEF2F2] transition-colors"
        >
          <Trash2 className="w-4 h-4" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
};
