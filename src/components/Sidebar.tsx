import React from 'react';
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  HelpCircle,
  Inbox,
  RotateCcw,
  Sun,
  User,
  X,
} from 'lucide-react';
import { CATEGORY_META, NavSection, TaskCategory } from '../types/task';

interface SidebarProps {
  activeNav: NavSection;
  onSelectNav: (nav: NavSection) => void;
  counts: {
    today: number;
    inbox: number;
    upcoming: number;
    study: number;
    projects: number;
    personal: number;
  };
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenShortcuts: () => void;
  onResetDemo: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeNav,
  onSelectNav,
  counts,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  onOpenShortcuts,
  onResetDemo,
}) => {
  const primaryItems: {
    id: NavSection;
    label: string;
    icon: React.ReactNode;
    count?: number;
  }[] = [
    {
      id: 'today',
      label: 'Today',
      icon: <Sun className="w-[18px] h-[18px]" strokeWidth={1.75} />,
      count: counts.today,
    },
    {
      id: 'inbox',
      label: 'Inbox',
      icon: <Inbox className="w-[18px] h-[18px]" strokeWidth={1.75} />,
      count: counts.inbox,
    },
    {
      id: 'upcoming',
      label: 'Upcoming',
      icon: <CalendarDays className="w-[18px] h-[18px]" strokeWidth={1.75} />,
      count: counts.upcoming,
    },
    {
      id: 'overview',
      label: 'Overview',
      icon: <BarChart3 className="w-[18px] h-[18px]" strokeWidth={1.75} />,
    },
  ];

  const categoryItems: {
    id: TaskCategory;
    label: string;
    icon: React.ReactNode;
    count: number;
    color: string;
  }[] = [
    {
      id: 'study',
      label: CATEGORY_META.study.label,
      icon: <BookOpen className="w-[18px] h-[18px]" strokeWidth={1.75} />,
      count: counts.study,
      color: CATEGORY_META.study.textColor,
    },
    {
      id: 'projects',
      label: CATEGORY_META.projects.label,
      icon: <FolderKanban className="w-[18px] h-[18px]" strokeWidth={1.75} />,
      count: counts.projects,
      color: CATEGORY_META.projects.textColor,
    },
    {
      id: 'personal',
      label: CATEGORY_META.personal.label,
      icon: <User className="w-[18px] h-[18px]" strokeWidth={1.75} />,
      count: counts.personal,
      color: CATEGORY_META.personal.textColor,
    },
  ];

  const handleSelect = (section: NavSection) => {
    onSelectNav(section);
    onCloseMobile();
  };

  const sidebarBody = (isMobileDrawer: boolean) => (
    <div className="flex flex-col h-full bg-[#FFFFFF] border-r border-[#E2E8F0]">
      {/* Brand Header */}
      <div
        className={`flex items-center justify-between h-16 px-4 border-b border-[#E2E8F0] shrink-0 ${
          collapsed && !isMobileDrawer ? 'justify-center px-2' : ''
        }`}
      >
        <button
          type="button"
          onClick={() => handleSelect('today')}
          className="flex items-center gap-2.5 text-left focus-visible:outline-2 focus-visible:outline-[#4F46E5] rounded-lg py-1"
          title="TaskFlow Core"
        >
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#4F46E5] text-white shrink-0">
            <CheckSquare className="w-[18px] h-[18px]" strokeWidth={2} />
          </span>
          {(!collapsed || isMobileDrawer) && (
            <span className="font-semibold text-[16px] tracking-[-0.01em] text-[#0F172A] whitespace-nowrap">
              TaskFlow Core
            </span>
          )}
        </button>

        {isMobileDrawer ? (
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close navigation menu"
            className="flex items-center justify-center w-9 h-9 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
          >
            <X className="w-5 h-5" strokeWidth={1.75} />
          </button>
        ) : (
          !collapsed && (
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
              className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" strokeWidth={1.75} />
            </button>
          )
        )}
      </div>

      {/* Expand button when collapsed on desktop */}
      {collapsed && !isMobileDrawer && (
        <div className="hidden lg:flex justify-center pt-3">
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label="Expand sidebar"
            title="Expand sidebar"
            className="flex items-center justify-center w-9 h-9 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
          >
            <ChevronRight className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>
      )}

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6" aria-label="Workspace navigation">
        <div className="space-y-1">
          {(!collapsed || isMobileDrawer) && (
            <div className="px-2.5 pb-1.5 text-[11px] font-semibold tracking-[0.02em] text-[#64748B]">
              Workspace
            </div>
          )}
          {primaryItems.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                title={collapsed && !isMobileDrawer ? item.label : undefined}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-[14px] font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-[#4F46E5] ${
                  isActive
                    ? 'bg-[#EEF2FF] text-[#4F46E5]'
                    : 'text-[#464555] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
                } ${collapsed && !isMobileDrawer ? 'justify-center px-0' : ''}`}
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <span className={isActive ? 'text-[#4F46E5]' : 'text-[#64748B]'}>
                    {item.icon}
                  </span>
                  {(!collapsed || isMobileDrawer) && (
                    <span className="truncate whitespace-nowrap">{item.label}</span>
                  )}
                </span>
                {(!collapsed || isMobileDrawer) &&
                  typeof item.count === 'number' &&
                  item.count > 0 && (
                    <span
                      className={`text-[12px] font-medium tabular-nums ml-2 ${
                        isActive ? 'text-[#4F46E5]' : 'text-[#64748B]'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
              </button>
            );
          })}
        </div>

        <div className="pt-2 border-t border-[#E2E8F0] space-y-1">
          {(!collapsed || isMobileDrawer) && (
            <div className="px-2.5 pb-1.5 text-[11px] font-semibold tracking-[0.02em] text-[#64748B]">
              Categories
            </div>
          )}
          {categoryItems.map((cat) => {
            const isActive = activeNav === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleSelect(cat.id)}
                title={collapsed && !isMobileDrawer ? cat.label : undefined}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-[14px] font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-[#4F46E5] ${
                  isActive
                    ? 'bg-[#EEF2FF] text-[#4F46E5]'
                    : 'text-[#464555] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
                } ${collapsed && !isMobileDrawer ? 'justify-center px-0' : ''}`}
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <span style={{ color: isActive ? '#4F46E5' : cat.color }}>
                    {cat.icon}
                  </span>
                  {(!collapsed || isMobileDrawer) && (
                    <span className="truncate whitespace-nowrap">{cat.label}</span>
                  )}
                </span>
                {(!collapsed || isMobileDrawer) && cat.count > 0 && (
                  <span
                    className={`text-[12px] font-medium tabular-nums ml-2 ${
                      isActive ? 'text-[#4F46E5]' : 'text-[#64748B]'
                    }`}
                  >
                    {cat.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Bottom Utility Footer */}
      <div className="p-3 border-t border-[#E2E8F0] space-y-2 shrink-0">
        {(!collapsed || isMobileDrawer) ? (
          <>
            <div className="flex items-center justify-between gap-2 px-2 py-1.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] border border-[#E2DFFF] text-[#4F46E5] font-semibold text-[12px] flex items-center justify-center shrink-0">
                  AK
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-medium text-[#0F172A] truncate">
                    Alex Kim
                  </div>
                  <div className="text-[11px] text-[#64748B] truncate">
                    Personal Workspace
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 pt-0.5">
              <button
                type="button"
                onClick={onOpenShortcuts}
                className="flex-1 flex items-center justify-center gap-1.5 h-8 px-2.5 rounded-lg text-[12px] font-medium text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] border border-transparent hover:border-[#E2E8F0] transition-colors whitespace-nowrap"
              >
                <HelpCircle className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span>Shortcuts</span>
              </button>
              <button
                type="button"
                onClick={onResetDemo}
                className="flex-1 flex items-center justify-center gap-1.5 h-8 px-2.5 rounded-lg text-[12px] font-medium text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] border border-transparent hover:border-[#E2E8F0] transition-colors whitespace-nowrap"
                title="Restore sample tasks"
              >
                <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span>Reset data</span>
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={onOpenShortcuts}
              title="Keyboard shortcuts"
              aria-label="Keyboard shortcuts"
              className="w-9 h-9 rounded-lg flex items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
            >
              <HelpCircle className="w-4 h-4" strokeWidth={1.75} />
            </button>
            <div
              className="w-8 h-8 rounded-lg bg-[#EEF2FF] border border-[#E2DFFF] text-[#4F46E5] font-semibold text-[12px] flex items-center justify-center"
              title="Alex Kim"
            >
              AK
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Lateral Sidebar */}
      <aside
        className={`hidden lg:block shrink-0 transition-[width] duration-200 ease-out ${
          collapsed ? 'w-[68px]' : 'w-[260px]'
        }`}
      >
        <div className="sticky top-0 h-screen">{sidebarBody(false)}</div>
      </aside>

      {/* Mobile / Tablet Slide-Over Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-[#0F172A]/20 backdrop-blur-[1px]"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative z-10 w-[260px] max-w-[82vw] h-full shadow-level-3">
            {sidebarBody(true)}
          </aside>
        </div>
      )}
    </>
  );
};
