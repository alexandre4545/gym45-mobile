'use client';

import { useEffect, useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, Rows3 } from 'lucide-react';
import clsx from 'clsx';
import {
  getAppointments,
  getAvailability,
  todayISO,
  formatDateFR,
  addDays,
  dayOfWeekFR,
  formatShortDateFR,
} from '@/lib/storage';
import type { Appointment, AvailabilityBlock } from '@/types';

const HOURS = Array.from({ length: 12 }, (_, i) => i + 7); // 7h-18h

const availColors: Record<string, { bg: string; text: string; border: string }> = {
  bloqué: { bg: 'bg-error/10', text: 'text-error', border: 'border-error/30' },
  interne: { bg: 'bg-info/10', text: 'text-info', border: 'border-info/30' },
  ouvert: { bg: 'bg-success/10', text: 'text-success', border: 'border-success/30' },
};

export default function CalendrierPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [availability, setAvailability] = useState<AvailabilityBlock[]>([]);
  const [currentDate, setCurrentDate] = useState(todayISO());
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');

  useEffect(() => {
    setAppointments(getAppointments());
    setAvailability(getAvailability());
  }, []);

  const dayAppts = useMemo(
    () => appointments.filter(a => a.date === currentDate),
    [appointments, currentDate]
  );

  // Week view: 7 days starting from currentDate's Monday
  const weekDates = useMemo(() => {
    const d = new Date(currentDate + 'T00:00:00');
    const day = d.getDay();
    const monday = addDays(currentDate, -(day === 0 ? 6 : day - 1));
    return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  }, [currentDate]);

  function prevDay() {
    setCurrentDate(addDays(currentDate, viewMode === 'week' ? -7 : -1));
  }
  function nextDay() {
    setCurrentDate(addDays(currentDate, viewMode === 'week' ? 7 : 1));
  }
  function goToday() {
    setCurrentDate(todayISO());
  }

  function hourToY(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return (h - 7) * 64 + (m / 60) * 64;
  }

  function blockHeight(start: string, end: string): number {
    return hourToY(end) - hourToY(start);
  }

  return (
    <div className="px-4 pt-12 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-slate-text">Calendrier</h1>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewMode(viewMode === 'day' ? 'week' : 'day')}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-bg"
            title={viewMode === 'day' ? 'Vue semaine' : 'Vue jour'}
          >
            {viewMode === 'day' ? <Rows3 size={18} /> : <CalendarDays size={18} />}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevDay} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-bg">
          <ChevronLeft size={20} />
        </button>
        <div className="text-center">
          {viewMode === 'day' ? (
            <p className="text-sm font-semibold text-slate-text capitalize">{formatDateFR(currentDate)}</p>
          ) : (
            <p className="text-sm font-semibold text-slate-text">
              {formatShortDateFR(weekDates[0])} — {formatShortDateFR(weekDates[6])}
            </p>
          )}
          {currentDate !== todayISO() && (
            <button onClick={goToday} className="text-xs text-slate-accent font-medium mt-0.5">
              Aujourd&apos;hui
            </button>
          )}
        </div>
        <button onClick={nextDay} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-bg">
          <ChevronRight size={20} />
        </button>
      </div>

      {viewMode === 'week' ? (
        /* Week view */
        <div className="flex flex-col gap-2">
          {weekDates.map(date => {
            const appts = appointments.filter(a => a.date === date);
            const isToday = date === todayISO();
            return (
              <button
                key={date}
                onClick={() => { setCurrentDate(date); setViewMode('day'); }}
                className={clsx(
                  'flex items-start gap-3 p-3 rounded-xl border transition-colors text-left',
                  isToday ? 'border-slate-accent bg-slate-accent/5' : 'border-slate-border bg-slate-surface'
                )}
              >
                <div className={clsx(
                  'w-11 h-11 rounded-lg flex flex-col items-center justify-center shrink-0',
                  isToday ? 'bg-slate-accent text-white' : 'bg-slate-bg text-slate-text'
                )}>
                  <span className="text-[10px] uppercase font-medium leading-none">{dayOfWeekFR(date)}</span>
                  <span className="text-base font-bold leading-none mt-0.5">{new Date(date + 'T00:00:00').getDate()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  {appts.length === 0 ? (
                    <p className="text-xs text-slate-text-muted mt-2">Aucun RDV</p>
                  ) : (
                    <div className="space-y-1">
                      {appts.map(a => (
                        <div key={a.id} className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-text-muted font-medium w-12 shrink-0">{a.start}</span>
                          <span className="text-xs text-slate-text truncate">{a.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-xs font-medium text-slate-text-muted shrink-0 mt-2">
                  {appts.length > 0 ? appts.length + ' RDV' : ''}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        /* Day view — timeline */
        <div>
          {/* Availability legend */}
          <div className="flex gap-3 mb-4 flex-wrap">
            {(['ouvert', 'interne', 'bloqué'] as const).map(type => {
              const c = availColors[type];
              return (
                <div key={type} className="flex items-center gap-1.5">
                  <div className={clsx('w-2.5 h-2.5 rounded-sm', c.bg, 'border', c.border)} />
                  <span className="text-[10px] text-slate-text-muted capitalize">{type}</span>
                </div>
              );
            })}
          </div>

          {/* Timeline */}
          <div className="relative bg-slate-surface rounded-xl border border-slate-border overflow-hidden">
            <div className="relative" style={{ height: HOURS.length * 64 }}>
              {/* Hour lines */}
              {HOURS.map(h => (
                <div
                  key={h}
                  className="absolute left-0 right-0 border-t border-slate-border/50 flex items-start"
                  style={{ top: (h - 7) * 64 }}
                >
                  <span className="text-[10px] text-slate-text-muted w-10 text-right pr-2 -mt-1.5 shrink-0">
                    {h}:00
                  </span>
                </div>
              ))}

              {/* Availability blocks */}
              {availability.map(block => {
                const top = hourToY(block.start);
                const height = blockHeight(block.start, block.end);
                const c = availColors[block.type];
                if (top < 0 || height <= 0) return null;
                return (
                  <div
                    key={block.id}
                    className={clsx('absolute left-10 right-2 rounded-md border', c.bg, c.border, 'opacity-40')}
                    style={{ top, height }}
                  />
                );
              })}

              {/* Appointments */}
              {dayAppts.map(appt => {
                const top = hourToY(appt.start);
                const height = Math.max(blockHeight(appt.start, appt.end), 28);
                return (
                  <div
                    key={appt.id}
                    className="absolute left-12 right-3 bg-slate-accent rounded-lg px-2.5 py-1.5 overflow-hidden"
                    style={{ top, height }}
                  >
                    <p className="text-xs font-semibold text-white truncate">{appt.title}</p>
                    <p className="text-[10px] text-white/80 truncate">{appt.start} — {appt.end}</p>
                    {appt.clientName && height > 44 && (
                      <p className="text-[10px] text-white/70 truncate">{appt.clientName}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
