'use client';

import { useEffect, useState, useMemo } from 'react';
import { Filter, Plus, Clock, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';
import { getTasks, saveTasks, todayISO, formatShortDateFR } from '@/lib/storage';
import type { Task, TaskStatus, TaskPriority, TaskDepartment } from '@/types';
import BottomSheet from '@/components/BottomSheet';

const deptColors: Record<TaskDepartment, string> = {
  Coaching: 'bg-coaching',
  Opérations: 'bg-operations',
  Comptoir: 'bg-comptoir',
};

const priorityBadge: Record<TaskPriority, { bg: string; text: string }> = {
  haute: { bg: 'bg-error/10', text: 'text-error' },
  moyenne: { bg: 'bg-warning/10', text: 'text-warning' },
  basse: { bg: 'bg-slate-bg', text: 'text-slate-text-muted' },
};

const statusOptions: TaskStatus[] = ['à faire', 'en cours', 'terminé'];
const priorityOptions: TaskPriority[] = ['haute', 'moyenne', 'basse'];
const deptOptions: TaskDepartment[] = ['Coaching', 'Opérations', 'Comptoir'];

export default function TachesPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('');
  const [prioFilter, setPrioFilter] = useState<TaskPriority | ''>('');
  const [deptFilter, setDeptFilter] = useState<TaskDepartment | ''>('');

  // New task form
  const [newTitle, setNewTitle] = useState('');
  const [newDept, setNewDept] = useState<TaskDepartment>('Coaching');
  const [newPrio, setNewPrio] = useState<TaskPriority>('moyenne');
  const [newDeadline, setNewDeadline] = useState('');

  useEffect(() => {
    setTasks(getTasks());
  }, []);

  const today = todayISO();

  const filtered = useMemo(() => {
    let result = [...tasks];
    if (statusFilter) result = result.filter(t => t.status === statusFilter);
    if (prioFilter) result = result.filter(t => t.priority === prioFilter);
    if (deptFilter) result = result.filter(t => t.department === deptFilter);
    // Sort: overdue first, then by deadline
    result.sort((a, b) => {
      const aOver = a.status !== 'terminé' && a.deadline < today ? 0 : 1;
      const bOver = b.status !== 'terminé' && b.deadline < today ? 0 : 1;
      if (aOver !== bOver) return aOver - bOver;
      return a.deadline.localeCompare(b.deadline);
    });
    return result;
  }, [tasks, statusFilter, prioFilter, deptFilter, today]);

  function cycleStatus(id: string) {
    const updated = tasks.map(t => {
      if (t.id !== id) return t;
      const next: TaskStatus = t.status === 'à faire' ? 'en cours' : t.status === 'en cours' ? 'terminé' : 'à faire';
      return { ...t, status: next };
    });
    setTasks(updated);
    saveTasks(updated);
  }

  function addTask() {
    if (!newTitle.trim()) return;
    const task: Task = {
      id: 't' + Date.now(),
      title: newTitle.trim(),
      assignee: 'Jacob',
      deadline: newDeadline || todayISO(),
      priority: newPrio,
      status: 'à faire',
      department: newDept,
      createdAt: todayISO(),
    };
    const updated = [task, ...tasks];
    setTasks(updated);
    saveTasks(updated);
    setNewTitle('');
    setNewDeadline('');
    setNewOpen(false);
  }

  const activeFilters = [statusFilter, prioFilter, deptFilter].filter(Boolean).length;

  return (
    <div className="px-4 pt-12 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-text">Mes tâches</h1>
        <button
          onClick={() => setFilterOpen(true)}
          className="relative w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-bg"
        >
          <Filter size={20} className="text-slate-text-secondary" />
          {activeFilters > 0 && (
            <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-slate-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {activeFilters}
            </span>
          )}
        </button>
      </div>

      {/* Task cards */}
      <div className="flex flex-col gap-3">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-text-muted">
            Aucune tâche trouvée
          </div>
        )}
        {filtered.map((task) => {
          const isOverdue = task.status !== 'terminé' && task.deadline < today;
          const pb = priorityBadge[task.priority];
          return (
            <div
              key={task.id}
              className={clsx(
                'bg-slate-surface rounded-xl border border-slate-border overflow-hidden flex transition-transform active:scale-[0.98]',
                task.status === 'terminé' && 'opacity-60'
              )}
            >
              {/* Department color bar */}
              <div className={clsx('w-1.5 shrink-0', deptColors[task.department])} />
              <div className="flex-1 p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <button
                    onClick={() => cycleStatus(task.id)}
                    className={clsx(
                      'w-5 h-5 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center transition-colors',
                      task.status === 'terminé'
                        ? 'bg-success border-success text-white'
                        : task.status === 'en cours'
                          ? 'border-slate-accent bg-slate-accent/10'
                          : 'border-slate-border'
                    )}
                  >
                    {task.status === 'terminé' && (
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={clsx(
                      'text-sm font-medium',
                      task.status === 'terminé' ? 'line-through text-slate-text-muted' : 'text-slate-text'
                    )}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-xs text-slate-text-muted mt-0.5 line-clamp-1">{task.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className={clsx('text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded', pb.bg, pb.text)}>
                        {task.priority}
                      </span>
                      {task.category && (
                        <span className="text-[10px] text-slate-text-muted bg-slate-bg px-1.5 py-0.5 rounded">
                          {task.category}
                        </span>
                      )}
                      <span className={clsx(
                        'flex items-center gap-0.5 text-[10px]',
                        isOverdue ? 'text-error font-semibold' : 'text-slate-text-muted'
                      )}>
                        {isOverdue ? <AlertTriangle size={10} /> : <Clock size={10} />}
                        {formatShortDateFR(task.deadline)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* FAB */}
      <button
        onClick={() => setNewOpen(true)}
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-slate-accent text-white shadow-lg flex items-center justify-center active:scale-95 transition-transform z-40"
      >
        <Plus size={24} />
      </button>

      {/* Filter bottom sheet */}
      <BottomSheet open={filterOpen} onClose={() => setFilterOpen(false)} title="Filtrer les tâches">
        <div className="space-y-5">
          <div>
            <label className="text-xs font-semibold text-slate-text-muted uppercase tracking-wider">Statut</label>
            <div className="flex gap-2 mt-2 flex-wrap">
              <Chip label="Tous" active={!statusFilter} onClick={() => setStatusFilter('')} />
              {statusOptions.map(s => (
                <Chip key={s} label={s} active={statusFilter === s} onClick={() => setStatusFilter(statusFilter === s ? '' : s)} />
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-text-muted uppercase tracking-wider">Priorité</label>
            <div className="flex gap-2 mt-2 flex-wrap">
              <Chip label="Toutes" active={!prioFilter} onClick={() => setPrioFilter('')} />
              {priorityOptions.map(p => (
                <Chip key={p} label={p} active={prioFilter === p} onClick={() => setPrioFilter(prioFilter === p ? '' : p)} />
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-text-muted uppercase tracking-wider">Département</label>
            <div className="flex gap-2 mt-2 flex-wrap">
              <Chip label="Tous" active={!deptFilter} onClick={() => setDeptFilter('')} />
              {deptOptions.map(d => (
                <Chip key={d} label={d} active={deptFilter === d} onClick={() => setDeptFilter(deptFilter === d ? '' : d)} />
              ))}
            </div>
          </div>
          <button
            onClick={() => { setStatusFilter(''); setPrioFilter(''); setDeptFilter(''); setFilterOpen(false); }}
            className="w-full py-2.5 text-sm font-semibold text-slate-accent"
          >
            Réinitialiser les filtres
          </button>
        </div>
      </BottomSheet>

      {/* New task bottom sheet */}
      <BottomSheet open={newOpen} onClose={() => setNewOpen(false)} title="Nouvelle tâche">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-text-muted uppercase">Titre</label>
            <input
              type="text"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="Ex: Commander élastiques"
              className="w-full mt-1 px-3 py-2.5 rounded-lg border border-slate-border text-sm focus:outline-none focus:border-slate-accent"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-text-muted uppercase">Département</label>
              <select
                value={newDept}
                onChange={e => setNewDept(e.target.value as TaskDepartment)}
                className="w-full mt-1 px-3 py-2.5 rounded-lg border border-slate-border text-sm focus:outline-none focus:border-slate-accent bg-white"
              >
                {deptOptions.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-text-muted uppercase">Priorité</label>
              <select
                value={newPrio}
                onChange={e => setNewPrio(e.target.value as TaskPriority)}
                className="w-full mt-1 px-3 py-2.5 rounded-lg border border-slate-border text-sm focus:outline-none focus:border-slate-accent bg-white"
              >
                {priorityOptions.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-text-muted uppercase">Échéance</label>
            <input
              type="date"
              value={newDeadline}
              onChange={e => setNewDeadline(e.target.value)}
              className="w-full mt-1 px-3 py-2.5 rounded-lg border border-slate-border text-sm focus:outline-none focus:border-slate-accent"
            />
          </div>
          <button
            onClick={addTask}
            disabled={!newTitle.trim()}
            className="w-full py-3 rounded-xl bg-slate-accent text-white font-semibold text-sm disabled:opacity-40 active:scale-[0.98] transition-transform"
          >
            Ajouter
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'px-3 py-1.5 rounded-full text-xs font-medium transition-colors capitalize',
        active
          ? 'bg-slate-accent text-white'
          : 'bg-slate-bg text-slate-text-secondary border border-slate-border'
      )}
    >
      {label}
    </button>
  );
}
