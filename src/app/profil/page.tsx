'use client';

import { useEffect, useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Building,
  Bell,
  LogOut,
  ChevronRight,
  BarChart3,
  Clock,
  Target,
} from 'lucide-react';
import clsx from 'clsx';
import { getEmployee, getSettings, saveSettings, getTasks, todayISO } from '@/lib/storage';
import type { Employee, UserSettings } from '@/types';

export default function ProfilPage() {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [settings, setSettings] = useState<UserSettings>({ notifications: true, darkMode: false });
  const [taskStats, setTaskStats] = useState({ total: 0, done: 0, overdue: 0 });

  useEffect(() => {
    const emp = getEmployee();
    setEmployee(emp);
    setSettings(getSettings());

    const tasks = getTasks();
    const today = todayISO();
    const myTasks = tasks.filter(t => t.assignee === emp.name);
    setTaskStats({
      total: myTasks.length,
      done: myTasks.filter(t => t.status === 'terminé').length,
      overdue: myTasks.filter(t => t.status !== 'terminé' && t.deadline < today).length,
    });
  }, []);

  function toggleNotif() {
    const updated = { ...settings, notifications: !settings.notifications };
    setSettings(updated);
    saveSettings(updated);
  }

  if (!employee) {
    return <div className="p-4 pt-12 text-center text-slate-text-muted">Chargement...</div>;
  }

  return (
    <div className="px-4 pt-12 pb-4">
      {/* Profile header */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-20 h-20 rounded-full bg-slate-accent/10 flex items-center justify-center mb-3">
          <User size={36} className="text-slate-accent" />
        </div>
        <h1 className="text-xl font-bold text-slate-text">{employee.name}</h1>
        <p className="text-sm text-slate-text-secondary">{employee.role}</p>
        <span className="mt-1.5 text-xs font-medium text-slate-accent bg-slate-accent/10 px-2.5 py-0.5 rounded-full">
          {employee.department}
        </span>
      </div>

      {/* Contact info */}
      <div className="bg-slate-surface rounded-xl border border-slate-border divide-y divide-slate-border mb-6">
        <InfoRow icon={Mail} label="Courriel" value={employee.email} />
        <InfoRow icon={Phone} label="Téléphone" value={employee.phone} />
        <InfoRow icon={Building} label="Département" value={employee.department} />
      </div>

      {/* Stats */}
      <h2 className="text-xs font-semibold text-slate-text-muted uppercase tracking-wider mb-3">
        Mes statistiques
      </h2>
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard icon={Target} label="Tâches totales" value={taskStats.total} color="text-slate-accent" bg="bg-slate-accent/10" />
        <StatCard icon={BarChart3} label="Complétées" value={taskStats.done} color="text-success" bg="bg-success/10" />
        <StatCard icon={Clock} label="En retard" value={taskStats.overdue} color="text-error" bg="bg-error/10" />
      </div>

      {/* Settings */}
      <h2 className="text-xs font-semibold text-slate-text-muted uppercase tracking-wider mb-3">
        Paramètres
      </h2>
      <div className="bg-slate-surface rounded-xl border border-slate-border divide-y divide-slate-border mb-6">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Bell size={18} className="text-slate-text-muted" />
            <span className="text-sm text-slate-text">Notifications</span>
          </div>
          <button
            onClick={toggleNotif}
            className={clsx(
              'w-11 h-6 rounded-full transition-colors relative',
              settings.notifications ? 'bg-slate-accent' : 'bg-slate-border'
            )}
          >
            <div className={clsx(
              'w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-transform',
              settings.notifications ? 'translate-x-5.5' : 'translate-x-0.5'
            )} />
          </button>
        </div>
      </div>

      {/* Logout */}
      <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-error/20 text-error text-sm font-semibold hover:bg-error/5 transition-colors">
        <LogOut size={16} />
        Déconnexion
      </button>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-4">
      <Icon size={16} className="text-slate-text-muted shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-slate-text-muted uppercase">{label}</p>
        <p className="text-sm text-slate-text truncate">{value}</p>
      </div>
      <ChevronRight size={14} className="text-slate-text-muted shrink-0" />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, bg }: { icon: typeof Target; label: string; value: number; color: string; bg: string }) {
  return (
    <div className="bg-slate-surface rounded-xl border border-slate-border p-3 text-center">
      <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-1.5', bg)}>
        <Icon size={16} className={color} />
      </div>
      <p className={clsx('text-xl font-bold', color)}>{value}</p>
      <p className="text-[10px] text-slate-text-muted mt-0.5">{label}</p>
    </div>
  );
}
