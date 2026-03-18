'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  CalendarDays,
  ClipboardCheck,
  MessageSquare,
  RefreshCw,
  ListTodo,
} from 'lucide-react';
import clsx from 'clsx';
import { getHomeStats, formatDateFR, todayISO, getEmployee } from '@/lib/storage';
import type { HomeStats } from '@/types';

interface AlertCard {
  label: string;
  count: number;
  href: string;
  color: 'red' | 'accent' | 'orange' | 'blue';
  icon: typeof AlertTriangle;
}

const colorMap = {
  red: { bg: 'bg-error/10', text: 'text-error', border: 'border-error/20' },
  accent: { bg: 'bg-slate-accent/10', text: 'text-slate-accent', border: 'border-slate-accent/20' },
  orange: { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/20' },
  blue: { bg: 'bg-info/10', text: 'text-info', border: 'border-info/20' },
};

export default function AccueilPage() {
  const [stats, setStats] = useState<HomeStats | null>(null);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    setStats(getHomeStats());
    setName(getEmployee().name);
    setDate(formatDateFR(todayISO()));
  }, []);

  if (!stats) {
    return <div className="p-4 pt-12 text-center text-slate-text-muted">Chargement...</div>;
  }

  const cards: AlertCard[] = [
    { label: 'tâche(s) en retard', count: stats.tasksOverdue, href: '/taches', color: 'red', icon: ListTodo },
    { label: 'RDV aujourd\'hui', count: stats.appointmentsToday, href: '/calendrier', color: 'accent', icon: CalendarDays },
    { label: 'check-in en attente', count: stats.pendingCheckins, href: '/taches', color: 'orange', icon: ClipboardCheck },
    { label: 'message(s) non lu(s)', count: stats.unreadMessages, href: '/messages', color: 'blue', icon: MessageSquare },
    { label: 'alerte(s) active(s)', count: stats.activeAlerts, href: '/taches', color: 'red', icon: AlertTriangle },
    { label: 'renouvellement(s)', count: stats.renewals, href: '/taches', color: 'orange', icon: RefreshCw },
  ];

  return (
    <div className="px-4 pt-12 pb-4">
      {/* Greeting */}
      <h1 className="text-2xl font-bold text-slate-text">
        Bonjour {name} <span role="img" aria-label="wave">&#128075;</span>
      </h1>
      <p className="text-sm text-slate-text-secondary mt-1 capitalize">{date}</p>

      {/* Résumé du jour */}
      <h2 className="text-sm font-semibold text-slate-text-muted uppercase tracking-wider mt-8 mb-3">
        Résumé du jour
      </h2>

      <div className="flex flex-col gap-3">
        {cards.map((card) => {
          if (card.count === 0) return null;
          const c = colorMap[card.color];
          return (
            <Link
              key={card.label}
              href={card.href}
              className={clsx(
                'flex items-center gap-4 p-4 rounded-xl border transition-transform active:scale-[0.98]',
                c.bg, c.border, 'bg-slate-surface'
              )}
            >
              <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center', c.bg)}>
                <card.icon size={20} className={c.text} />
              </div>
              <div className="flex-1">
                <span className={clsx('text-lg font-bold', c.text)}>{card.count}</span>
                <span className="text-sm text-slate-text-secondary ml-1.5">{card.label}</span>
              </div>
              <svg className="w-4 h-4 text-slate-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
