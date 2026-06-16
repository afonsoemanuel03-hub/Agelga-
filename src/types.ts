export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "user" | "admin";
}

export interface Payment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: string;
  currency: "AOA (IBAN)" | "USDT (TRC20)";
  timestamp: string;
  imageUrl: string; // base64
  status: "Pendente" | "Aprovado" | "Rejeitado";
  notes: string;
  adminNotes: string;
  processedAt: string;
}

export interface AdminStats {
  totalUsers: number;
  totalPayments: number;
  pendingPayments: number;
  approvedVolume: string;
}

export interface Raffle {
  id: string;
  title: string;
  prize: string;
  description: string;
  status: "active" | "completed";
  drawDate: string;
  winnerUserId?: string;
  winnerUserName?: string;
  winnerUserPhone?: string;
  winnerTicketNumber?: string;
  participantsCount: number;
}

export interface Withdrawal {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: string;
  currency: "AOA (IBAN)" | "USDT (TRC20)";
  destination: string;
  timestamp: string;
  status: "Pendente" | "Aprovado" | "Rejeitado";
  adminNotes: string;
  processedAt: string;
}

