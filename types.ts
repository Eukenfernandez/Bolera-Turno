export interface Day {
  id: string;
  date: string; // YYYY-MM-DD
  current_turn: number;
  last_assigned_turn: number;
  timezone: string;
  created_date: string;
}

export type TicketStatus = "PENDING" | "CALLED" | "NO_SHOW" | "CANCELLED" | "SERVED";

export interface Ticket {
  id: string;
  day_id: string;
  user_email: string;
  user_name: string;
  turn_number: number;
  status: TicketStatus;
  notified_minus_10: boolean;
  recall_count: number;
  created_date: string;
}

export interface AdminEmail {
  id: string;
  email: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'user';
}

export const PRIMARY_ADMIN_EMAIL = "boleraprueba@gmail.com";