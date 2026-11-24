import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowUpDown,
  Columns3,
  List,
  Menu,
  Plus,
  Search,
  X,
} from 'lucide-react';
import { BoardView } from './components/BoardView';
import { OverviewView } from './components/OverviewView';
import { QuickAddBar } from './components/QuickAddBar';
import { ShortcutsModal } from './components/ShortcutsModal';
import { Sidebar } from './components/Sidebar';
import { TaskDetailDrawer } from './components/TaskDetailDrawer';
import { TaskListView } from './components/TaskListView';
import { getLocalDateStr } from './data/initialTasks';
import { useTaskStore } from './hooks/useTaskStore';
import {
  CATEGORY_META,
  NavSection,
  SortOption,
  StatusFilter,
  TaskPriority,
  ViewMode,
} from './types/task';

const NAV_META: Record<
  NavSection,
  { title: string; subtitle: string; breadcrumb: string }
> = {
  today: {
    title: 'Today',
    subtitle: 'Focused view of overdue items and tasks scheduled for today.',
    breadcrumb: 'Workspace / Today',
  },
  inbox: {
    title: 'Inbox',
    subtitle: 'Quickly captured tasks ready to organize and schedule.',
    breadcrumb: 'Workspace / Inbox',
  },
  upcoming: {
    title: 'Upcoming',
    subtitle: 'Agenda across tomorrow, the next 7 days, and beyond.',
    breadcrumb: 'Workspace / Upcoming',
  },
  overview: {
    title: 'Overview',
    subtitle: 'Weekly completion momentum and workload distribution.',
    breadcrumb: 'Workspace / Overview',
  },
  study: {
    title: 'Study',
    subtitle: CATEGORY_META.study.description,
    breadcrumb: 'Categories / Study',
  },
  projects: {
    title: 'Projects',
    subtitle: CATEGORY_META.projects.description,
    breadcrumb: 'Categories / Projects',
  },
  personal: {
    title: 'Personal',
    subtitle: CATEGORY_META.personal.description,
    breadcrumb: 'Categories / Personal',
  },
};

