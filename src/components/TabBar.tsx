'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ListTodo, MessageSquare, Calendar, User } from 'lucide-react';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { getConversations } from '@/lib/storage';

interface Tab {
  href: string;
  label: string;
  icon: typeof Home;
  badge?: number;
}

const tabs: Tab[] = [
  { href: '/', label: 'Accueil', icon: Home },
  { href: '/taches', label: 'Tâches', icon: ListTodo },
  { href: '/messages', label: 'Messages', icon: MessageSquare },
  { href: '/calendrier', label: 'Calendrier', icon: Calendar },
  { href: '/profil', label: 'Profil', icon: User },
];

export default function TabBar() {
  const pathname = usePathname();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const convos = getConversations();
    setUnread(convos.reduce((s, c) => s + c.unreadCount, 0));
  }, []);

  function isActive(href: string): boolean {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-surface border-t border-slate-border pb-safe">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          const Icon = tab.icon;
          const badge = tab.href === '/messages' ? unread : 0;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={clsx(
                'flex flex-col items-center justify-center min-w-[56px] min-h-[44px] rounded-lg transition-colors relative',
                active
                  ? 'text-slate-accent'
                  : 'text-slate-text-muted hover:text-slate-text-secondary'
              )}
            >
              <div className="relative">
                <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
                {badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-error text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                    {badge}
                  </span>
                )}
              </div>
              <span className={clsx('text-[10px] mt-0.5', active ? 'font-semibold' : 'font-medium')}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
