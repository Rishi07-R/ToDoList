import { Task } from '../types/task';

export function getLocalDateStr(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function createInitialTasks(): Task[] {
  const yesterday = getLocalDateStr(-1);
  const today = getLocalDateStr(0);
  const tomorrow = getLocalDateStr(1);
  const inTwoDays = getLocalDateStr(2);
  const inFourDays = getLocalDateStr(4);
  const inSixDays = getLocalDateStr(6);
  const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString();
  const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString();
  const fourDaysAgo = new Date(Date.now() - 4 * 86400000).toISOString();
  const todayIso = new Date().toISOString();

  return [
    {
      id: 'tsk-101',
      title: 'Finalize Q4 API schema migration notes',
      notes:
        'Verify backward-compatibility headers for v2 webhook consumers and publish the changelog to the team workspace before noon review.',
      category: 'projects',
      status: 'in_progress',
      priority: 'high',
      dueDate: today,
      dueTime: '11:30',
      estimatedMinutes: 45,
      subtasks: [
        { id: 'sub-1', title: 'Audit deprecated payload fields', completed: true },
        { id: 'sub-2', title: 'Update OpenAPI response examples', completed: true },
        { id: 'sub-3', title: 'Send review link to backend leads', completed: false },
      ],
      createdAt: threeDaysAgo,
    },
    {
      id: 'tsk-102',
      title: 'Synthesize Chapter 6 distributed consensus notes',
      notes:
        'Focus on Raft leader election edge cases, split-vote mitigation, and log compaction snapshots.',
      category: 'study',
      status: 'todo',
      priority: 'high',
      dueDate: today,
      dueTime: '15:00',
      estimatedMinutes: 60,
      subtasks: [
        { id: 'sub-4', title: 'Annotate safety proof diagram', completed: true },
        { id: 'sub-5', title: 'Write 5 flashcard recall prompts', completed: false },
      ],
      createdAt: twoDaysAgo,
    },
    {
      id: 'tsk-103',
      title: 'Renew regional transit pass and update auto-pay',
      notes: 'Switch billing card before the 1st of next month.',
      category: 'personal',
      status: 'todo',
      priority: 'medium',
      dueDate: today,
      dueTime: '18:00',
      estimatedMinutes: 15,
      subtasks: [],
      createdAt: twoDaysAgo,
    },
    {
      id: 'tsk-104',
      title: 'Review pull request for keyboard navigation shortcuts',
      notes: 'Check Esc handling on slide-over panes and aria-live announcements.',
      category: 'projects',
      status: 'todo',
      priority: 'medium',
      dueDate: yesterday,
      estimatedMinutes: 25,
      subtasks: [],
      createdAt: fourDaysAgo,
    },
    {
      id: 'tsk-105',
      title: 'Draft weekly engineering sync agenda',
      notes: 'Collect blockers from mobile and design systems threads.',
      category: 'inbox',
      status: 'todo',
      priority: 'medium',
      dueDate: '',
      estimatedMinutes: 20,
      subtasks: [],
      createdAt: todayIso,
    },
    {
      id: 'tsk-106',
      title: 'Book annual dental checkup appointment',
      notes: 'Prefer Tuesday or Thursday morning slot before 9:30 AM.',
      category: 'inbox',
      status: 'todo',
      priority: 'low',
      dueDate: '',
      estimatedMinutes: 10,
      subtasks: [],
      createdAt: todayIso,
    },
    {
      id: 'tsk-107',
      title: 'Complete Linear Algebra problem set 4',
      notes: 'Eigenvalues, orthogonal diagonalization, and SVD exercises 1–12.',
      category: 'study',
      status: 'in_progress',
      priority: 'high',
      dueDate: tomorrow,
      dueTime: '14:00',
      estimatedMinutes: 90,
      subtasks: [
        { id: 'sub-6', title: 'Problems 1–6 (characteristic polynomials)', completed: true },
        { id: 'sub-7', title: 'Problems 7–12 (spectral decomposition)', completed: false },
      ],
      createdAt: threeDaysAgo,
    },
    {
      id: 'tsk-108',
      title: 'Prepare design tokens audit for typography scale',
      notes: 'Confirm line-height ratios across 12px labels and 14px dense table rows.',
      category: 'projects',
      status: 'todo',
      priority: 'medium',
      dueDate: inTwoDays,
      dueTime: '10:00',
      estimatedMinutes: 40,
      subtasks: [],
      createdAt: twoDaysAgo,
    },
    {
      id: 'tsk-109',
      title: 'Restock pantry staples and cold-brew beans',
      notes: 'Oat milk, Ethiopian light roast, sparkling water, olive oil.',
      category: 'personal',
      status: 'todo',
      priority: 'low',
      dueDate: inTwoDays,
      estimatedMinutes: 35,
      subtasks: [],
      createdAt: twoDaysAgo,
    },
    {
      id: 'tsk-110',
      title: 'Benchmark client-side search indexing latency',
      notes: 'Compare prefix trie vs simple normalized substring filter at 2,000 rows.',
      category: 'projects',
      status: 'todo',
      priority: 'low',
      dueDate: inFourDays,
      estimatedMinutes: 50,
      subtasks: [],
      createdAt: fourDaysAgo,
    },
    {
      id: 'tsk-111',
      title: 'Read paper: Calm Technology & Peripheral Attention',
      notes: 'Highlight key takeaways for Friday study group discussion.',
      category: 'study',
      status: 'todo',
      priority: 'medium',
      dueDate: inSixDays,
      estimatedMinutes: 45,
      subtasks: [],
      createdAt: fourDaysAgo,
    },
    {
      id: 'tsk-112',
      title: 'Submit monthly expense receipts for workspace hardware',
      notes: 'Upload monitor arm and USB-C dock PDFs.',
      category: 'personal',
      status: 'completed',
      priority: 'medium',
      dueDate: today,
      estimatedMinutes: 15,
      subtasks: [],
      createdAt: threeDaysAgo,
      completedAt: todayIso,
    },
    {
      id: 'tsk-113',
      title: 'Refactor date utility timezone formatting',
      notes: 'Standardized local YYYY-MM-DD comparisons across calendar and list views.',
      category: 'projects',
      status: 'completed',
      priority: 'high',
      dueDate: yesterday,
      estimatedMinutes: 30,
      subtasks: [
        { id: 'sub-8', title: 'Extract getLocalDateStr helper', completed: true },
        { id: 'sub-9', title: 'Verify midnight boundary cases', completed: true },
      ],
      createdAt: fourDaysAgo,
      completedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    {
      id: 'tsk-114',
      title: 'Organize lecture slides archive by module',
      notes: 'Renamed weeks 1–5 PDFs into consistent Module_XX naming.',
      category: 'study',
      status: 'completed',
      priority: 'low',
      dueDate: yesterday,
      estimatedMinutes: 20,
      subtasks: [],
      createdAt: fourDaysAgo,
      completedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
  ];
}