export default function App() {
  const {
    tasks,
    counts,
    undoState,
    addTask,
    toggleTaskCompletion,
    updateTaskStatus,
    updateTask,
    deleteTask,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    clearCompletedInScope,
    resetDemoTasks,
    undoLastAction,
    dismissUndo,
  } = useTaskStore();

  const [activeNav, setActiveNav] = useState<NavSection>('today');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | TaskPriority>(
    'all'
  );
  const [sortBy, setSortBy] = useState<SortOption>('dueDate');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  const quickAddRef = useRef<HTMLInputElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      if (isTyping) return;

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        if (activeNav === 'overview') {
          setActiveNav('today');
        }
        window.setTimeout(() => quickAddRef.current?.focus(), 0);
      } else if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === '1' && activeNav !== 'overview') {
        setViewMode('list');
      } else if (e.key === '2' && activeNav !== 'overview') {
        setViewMode('board');
      } else if (e.key === '?') {
        e.preventDefault();
        setShortcutsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeNav]);

  const todayStr = getLocalDateStr(0);

  // Scope tasks to active navigation section + live filters
  const scopedTasks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return tasks.filter((task) => {
      // Section filter
      if (activeNav === 'today') {
        const isTodayOrOverdue = task.dueDate !== '' && task.dueDate <= todayStr;
        const completedToday =
          task.status === 'completed' &&
          ((task.completedAt && task.completedAt.slice(0, 10) === todayStr) ||
            task.dueDate === todayStr);
        if (!isTodayOrOverdue && !completedToday) return false;
      } else if (activeNav === 'inbox') {
        if (task.category !== 'inbox') return false;
      } else if (activeNav === 'upcoming') {
        if (task.dueDate === '' || task.dueDate <= todayStr) return false;
      } else if (
        activeNav === 'study' ||
        activeNav === 'projects' ||
        activeNav === 'personal'
      ) {
        if (task.category !== activeNav) return false;
      }

      // Status filter
      if (statusFilter === 'active' && task.status === 'completed') {
        return false;
      }
      if (statusFilter === 'completed' && task.status !== 'completed') {
        return false;
      }

      // Priority filter
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
        return false;
      }

      // Search query
      if (query) {
        const inTitle = task.title.toLowerCase().includes(query);
        const inNotes = task.notes.toLowerCase().includes(query);
        const inCategory = task.category.toLowerCase().includes(query);
        if (!inTitle && !inNotes && !inCategory) return false;
      }

      return true;
    });
  }, [tasks, activeNav, todayStr, statusFilter, priorityFilter, searchQuery]);

  const selectedTask = useMemo(
    () => tasks.find((t) => t.id === selectedTaskId) ?? null,
    [tasks, selectedTaskId]
  );

  const navInfo = NAV_META[activeNav];
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const activeInScopeCount = scopedTasks.filter(
    (t) => t.status !== 'completed'
  ).length;
  const completedInScopeCount = scopedTasks.filter(
    (t) => t.status === 'completed'
  ).length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex">
      {/* Lateral Sidebar Navigation */}
      <Sidebar
        activeNav={activeNav}
        onSelectNav={(section) => {
          setActiveNav(section);
          setSelectedTaskId(null);
        }}
        counts={counts}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        onOpenShortcuts={() => setShortcutsOpen(true)}
        onResetDemo={resetDemoTasks}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Workspace Header */}
        <header className="sticky top-0 z-30 h-16 bg-[#FFFFFF]/95 backdrop-blur-xs border-b border-[#E2E8F0] px-4 sm:px-6 lg:px-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center text-[#464555] hover:text-[#0F172A] hover:bg-[#F8FAFC] border border-[#E2E8F0]"
            >
              <Menu className="w-5 h-5" strokeWidth={1.75} />
            </button>

            <span className="text-[13px] font-medium text-[#64748B] truncate whitespace-nowrap">
              {navInfo.breadcrumb}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Live Client-side Search */}
            {activeNav !== 'overview' && (
              <div className="relative w-44 sm:w-64">
                <Search
                  className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  strokeWidth={1.75}
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tasks..."
                  aria-label="Search tasks"
                  className="w-full h-9 pl-9 pr-8 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[13px] text-[#0F172A] placeholder:text-[#94A3B8] focus:bg-[#FFFFFF] focus:outline-none focus:border-[#4F46E5] focus:ring-3 focus:ring-[#EEF2FF] transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                if (activeNav === 'overview') {
                  setActiveNav('today');
                }
                window.setTimeout(() => quickAddRef.current?.focus(), 0);
              }}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-[#4F46E5] text-white text-[13px] font-medium hover:bg-[#4338CA] active:bg-[#3730A3] transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" strokeWidth={2} />
              <span className="hidden sm:inline">New task</span>
            </button>
          </div>
        </header>

        {/* Active Canvas */}
        <main className="flex-1 w-full max-w-[1160px] mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-8 space-y-6">
          {/* Page Title & Contextual Toolbar */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-baseline gap-3">
                <h1 className="text-[28px] sm:text-[32px] leading-[38px] font-bold tracking-[-0.02em] text-[#0F172A]">
                  {navInfo.title}
                </h1>
                {activeNav === 'today' && (
                  <span className="text-[13px] font-medium text-[#64748B]">
                    {todayFormatted}
                  </span>
                )}
              </div>
              <p className="mt-1 text-[14px] text-[#64748B]">
                {navInfo.subtitle}
              </p>
            </div>

            {activeNav !== 'overview' && (
              <div className="flex flex-wrap items-center gap-2 text-[12px]">
                {/* Segmented Status Filter */}
                <div
                  className="inline-flex items-center p-0.5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg shadow-level-1"
                  role="group"
                  aria-label="Filter by completion status"
                >
                  {(['all', 'active', 'completed'] as StatusFilter[]).map(
                    (status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setStatusFilter(status)}
                        className={`px-2.5 py-1.5 rounded-md font-medium capitalize transition-colors whitespace-nowrap ${
                          statusFilter === status
                            ? 'bg-[#EEF2FF] text-[#4F46E5]'
                            : 'text-[#64748B] hover:text-[#0F172A]'
                        }`}
                      >
                        {status}
                      </button>
                    )
                  )}
                </div>

                {/* Priority Filter */}
                <select
                  aria-label="Filter by priority"
                  value={priorityFilter}
                  onChange={(e) =>
                    setPriorityFilter(e.target.value as 'all' | TaskPriority)
                  }
                  className="h-8 px-2.5 rounded-lg bg-[#FFFFFF] border border-[#E2E8F0] shadow-level-1 font-medium text-[#0F172A] focus:outline-none focus:border-[#4F46E5] cursor-pointer"
                >
                  <option value="all">All priorities</option>
                  <option value="high">High only</option>
                  <option value="medium">Medium only</option>
                  <option value="low">Low only</option>
                </select>

                {/* Sort Selector */}
                <label className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-[#FFFFFF] border border-[#E2E8F0] shadow-level-1 font-medium text-[#0F172A] cursor-pointer">
                  <ArrowUpDown
                    className="w-3.5 h-3.5 text-[#64748B]"
                    strokeWidth={1.75}
                  />
                  <select
                    aria-label="Sort tasks"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="bg-transparent focus:outline-none cursor-pointer"
                  >
                    <option value="dueDate">Due date</option>
                    <option value="priority">Priority</option>
                    <option value="createdAt">Recently added</option>
                  </select>
                </label>

                {/* List / Board View Toggle */}
                <div
                  className="inline-flex items-center p-0.5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg shadow-level-1"
                  role="group"
                  aria-label="View layout"
                >
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    aria-label="List view"
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                      viewMode === 'list'
                        ? 'bg-[#EEF2FF] text-[#4F46E5]'
                        : 'text-[#64748B] hover:text-[#0F172A]'
                    }`}
                  >
                    <List className="w-3.5 h-3.5" strokeWidth={2} />
                    <span>List</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('board')}
                    aria-label="Board view"
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                      viewMode === 'board'
                        ? 'bg-[#EEF2FF] text-[#4F46E5]'
                        : 'text-[#64748B] hover:text-[#0F172A]'
                    }`}
                  >
                    <Columns3 className="w-3.5 h-3.5" strokeWidth={2} />
                    <span>Board</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {activeNav === 'overview' ? (
            <OverviewView
              tasks={tasks}
              onSelectTask={(id) => setSelectedTaskId(id)}
              onToggleComplete={toggleTaskCompletion}
              onNavigate={(section) => setActiveNav(section)}
            />
          ) : (
            <>
              {/* Quick-Add Inline Bar */}
              <QuickAddBar
                activeNav={activeNav}
                inputRef={quickAddRef}
                onAddTask={(payload) => addTask(payload)}
              />

              {/* Compact Scope Summary Line */}
              <div className="flex items-center justify-between text-[12px] text-[#64748B] px-0.5">
                <span className="tabular-nums">
                  {activeInScopeCount} open · {completedInScopeCount} completed
                </span>
                {(searchQuery || priorityFilter !== 'all' || statusFilter !== 'all') && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setPriorityFilter('all');
                      setStatusFilter('all');
                    }}
                    className="font-medium text-[#4F46E5] hover:underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>

              {/* Active View: List or Board */}
              {viewMode === 'list' ? (
                <TaskListView
                  activeNav={activeNav}
                  tasks={scopedTasks}
                  sortBy={sortBy}
                  selectedTaskId={selectedTaskId}
                  onToggleComplete={toggleTaskCompletion}
                  onSelectTask={(id) => setSelectedTaskId(id)}
                  onUpdateStatus={updateTaskStatus}
                  onDeleteTask={deleteTask}
                  onFilterCategory={(section) => setActiveNav(section)}
                  onClearCompleted={clearCompletedInScope}
                  onFocusQuickAdd={() => quickAddRef.current?.focus()}
                />
              ) : (
                <BoardView
                  activeNav={activeNav}
                  tasks={scopedTasks}
                  sortBy={sortBy}
                  selectedTaskId={selectedTaskId}
                  onSelectTask={(id) => setSelectedTaskId(id)}
                  onUpdateStatus={updateTaskStatus}
                  onToggleComplete={toggleTaskCompletion}
                  onAddColumnTask={(payload) => addTask(payload)}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Task Detail Slide-Over Pane */}
      <TaskDetailDrawer
        task={selectedTask}
        onClose={() => setSelectedTaskId(null)}
        onUpdateTask={updateTask}
        onToggleComplete={toggleTaskCompletion}
        onAddSubtask={addSubtask}
        onToggleSubtask={toggleSubtask}
        onDeleteSubtask={deleteSubtask}
        onDeleteTask={deleteTask}
      />

      {/* Keyboard Shortcuts Reference Modal */}
      <ShortcutsModal
        open={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />

      {/* Undo Action Toast */}
      {undoState && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-4 px-4 py-3 rounded-[10px] bg-[#0F172A] text-white text-[13px] shadow-level-3"
        >
          <span className="truncate max-w-[260px]">{undoState.message}</span>
          <button
            type="button"
            onClick={undoLastAction}
            className="font-semibold text-[#C3C0FF] hover:text-white transition-colors shrink-0"
          >
            Undo
          </button>
          <button
            type="button"
            onClick={dismissUndo}
            aria-label="Dismiss notification"
            className="text-[#94A3B8] hover:text-white transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
