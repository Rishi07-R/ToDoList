import React, { useEffect, useState } from 'react';
import { Check, Plus, Trash2, X } from 'lucide-react';
import {
  CATEGORY_META,
  Task,
  TaskCategory,
  TaskPriority,
  TaskStatus,
} from '../types/task';

interface TaskDetailDrawerProps {
  task: Task | null;
  onClose: () => void;
  onUpdateTask: (taskId: string, patch: Partial<Task>) => void;
  onToggleComplete: (taskId: string) => void;
  onAddSubtask: (taskId: string, title: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TaskDetailDrawer: React.FC<TaskDetailDrawerProps> = ({
  task,
  onClose,
  onUpdateTask,
  onToggleComplete,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  onDeleteTask,
}) => {
  const [newSubtask, setNewSubtask] = useState('');

  useEffect(() => {
    if (!task) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [task, onClose]);

  useEffect(() => {
    setNewSubtask('');
  }, [task?.id]);

  if (!task) return null;

  const isCompleted = task.status === 'completed';
  const doneSubtasks = task.subtasks.filter((s) => s.completed).length;

  const handleSubtaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtask.trim()) return;
    onAddSubtask(task.id, newSubtask);
    setNewSubtask('');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Task details">
      {/* Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-[#0F172A]/20 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Pane (Level 3 Elevation) */}
      <div className="relative z-10 w-full max-w-[460px] bg-[#FFFFFF] h-full border-l border-[#E2E8F0] shadow-level-3 flex flex-col">
        {/* Pane Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-[#E2E8F0] shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              role="checkbox"
              aria-checked={isCompleted}
              onClick={() => onToggleComplete(task.id)}
              className={`inline-flex items-center gap-2 h-8 px-3 rounded-lg text-[13px] font-medium border transition-colors ${
                isCompleted
                  ? 'bg-[#EEF2FF] border-[#4F46E5] text-[#4F46E5]'
                  : 'bg-[#FFFFFF] border-[#E2E8F0] text-[#0F172A] hover:bg-[#F8FAFC]'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-[4px] flex items-center justify-center ${
                  isCompleted
                    ? 'bg-[#4F46E5] text-white'
                    : 'border-[1.5px] border-[#CBD5E1]'
                }`}
              >
                {isCompleted && <Check className="w-3 h-3" strokeWidth={2.5} />}
              </span>
              <span>{isCompleted ? 'Completed' : 'Mark complete'}</span>
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                onDeleteTask(task.id);
                onClose();
              }}
              aria-label="Delete task"
              title="Delete task"
              className="w-9 h-9 rounded-lg flex items-center justify-center text-[#64748B] hover:text-[#BA1A1A] hover:bg-[#FEF2F2] transition-colors"
            >
              <Trash2 className="w-4 h-4" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close details"
              className="w-9 h-9 rounded-lg flex items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
            >
              <X className="w-5 h-5" strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {/* Pane Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Editable Title */}
          <div>
            <label htmlFor="detail-title" className="sr-only">
              Task title
            </label>
            <input
              id="detail-title"
              type="text"
              value={task.title}
              onChange={(e) => onUpdateTask(task.id, { title: e.target.value })}
              className={`w-full text-[18px] leading-[26px] font-semibold bg-transparent border-b border-transparent focus:border-[#4F46E5] pb-1 focus:outline-none transition-colors ${
                isCompleted ? 'text-[#64748B] line-through' : 'text-[#0F172A]'
              }`}
            />
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="detail-status"
                className="block text-[12px] font-medium text-[#64748B] mb-1.5"
              >
                Status
              </label>
              <select
                id="detail-status"
                value={task.status}
                onChange={(e) =>
                  onUpdateTask(task.id, {
                    status: e.target.value as TaskStatus,
                  })
                }
                className="w-full h-10 px-3 rounded-lg bg-[#FFFFFF] border border-[#E2E8F0] text-[13px] font-medium text-[#0F172A] focus:outline-none focus:border-[#4F46E5] focus:ring-3 focus:ring-[#EEF2FF]"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="detail-category"
                className="block text-[12px] font-medium text-[#64748B] mb-1.5"
              >
                Category
              </label>
              <select
                id="detail-category"
                value={task.category}
                onChange={(e) =>
                  onUpdateTask(task.id, {
                    category: e.target.value as TaskCategory,
                  })
                }
                className="w-full h-10 px-3 rounded-lg bg-[#FFFFFF] border border-[#E2E8F0] text-[13px] font-medium text-[#0F172A] focus:outline-none focus:border-[#4F46E5] focus:ring-3 focus:ring-[#EEF2FF]"
                style={{ color: CATEGORY_META[task.category].textColor }}
              >
                <option value="inbox">Inbox</option>
                <option value="study">Study</option>
                <option value="projects">Projects</option>
                <option value="personal">Personal</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="detail-priority"
                className="block text-[12px] font-medium text-[#64748B] mb-1.5"
              >
                Priority
              </label>
              <select
                id="detail-priority"
                value={task.priority}
                onChange={(e) =>
                  onUpdateTask(task.id, {
                    priority: e.target.value as TaskPriority,
                  })
                }
                className="w-full h-10 px-3 rounded-lg bg-[#FFFFFF] border border-[#E2E8F0] text-[13px] font-medium text-[#0F172A] focus:outline-none focus:border-[#4F46E5] focus:ring-3 focus:ring-[#EEF2FF]"
              >
                <option value="high">High priority</option>
                <option value="medium">Medium priority</option>
                <option value="low">Low priority</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="detail-estimate"
                className="block text-[12px] font-medium text-[#64748B] mb-1.5"
              >
                Estimate (minutes)
              </label>
              <input
                id="detail-estimate"
                type="number"
                min={5}
                max={480}
                step={5}
                value={task.estimatedMinutes ?? ''}
                placeholder="e.g. 30"
                onChange={(e) =>
                  onUpdateTask(task.id, {
                    estimatedMinutes: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                className="w-full h-10 px-3 rounded-lg bg-[#FFFFFF] border border-[#E2E8F0] text-[13px] text-[#0F172A] placeholder:text-[#94A3B8] tabular-nums focus:outline-none focus:border-[#4F46E5] focus:ring-3 focus:ring-[#EEF2FF]"
              />
            </div>

            <div>
              <label
                htmlFor="detail-date"
                className="block text-[12px] font-medium text-[#64748B] mb-1.5"
              >
                Due date
              </label>
              <input
                id="detail-date"
                type="date"
                value={task.dueDate}
                onChange={(e) =>
                  onUpdateTask(task.id, { dueDate: e.target.value })
                }
                className="w-full h-10 px-3 rounded-lg bg-[#FFFFFF] border border-[#E2E8F0] text-[13px] text-[#0F172A] tabular-nums focus:outline-none focus:border-[#4F46E5] focus:ring-3 focus:ring-[#EEF2FF]"
              />
            </div>

            <div>
              <label
                htmlFor="detail-time"
                className="block text-[12px] font-medium text-[#64748B] mb-1.5"
              >
                Due time
              </label>
              <input
                id="detail-time"
                type="time"
                value={task.dueTime ?? ''}
                onChange={(e) =>
                  onUpdateTask(task.id, {
                    dueTime: e.target.value || undefined,
                  })
                }
                className="w-full h-10 px-3 rounded-lg bg-[#FFFFFF] border border-[#E2E8F0] text-[13px] text-[#0F172A] tabular-nums focus:outline-none focus:border-[#4F46E5] focus:ring-3 focus:ring-[#EEF2FF]"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="detail-notes"
              className="block text-[12px] font-medium text-[#64748B] mb-1.5"
            >
              Notes
            </label>
            <textarea
              id="detail-notes"
              rows={4}
              value={task.notes}
              onChange={(e) => onUpdateTask(task.id, { notes: e.target.value })}
              placeholder="Add context, links, or acceptance criteria..."
              className="w-full p-3 rounded-lg bg-[#FFFFFF] border border-[#E2E8F0] text-[14px] leading-[20px] text-[#0F172A] placeholder:text-[#94A3B8] resize-y focus:outline-none focus:border-[#4F46E5] focus:ring-3 focus:ring-[#EEF2FF]"
            />
          </div>

          {/* Subtasks Checklist */}
          <div className="pt-2 border-t border-[#E2E8F0]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-semibold text-[#0F172A]">
                Subtasks
              </h3>
              {task.subtasks.length > 0 && (
                <span className="text-[12px] text-[#64748B] tabular-nums">
                  {doneSubtasks}/{task.subtasks.length} completed
                </span>
              )}
            </div>

            {task.subtasks.length > 0 && (
              <div className="space-y-1.5 mb-3">
                {task.subtasks.map((sub) => (
                  <div
                    key={sub.id}
                    className="group flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]"
                  >
                    <button
                      type="button"
                      onClick={() => onToggleSubtask(task.id, sub.id)}
                      className="flex items-center gap-2.5 min-w-0 flex-1 text-left"
                    >
                      <span
                        className={`w-4 h-4 rounded-[4px] flex items-center justify-center shrink-0 transition-colors ${
                          sub.completed
                            ? 'bg-[#4F46E5] border-[1.5px] border-[#4F46E5] text-white'
                            : 'bg-[#FFFFFF] border-[1.5px] border-[#CBD5E1]'
                        }`}
                      >
                        {sub.completed && (
                          <Check className="w-2.5 h-2.5" strokeWidth={2.5} />
                        )}
                      </span>
                      <span
                        className={`text-[13px] truncate ${
                          sub.completed
                            ? 'text-[#64748B] line-through'
                            : 'text-[#0F172A]'
                        }`}
                      >
                        {sub.title}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteSubtask(task.id, sub.id)}
                      aria-label={`Remove subtask "${sub.title}"`}
                      className="w-6 h-6 rounded flex items-center justify-center text-[#64748B] hover:text-[#BA1A1A] opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleSubtaskSubmit} className="flex items-center gap-2">
              <input
                type="text"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                placeholder="Add a subtask..."
                className="flex-1 h-9 px-3 rounded-lg bg-[#FFFFFF] border border-[#E2E8F0] text-[13px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#4F46E5] focus:ring-3 focus:ring-[#EEF2FF]"
              />
              <button
                type="submit"
                disabled={!newSubtask.trim()}
                className="inline-flex items-center gap-1 h-9 px-3 rounded-lg bg-[#FFFFFF] border border-[#E2E8F0] text-[12px] font-medium text-[#0F172A] hover:bg-[#F8FAFC] hover:border-[#CBD5E1] disabled:opacity-40 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={2} />
                <span>Add</span>
              </button>
            </form>
          </div>
        </div>

        {/* Footer Metadata */}
        <div className="px-6 py-3 border-t border-[#E2E8F0] bg-[#F8FAFC] text-[12px] text-[#64748B] flex items-center justify-between shrink-0">
          <span className="tabular-nums">
            Created{' '}
            {new Date(task.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
          {task.completedAt && (
            <span className="tabular-nums">
              Completed{' '}
              {new Date(task.completedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
