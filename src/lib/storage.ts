import type { Task, Conversation, Appointment, AvailabilityBlock, Employee, UserSettings, HomeStats } from '@/types';

// ===== Generic helpers =====
function getItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

// ===== Date helpers =====
export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function formatDateFR(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('fr-CA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatShortDateFR(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('fr-CA', { day: 'numeric', month: 'short' });
}

export function addDays(iso: string, n: number): string {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export function dayOfWeekFR(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('fr-CA', { weekday: 'short' });
}

// ===== Keys =====
const KEYS = {
  tasks: 'gym45_tasks',
  conversations: 'gym45_messages',
  appointments: 'gym45_appointments',
  availability: 'gym45_availability',
  employee: 'gym45_employee',
  settings: 'gym45_settings',
} as const;

// ===== Seed data =====
const today = typeof window !== 'undefined' ? todayISO() : '2026-03-18';

const SEED_TASKS: Task[] = [
  {
    id: 't1', title: 'Renouveler abonnement Marie T.', description: 'Forfait 12 séances expire vendredi',
    assignee: 'Jacob', deadline: addDays(today, -1), priority: 'haute', status: 'à faire',
    department: 'Coaching', category: 'Renouvellement', createdAt: addDays(today, -5),
  },
  {
    id: 't2', title: 'Commander protéines whey', description: 'Stock bas — 3 pots restants',
    assignee: 'Jacob', deadline: addDays(today, -2), priority: 'haute', status: 'à faire',
    department: 'Comptoir', category: 'Inventaire', createdAt: addDays(today, -4),
  },
  {
    id: 't3', title: 'Préparer programme Julien C.', description: 'Nouveau bloc mésocycle semaine prochaine',
    assignee: 'Jacob', deadline: addDays(today, 2), priority: 'moyenne', status: 'en cours',
    department: 'Coaching', category: 'Programmation', createdAt: addDays(today, -3),
  },
  {
    id: 't4', title: 'Nettoyer zone stretching', description: 'Tapis à désinfecter + rangement',
    assignee: 'Jacob', deadline: addDays(today, 1), priority: 'basse', status: 'à faire',
    department: 'Opérations', category: 'Entretien', createdAt: addDays(today, -1),
  },
  {
    id: 't5', title: 'Appeler Sophie L. pour suivi', description: 'Pas de check-in depuis 2 semaines',
    assignee: 'Jacob', deadline: today, priority: 'moyenne', status: 'à faire',
    department: 'Coaching', category: 'Suivi client', createdAt: addDays(today, -2),
  },
  {
    id: 't6', title: 'Mettre à jour tableau des prix', description: 'Nouveaux forfaits à afficher',
    assignee: 'Jacob', deadline: addDays(today, 3), priority: 'basse', status: 'terminé',
    department: 'Comptoir', category: 'Admin', createdAt: addDays(today, -7),
  },
];

const SEED_CONVERSATIONS: Conversation[] = [
  {
    id: 'c1', type: 'direct', name: 'Alexandre', participants: ['Jacob', 'Alexandre'],
    unreadCount: 1,
    lastMessage: 'Peux-tu vérifier les horaires de demain?',
    lastTimestamp: today + 'T09:15:00',
    messages: [
      { id: 'm1', sender: 'Alexandre', text: 'Salut Jacob, tout va bien ce matin?', timestamp: today + 'T08:30:00', read: true },
      { id: 'm2', sender: 'Jacob', text: 'Oui parfait, 3 clients ce matin.', timestamp: today + 'T08:45:00', read: true },
      { id: 'm3', sender: 'Alexandre', text: 'Peux-tu vérifier les horaires de demain?', timestamp: today + 'T09:15:00', read: false },
    ],
  },
  {
    id: 'c2', type: 'group', name: 'Équipe Gym45', participants: ['Jacob', 'Alexandre', 'Émilie', 'Marc'],
    unreadCount: 0,
    lastMessage: 'Marc: Le livreur passe à 14h.',
    lastTimestamp: addDays(today, -1) + 'T16:20:00',
    messages: [
      { id: 'm4', sender: 'Émilie', text: 'On a besoin de serviettes neuves.', timestamp: addDays(today, -1) + 'T14:00:00', read: true },
      { id: 'm5', sender: 'Marc', text: 'Le livreur passe à 14h.', timestamp: addDays(today, -1) + 'T16:20:00', read: true },
    ],
  },
  {
    id: 'c3', type: 'task', name: 'Commander protéines whey', participants: ['Jacob', 'Alexandre'],
    taskId: 't2', taskTitle: 'Commander protéines whey',
    unreadCount: 0,
    lastMessage: 'Jacob: Je m\'en occupe demain matin.',
    lastTimestamp: addDays(today, -1) + 'T10:00:00',
    messages: [
      { id: 'm6', sender: 'Alexandre', text: 'Le stock est vraiment bas, prioritaire.', timestamp: addDays(today, -2) + 'T09:00:00', read: true },
      { id: 'm7', sender: 'Jacob', text: 'Je m\'en occupe demain matin.', timestamp: addDays(today, -1) + 'T10:00:00', read: true },
    ],
  },
];

const SEED_APPOINTMENTS: Appointment[] = [
  { id: 'a1', title: 'Séance Marie T.', clientName: 'Marie Tremblay', date: today, start: '09:00', end: '10:00', type: 'Entraînement' },
  { id: 'a2', title: 'Évaluation Julien C.', clientName: 'Julien Côté', date: today, start: '10:30', end: '11:30', type: 'Évaluation' },
  { id: 'a3', title: 'Séance Sophie L.', clientName: 'Sophie Lavoie', date: today, start: '14:00', end: '15:00', type: 'Entraînement' },
  { id: 'a4', title: 'Réunion équipe', date: addDays(today, 1), start: '08:00', end: '08:30', type: 'Réunion' },
  { id: 'a5', title: 'Séance Marie T.', clientName: 'Marie Tremblay', date: addDays(today, 1), start: '09:00', end: '10:00', type: 'Entraînement' },
  { id: 'a6', title: 'Nouveau client — consultation', date: addDays(today, 2), start: '11:00', end: '12:00', type: 'Consultation' },
];

const SEED_AVAILABILITY: AvailabilityBlock[] = [
  { id: 'av1', type: 'bloqué', start: '07:00', end: '08:00', label: 'Ouverture / Setup' },
  { id: 'av2', type: 'ouvert', start: '08:00', end: '12:00', label: 'Disponible clients' },
  { id: 'av3', type: 'interne', start: '12:00', end: '13:00', label: 'Dîner' },
  { id: 'av4', type: 'ouvert', start: '13:00', end: '17:00', label: 'Disponible clients' },
  { id: 'av5', type: 'bloqué', start: '17:00', end: '18:00', label: 'Fermeture' },
];

const SEED_EMPLOYEE: Employee = {
  id: 'emp1', name: 'Jacob', role: 'Coach / Gérant',
  email: 'jacob@gym45.ca', phone: '418-555-0145',
  department: 'Coaching',
};

const SEED_SETTINGS: UserSettings = {
  notifications: true,
  darkMode: false,
};

// ===== Public API =====

export function getTasks(): Task[] {
  return getItem(KEYS.tasks, SEED_TASKS);
}
export function saveTasks(tasks: Task[]): void {
  setItem(KEYS.tasks, tasks);
}

export function getConversations(): Conversation[] {
  return getItem(KEYS.conversations, SEED_CONVERSATIONS);
}
export function saveConversations(convos: Conversation[]): void {
  setItem(KEYS.conversations, convos);
}

export function getAppointments(): Appointment[] {
  return getItem(KEYS.appointments, SEED_APPOINTMENTS);
}
export function saveAppointments(appts: Appointment[]): void {
  setItem(KEYS.appointments, appts);
}

export function getAvailability(): AvailabilityBlock[] {
  return getItem(KEYS.availability, SEED_AVAILABILITY);
}

export function getEmployee(): Employee {
  return getItem(KEYS.employee, SEED_EMPLOYEE);
}

export function getSettings(): UserSettings {
  return getItem(KEYS.settings, SEED_SETTINGS);
}
export function saveSettings(s: UserSettings): void {
  setItem(KEYS.settings, s);
}

export function getHomeStats(): HomeStats {
  const tasks = getTasks();
  const convos = getConversations();
  const appts = getAppointments();
  const t = todayISO();

  const overdue = tasks.filter(tk => tk.status !== 'terminé' && tk.deadline < t).length;
  const todayAppts = appts.filter(a => a.date === t).length;
  const unread = convos.reduce((s, c) => s + c.unreadCount, 0);

  return {
    tasksOverdue: overdue,
    appointmentsToday: todayAppts,
    pendingCheckins: 1,
    unreadMessages: unread,
    activeAlerts: 1,
    renewals: 1,
  };
}

// ===== Init seed (call once on first load) =====
export function ensureSeedData(): void {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem(KEYS.tasks)) setItem(KEYS.tasks, SEED_TASKS);
  if (!localStorage.getItem(KEYS.conversations)) setItem(KEYS.conversations, SEED_CONVERSATIONS);
  if (!localStorage.getItem(KEYS.appointments)) setItem(KEYS.appointments, SEED_APPOINTMENTS);
  if (!localStorage.getItem(KEYS.availability)) setItem(KEYS.availability, SEED_AVAILABILITY);
  if (!localStorage.getItem(KEYS.employee)) setItem(KEYS.employee, SEED_EMPLOYEE);
  if (!localStorage.getItem(KEYS.settings)) setItem(KEYS.settings, SEED_SETTINGS);
}
