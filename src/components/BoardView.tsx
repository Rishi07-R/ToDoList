import React, { useState } from 'react';
import { ArrowRight, Check, Plus } from 'lucide-react';
import { getLocalDateStr } from '../data/initialTasks';
import {
  CATEGORY_META,
  NavSection,
  PRIORITY_META,
  SortOption,
  Task,
  TaskCategory,
  TaskStatus,
} from '../types/task';
import { formatDueDateLabel, sortTasks } from '../utils/taskHelpers';

interface BoardViewProps {
  activeNav: NavSection;
  tasks: Task[];
  sortBy: SortOption;
  selectedTaskId: string | null;
  onSelectTask: (taskId: string) => void;
  onUpdateStatus: (taskId: string, status: TaskStatus) => void;
  onToggleComplete: (taskId: string) => void;
  onAddColumnTask: (payload: {
    title: string;
    category: TaskCategory;
    status: TaskStatus;
    dueDate: string;
  }) => void;
}

const COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: 'todo', title: 'To Do' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'completed', title: 'Completed' },
];

export const BoardView: React.FC<BoardViewProps> = ({
  activeNav,
  tasks,
  sortBy,
  selectedTaskId,
  onSelectTask,
  onUpdateStatus,
  onToggleComplete,
  onAddColumnTask,
}) => {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<TaskStatus | null>(null);
  const [addingCol, setAddingCol] = useState<TaskStatus | null>(null);
  const [draftTitle, setDraftTitle] = useState('');

  const defaultCategory: TaskCategory =
    activeNav === 'study' || activeNav === 'projects' || activeNav === 'personal'
      ? activeNav
      : 'inbox';
  const defaultDate = activeNav === 'today' ? getLocalDateStr(0) : '';

  const handleColumnAddSubmit = (e: React.FormEvent, status: TaskStatus) => {
    e.preventDefault();
    const trimmed = draftTitle.trim();
    if (!trimmed) return;
    onAddColumnTask({
      title: trimmed,
      category: defaultCategory,
      status,
      dueDate: defaultDate,
    });
    setDraftTitle('');
    setAddingCol(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
      {COLUMNS.map((col) => {
        const colTasks = sortTasks(
          tasks.filter((t) => t.status === col.id),
          sortBy
        );
        const isOver = dragOverCol === col.id;

        return (
          <div
            key={col.id}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverCol(col.id);
            }}
            onDragLeave={() => {
              if (dragOverCol === col.id) setDragOverCol(null);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setDragOverCol(null);
              const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
              if (taskId) {
                onUpdateStatus(taskId, col.id);
              }
              setDraggedTaskId(null);
            }}
            className={`rounded-[10px] p-3 border transition-colors duration-150 ${
              isOver
                ? 'bg-[#EEF2FF]/70 border-[#4F46E5]'
                : 'bg-[#F1F5F9]/75 border-[#E2E8F0]'
            }`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between px-1 pb-3">
              <div className="flex items-center gap-2">
                <h2 className="text-[13px] font-semibold text-[#0F172A]">
                  {col.title}
                </h2>
                <span className="text-[12px] font-medium text-[#64748B] tabular-nums">
                  {colTasks.length}
                </span>
              </div>
              <button
                type="button"
                aria-label={`Add task to ${col.title}`}
                onClick={() => {
                  setAddingCol(col.id);
                  setDraftTitle('');
                }}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-[#FFFFFF] transition-colors"
              >
                <Plus className="w-4 h-4" strokeWidth={1.75} />
              </button>
            </div>

            {/* Cards Stack */}
            <div className="space-y-2.5">
              {colTasks.map((task) => {
                const isCompleted = task.status === 'completed';
                const catMeta = CATEGORY_META[task.category];
                const priMeta = PRIORITY_META[task.priority];
                const dueInfo = formatDueDateLabel(task.dueDate, task.dueTime);
                const doneSub = task.subtasks.filter((s) => s.completed).length;

                return (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => {
                      setDraggedTaskId(task.id);
                      e.dataTransfer.setData('text/plain', task.id);
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    onDragEnd={() => {
                      setDraggedTaskId(null);
                      setDragOverCol(null);
                    }}
                    onClick={() => onSelectTask(task.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectTask(task.id);
                      }
                    }}
                    className={`bg-[#FFFFFF] rounded-[10px] px-5 py-4 border transition-all duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#4F46E5] ${
                      selectedTaskId === task.id
                        ? 'border-[#4F46E5] shadow-level-2'
                        : 'border-[#E2E8F0] shadow-level-1 hover:border-[#CBD5E1] hover:shadow-level-2'
                    } ${draggedTaskId === task.id ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={isCompleted}
                        aria-label={`Mark "${task.title}" as ${isCompleted ? 'incomplete' : 'complete'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleComplete(task.id);
                        }}
                        className={`mt-0.5 w-[18px] h-[18px] rounded-[4px] flex items-center justify-center shrink-0 transition-colors ${
                          isCompleted
                            ? 'bg-[#4F46E5] border-[1.5px] border-[#4F46E5] text-white'
                            : 'bg-[#FFFFFF] border-[1.5px] border-[#CBD5E1] hover:border-[#4F46E5]'
                        }`}
                      >
                        {isCompleted && (
                          <Check className="w-3 h-3" strokeWidth={2.5} />
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        <div
                          className={`text-[14px] leading-[20px] font-medium ${
                            isCompleted
                              ? 'text-[#64748B] line-through'
                              : 'text-[#0F172A]'
                          }`}
                        >
                          {task.title}
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-[#64748B]">
                          <span
                            className="font-medium"
                            style={{ color: catMeta.textColor }}
                          >
                            {catMeta.label}
                          </span>
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
                            {priMeta.shortLabel}
                          </span>
                          {task.dueDate && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span
                                className={`tabular-nums ${
                                  dueInfo.isOverdue && !isCompleted
                                    ? 'text-[#BA1A1A] font-medium'
                                    : dueInfo.isToday && !isCompleted
                                      ? 'text-[#4F46E5] font-medium'
                                      : ''
                                }`}
                              >
                                {dueInfo.label}
                              </span>
                            </>
                          )}
                          {task.subtasks.length > 0 && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="tabular-nums">
                                {doneSub}/{task.subtasks.length}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Accessible status move action for non-drag users */}
                    {col.id !== 'completed' && (
                      <div className="mt-3 pt-2.5 border-t border-[#F1F5F9] flex justify-end">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateStatus(
                              task.id,
                              col.id === 'todo' ? 'in_progress' : 'completed'
                            );
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-[#64748B] hover:text-[#4F46E5] transition-colors"
                        >
                          <span>
                            {col.id === 'todo'
                              ? 'Start task'
                              : 'Mark complete'}
                          </span>
                          <ArrowRight className="w-3 h-3" strokeWidth={2} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              {colTasks.length === 0 && addingCol !== col.id && (
                <div className="py-6 px-3 text-center text-[12px] text-[#64748B] border border-dashed border-[#CBD5E1] rounded-[10px]">
                  Drop a task here or add new
                </div>
              )}

              {addingCol === col.id ? (
                <form
                  onSubmit={(e) => handleColumnAddSubmit(e, col.id)}
                  className="bg-[#FFFFFF] border border-[#4F46E5] rounded-[10px] p-3 shadow-level-1 space-y-2"
                >
                  <input
                    autoFocus
                    type="text"
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                    placeholder="Task title..."
                    className="w-full text-[13px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none"
                  />
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => setAddingCol(null)}
                      className="px-2.5 py-1 rounded-lg text-[12px] font-medium text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!draftTitle.trim()}
                      className="px-3 py-1 rounded-lg text-[12px] font-medium bg-[#4F46E5] text-white hover:bg-[#4338CA] disabled:opacity-40"
                    >
                      Add
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setAddingCol(col.id);
                    setDraftTitle('');
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-medium text-[#64748B] hover:text-[#0F172A] hover:bg-[#FFFFFF]/80 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" strokeWidth={2} />
                  <span>Add task</span>
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
