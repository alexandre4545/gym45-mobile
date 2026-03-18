'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Send, Users, ListTodo, User } from 'lucide-react';
import clsx from 'clsx';
import { getConversations, saveConversations } from '@/lib/storage';
import type { Conversation, Message } from '@/types';

export default function MessagesPage() {
  const [convos, setConvos] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState('');

  useEffect(() => {
    setConvos(getConversations());
  }, []);

  const active = convos.find(c => c.id === activeId);

  function openConvo(id: string) {
    // Mark as read
    const updated = convos.map(c => {
      if (c.id !== id) return c;
      return {
        ...c,
        unreadCount: 0,
        messages: c.messages.map(m => ({ ...m, read: true })),
      };
    });
    setConvos(updated);
    saveConversations(updated);
    setActiveId(id);
  }

  function sendMessage() {
    if (!input.trim() || !activeId) return;
    const msg: Message = {
      id: 'm' + Date.now(),
      sender: 'Jacob',
      text: input.trim(),
      timestamp: new Date().toISOString(),
      read: true,
    };
    const updated = convos.map(c => {
      if (c.id !== activeId) return c;
      return {
        ...c,
        messages: [...c.messages, msg],
        lastMessage: 'Jacob: ' + msg.text,
        lastTimestamp: msg.timestamp,
      };
    });
    setConvos(updated);
    saveConversations(updated);
    setInput('');
  }

  // Chat view
  if (active) {
    return (
      <div className="flex flex-col h-screen max-w-lg mx-auto">
        {/* Chat header */}
        <div className="flex items-center gap-3 px-4 pt-12 pb-3 bg-slate-surface border-b border-slate-border sticky top-0 z-10">
          <button
            onClick={() => setActiveId(null)}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-bg -ml-2"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-slate-text truncate">{active.name}</p>
            <p className="text-xs text-slate-text-muted">
              {active.type === 'group' ? active.participants.length + ' participants' :
               active.type === 'task' ? 'Fil de tâche' : 'Message direct'}
            </p>
          </div>
        </div>

        {/* Task context banner */}
        {active.type === 'task' && active.taskTitle && (
          <div className="mx-4 mt-3 px-3 py-2 rounded-lg bg-slate-accent/10 border border-slate-accent/20">
            <div className="flex items-center gap-2">
              <ListTodo size={14} className="text-slate-accent shrink-0" />
              <span className="text-xs font-medium text-slate-accent truncate">Tâche: {active.taskTitle}</span>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {active.messages.map((msg) => {
            const isMe = msg.sender === 'Jacob';
            return (
              <div key={msg.id} className={clsx('flex', isMe ? 'justify-end' : 'justify-start')}>
                <div className={clsx('max-w-[80%]')}>
                  {/* Show sender name in group convos */}
                  {!isMe && active.type !== 'direct' && (
                    <p className="text-[10px] font-semibold text-slate-text-muted mb-0.5 ml-1">{msg.sender}</p>
                  )}
                  <div className={clsx(
                    'px-3.5 py-2.5 rounded-2xl text-sm',
                    isMe
                      ? 'bg-slate-accent text-white rounded-br-md'
                      : 'bg-slate-bg text-slate-text rounded-bl-md'
                  )}>
                    {msg.text}
                  </div>
                  <p className={clsx(
                    'text-[10px] text-slate-text-muted mt-0.5',
                    isMe ? 'text-right mr-1' : 'ml-1'
                  )}>
                    {new Date(msg.timestamp).toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input */}
        <div className="px-4 py-3 bg-slate-surface border-t border-slate-border pb-safe mb-16">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Écrire un message..."
              className="flex-1 px-4 py-2.5 rounded-full border border-slate-border text-sm focus:outline-none focus:border-slate-accent"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="w-10 h-10 rounded-full bg-slate-accent text-white flex items-center justify-center disabled:opacity-40 active:scale-95 transition-transform shrink-0"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Conversation list
  return (
    <div className="px-4 pt-12 pb-4">
      <h1 className="text-xl font-bold text-slate-text mb-6">Messages</h1>

      {convos.length === 0 && (
        <div className="text-center py-12 text-slate-text-muted">Aucune conversation</div>
      )}

      <div className="flex flex-col gap-1">
        {convos.map((convo) => {
          const typeIcon = convo.type === 'group' ? Users :
                          convo.type === 'task' ? ListTodo : User;
          const Icon = typeIcon;
          return (
            <button
              key={convo.id}
              onClick={() => openConvo(convo.id)}
              className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-bg active:bg-slate-bg transition-colors text-left w-full"
            >
              <div className={clsx(
                'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
                convo.unreadCount > 0 ? 'bg-slate-accent/10' : 'bg-slate-bg'
              )}>
                <Icon size={18} className={convo.unreadCount > 0 ? 'text-slate-accent' : 'text-slate-text-muted'} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={clsx(
                    'text-sm truncate',
                    convo.unreadCount > 0 ? 'font-bold text-slate-text' : 'font-medium text-slate-text'
                  )}>
                    {convo.name}
                  </p>
                  {convo.lastTimestamp && (
                    <span className="text-[10px] text-slate-text-muted shrink-0 ml-2">
                      {new Date(convo.lastTimestamp).toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
                {convo.lastMessage && (
                  <p className={clsx(
                    'text-xs truncate mt-0.5',
                    convo.unreadCount > 0 ? 'text-slate-text-secondary font-medium' : 'text-slate-text-muted'
                  )}>
                    {convo.lastMessage}
                  </p>
                )}
              </div>
              {convo.unreadCount > 0 && (
                <span className="w-5 h-5 bg-slate-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0">
                  {convo.unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
