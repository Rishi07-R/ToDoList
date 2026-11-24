import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { getLocalDateStr } from '../data/initialTasks';
import { NavSection, SortOption, Task, TaskStatus } from '../types/task';
import { sortTasks } from '../utils/taskHelpers';
import { TaskRow } from './TaskRow';

interface TaskListViewProps {
  activeNav: NavSection;
  tasks: Task[];
  sortBy: SortOption;
  selectedTaskId: string | null;
  onToggleComplete: (taskId: string) => void;
  onSelectTask: (taskId: string) => void;
  onUpdateStatus: (taskId: string, status: TaskStatus) => void;
  onDeleteTask: (taskId: string) => void;
  onFilterCategory: (section: NavSection) => void;
  onClearCompleted: (taskIds: string[]) => void;
  onFocusQuickAdd: () => void;
}

interface TaskGroup {
  id: string;
  title: string;
  items: Task[];
  isCompletedGroup?: boolean;
}

export const TaskListView: React.FC<TaskListViewProps> = ({
  activeNav,
  tasks,
  sortBy,
  selectedTaskId,
  onToggleComplete,
  onSelectTask,
  onUpdateStatus,
  onDeleteTask,
  onFilterCategory,
  onClearCompleted,
  onFocusQuickAdd,
}) => {
  const [completedExpanded, setCompletedExpanded] = useState(true);
  const todayStr = getLocalDateStr(0);
  const tomorrowStr = getLocalDateStr(1);
  const endOfWeekStr = getLocalDateStr(7);

  const buildGroups = (): TaskGroup[] => {
    const active = sortTasks(
      tasks.filter((t) => t.status !== 'completed'),
      sortBy
    );
    const completed = sortTasks(
      tasks.filter((t) => t.status === 'completed'),
      sortBy
    );

    if (activeNav === 'today') {
      const overdue = active.filter((t) => t.dueDate && t.dueDate < todayStr);
      const dueToday = active.filter((t) => t.dueDate === todayStr);
      const groups: TaskGroup[] = [];
      if (overdue.length > 0) {
        groups.push({ id: 'overdue', title: 'Overdue', items: overdue });
      }
      groups.push({ id: 'due-today', title: 'Due today', items: dueToday });
      if (completed.length > 0) {
        groups.push({
          id: 'completed',
          title: 'Completed',
          items: completed,
          isCompletedGroup: true,
        });
      }
      return groups;
    }

    if (activeNav === 'upcoming') {
      const tomorrow = active.filter((t) => t.dueDate === tomorrowStr);
      const thisWeek = active.filter(
        (t) => t.dueDate > tomorrowStr && t.dueDate <= endOfWeekStr
      );
      const later = active.filter((t) => t.dueDate > endOfWeekStr);
      const groups: TaskGroup[] = [
        { id: 'tomorrow', title: 'Tomorrow', items: tomorrow },
        { id: 'this-week', title: 'Next 7 days', items: thisWeek },
        { id: 'later', title: 'Later', items: later },
      ].filter((g) => g.items.length > 0);

      if (completed.length > 0) {
        groups.push({
          id: 'completed',
          title: 'Completed',
          items: completed,
          isCompletedGroup: true,
        });
      }
      return groups;
    }

    const groups: TaskGroup[] = [{ id: 'active', title: 'Active', items: active }];
    if (completed.length > 0) {
      groups.push({
        id: 'completed',
        title: 'Completed',
        items: completed,
        isCompletedGroup: true,
      });
    }
    return groups;
  };

  const groups = buildGroups();
  const totalCount = groups.reduce((acc, g) => acc + g.items.length, 0);

  if (totalCount === 0) {
    return (
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-[10px] shadow-level-1 py-14 px-6 text-center">
        <h3 className="text-[16px] font-semibold text-[#0F172A]">
          No tasks in this view
        </h3>
        <p className="mt-1.5 text-[14px] text-[#64748B] max-w-md mx-auto">
          Everything here is clear. Add a new task above or adjust your active
          filters to review other items.
        </p>
        <button
          type="button"
          onClick={onFocusQuickAdd}
          className="mt-5 inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[#4F46E5] text-white text-[13px] font-medium hover:bg-[#4338CA] transition-colors"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          <span>Add a task</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => {
        if (group.items.length === 0 && group.id !== 'due-today') return null;

        const isCollapsed = group.isCompletedGroup && !completedExpanded;

        return (
          <section key={group.id} aria-labelledby={`group-${group.id}`}>
            <div className="flex items-center justify-between mb-2.5 px-0.5">
              {group.isCompletedGroup ? (
                <button
                  type="button"
                  onClick={() => setCompletedExpanded((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#464555] hover:text-[#0F172A] transition-colors"
                >
                  {completedExpanded ? (
                    <ChevronDown className="w-4 h-4 text-[#64748B]" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-[#64748B]" />
                  )}
                  <span id={`group-${group.id}`}>{group.title}</span>
                  <span className="text-[12px] font-medium text-[#64748B] tabular-nums ml-1">
                    {group.items.length}
                  </span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <h2
                    id={`group-${group.id}`}
                    className={`text-[13px] font-semibold tracking-[-0.005em] ${
                      group.id === 'overdue'
                        ? 'text-[#BA1A1A]'
                        : 'text-[#464555]'
                    }`}
                  >
                    {group.title}
                  </h2>
                  <span className="text-[12px] font-medium text-[#64748B] tabular-nums">
                    {group.items.length}
                  </span>
                </div>
              )}

              {group.isCompletedGroup && group.items.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    onClearCompleted(group.items.map((t) => t.id))
                  }
                  className="text-[12px] font-medium text-[#64748B] hover:text-[#BA1A1A] transition-colors"
                >
                  Clear completed
                </button>
              )}
            </div>

            {!isCollapsed && (
              <div className="space-y-2">
                {group.items.length === 0 ? (
                  <div className="px-4 py-5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-[10px] text-[13px] text-[#64748B]">
                    Nothing scheduled for today yet. Use the quick-add bar above
                    to plan your focus.
                  </div>
                ) : (
                  group.items.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      isSelected={selectedTaskId === task.id}
                      onToggleComplete={onToggleComplete}
                      onSelectTask={onSelectTask}
                      onUpdateStatus={onUpdateStatus}
                      onDeleteTask={onDeleteTask}
                      onFilterCategory={onFilterCategory}
                    />
                  ))
                )}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
};
