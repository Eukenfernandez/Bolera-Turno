import { Day, Ticket, AdminEmail, User, TicketStatus, PRIMARY_ADMIN_EMAIL } from '../types';

// Mock Storage Helpers
const getStorage = <T>(key: string, defaultVal: T): T => {
  const stored = localStorage.getItem(`base44_${key}`);
  return stored ? JSON.parse(stored) : defaultVal;
};

const setStorage = (key: string, val: any) => {
  localStorage.setItem(`base44_${key}`, JSON.stringify(val));
};

const simulateDelay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// --- MOCK DB ---
let days: Day[] = getStorage('days', []);
let tickets: Ticket[] = getStorage('tickets', []);
let adminEmails: AdminEmail[] = getStorage('admin_emails', []);

// Ensure Admin Exists
let users: User[] = getStorage('users', []);
if (!users.find(u => u.email === PRIMARY_ADMIN_EMAIL)) {
  users.push({
    id: 'admin-default',
    email: PRIMARY_ADMIN_EMAIL,
    full_name: 'Administrador Principal',
    role: 'admin'
  });
  setStorage('users', users);
}

let currentUser: User | null = getStorage('current_user', null);

// --- SERVICES ---

export const UserService = {
  login: async (email: string, password: string): Promise<User> => {
    await simulateDelay(500);
    
    if (!email || !password) throw new Error("Correo y contraseña son requeridos");

    const normalizedEmail = email.toLowerCase().trim();

    // Enforce Admin Password
    if (normalizedEmail === PRIMARY_ADMIN_EMAIL.toLowerCase()) {
      if (password !== 'Admin1234') {
        throw new Error("Contraseña incorrecta para cuenta de administrador.");
      }
    }

    const user = users.find(u => u.email.toLowerCase() === normalizedEmail);
    
    if (!user) {
       throw new Error("Credenciales incorrectas o usuario no registrado.");
    }

    currentUser = user;
    setStorage('current_user', user);
    return user;
  },
  register: async (email: string, name: string, password: string): Promise<User> => {
    await simulateDelay(500);
    
    if (!email || !name || !password) throw new Error("Todos los campos son obligatorios");
    
    const normalizedEmail = email.toLowerCase().trim();

    if (normalizedEmail === PRIMARY_ADMIN_EMAIL.toLowerCase()) {
      throw new Error("No se puede registrar este correo manualmente.");
    }

    if (users.find(u => u.email.toLowerCase() === normalizedEmail)) {
      throw new Error("Este correo ya está registrado.");
    }
    
    const newUser: User = {
      id: crypto.randomUUID(),
      email: normalizedEmail,
      full_name: name,
      role: 'user'
    };
    
    users.push(newUser);
    setStorage('users', users);
    
    currentUser = newUser;
    setStorage('current_user', newUser);
    return newUser;
  },
  logout: async () => {
    await simulateDelay(300);
    currentUser = null;
    setStorage('current_user', null);
  },
  me: async (): Promise<User | null> => {
    await simulateDelay(200);
    // If mock session persists
    return currentUser;
  }
};

export const DayService = {
  list: async (sort?: string, limit?: number): Promise<Day[]> => {
    await simulateDelay();
    let result = [...days];
    if (sort === '-created_date') {
      result.sort((a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime());
    }
    return result;
  },
  create: async (data: Partial<Day>): Promise<Day> => {
    await simulateDelay();
    const newDay: Day = {
      id: crypto.randomUUID(),
      date: data.date || new Date().toISOString().split('T')[0],
      current_turn: data.current_turn || 0,
      last_assigned_turn: 0,
      timezone: data.timezone || "Europe/Madrid",
      created_date: new Date().toISOString()
    };
    days.push(newDay);
    setStorage('days', days);
    return newDay;
  },
  update: async (id: string, data: Partial<Day>): Promise<Day> => {
    await simulateDelay();
    const idx = days.findIndex(d => d.id === id);
    if (idx === -1) throw new Error("Day not found");
    days[idx] = { ...days[idx], ...data };
    setStorage('days', days);
    return days[idx];
  },
  getByDate: async (date: string): Promise<Day | undefined> => {
    await simulateDelay();
    return days.find(d => d.date === date);
  }
};

export const TicketService = {
  filter: async (criteria: any): Promise<Ticket[]> => {
    await simulateDelay();
    return tickets.filter(t => {
      let match = true;
      if (criteria.day_id && t.day_id !== criteria.day_id) match = false;
      if (criteria.user_email && t.user_email !== criteria.user_email) match = false;
      if (criteria.status && t.status !== criteria.status) match = false;
      if (criteria.turn_number && typeof criteria.turn_number === 'number') {
         if(t.turn_number !== criteria.turn_number) match = false;
      }
      if (criteria.turn_number && criteria.turn_number.$gt) {
         if (t.turn_number <= criteria.turn_number.$gt) match = false;
      }
      if (criteria.notified_minus_10 !== undefined && t.notified_minus_10 !== criteria.notified_minus_10) match = false;
      
      return match;
    }).sort((a, b) => a.turn_number - b.turn_number);
  },
  listAll: async (dayId: string): Promise<Ticket[]> => {
      await simulateDelay();
      return tickets
        .filter(t => t.day_id === dayId)
        .sort((a, b) => b.turn_number - a.turn_number);
  },
  create: async (data: Partial<Ticket>): Promise<Ticket> => {
    await simulateDelay(500);
    const newTicket: Ticket = {
      id: crypto.randomUUID(),
      day_id: data.day_id!,
      user_email: data.user_email!,
      user_name: data.user_name!,
      turn_number: data.turn_number!,
      status: data.status || "PENDING",
      notified_minus_10: false,
      recall_count: 0,
      created_date: new Date().toISOString()
    };
    tickets.push(newTicket);
    setStorage('tickets', tickets);
    return newTicket;
  },
  update: async (id: string, data: Partial<Ticket>): Promise<Ticket> => {
    await simulateDelay();
    const idx = tickets.findIndex(t => t.id === id);
    if (idx === -1) throw new Error("Ticket not found");
    tickets[idx] = { ...tickets[idx], ...data };
    setStorage('tickets', tickets);
    return tickets[idx];
  }
};

export const AdminEmailService = {
  list: async (): Promise<AdminEmail[]> => {
    await simulateDelay();
    return [...adminEmails];
  },
  create: async (data: { email: string }): Promise<AdminEmail> => {
    await simulateDelay();
    const newAdmin: AdminEmail = {
      id: crypto.randomUUID(),
      email: data.email
    };
    adminEmails.push(newAdmin);
    setStorage('admin_emails', adminEmails);
    return newAdmin;
  },
  delete: async (id: string): Promise<void> => {
    await simulateDelay();
    adminEmails = adminEmails.filter(a => a.id !== id);
    setStorage('admin_emails', adminEmails);
  }
};

export const SendEmail = async (params: { to: string, subject: string, body: string }) => {
  console.log(`[EMAIL SIMULATION] To: ${params.to} | Subject: ${params.subject}`);
};