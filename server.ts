import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "database.json");

// Middleware to parse JSON and urlencoded data with large limits for base64 image uploads
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// Database Helper Functions
interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone: string;
  role: "user" | "admin";
}

interface Payment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: string;
  currency: "AOA (IBAN)" | "USDT (TRC20)";
  timestamp: string;
  imageUrl: string; // base64 payload
  status: "Pendente" | "Aprovado" | "Rejeitado";
  notes: string;
  adminNotes: string;
  processedAt: string;
}

interface Raffle {
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

interface Withdrawal {
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

interface DatabaseSchema {
  users: User[];
  payments: Payment[];
  raffles: Raffle[];
  withdrawals?: Withdrawal[];
}

// Ensure database file exists with initial seeded records
function initDB() {
  if (!fs.existsSync(DB_FILE)) {
    const seedData: DatabaseSchema = {
      users: [
        {
          id: "u_admin",
          name: "Afonso Emanuel",
          email: "afonsoemanuel03@gmail.com",
          password: "Caminhodobem3",
          phone: "+244 923 000 000",
          role: "admin",
        },
        {
          id: "u_joao",
          name: "João Silva",
          email: "joao@email.com",
          password: "user123",
          phone: "+351 934 567 890",
          role: "user",
        },
      ],
      payments: [
        {
          id: "p_1",
          userId: "u_joao",
          userName: "João Silva",
          userEmail: "joao@email.com",
          amount: "1500000.00",
          currency: "AOA (IBAN)",
          timestamp: new Date(Date.now() - 3600 * 24 * 3 * 1000).toISOString(), // 3 days ago
          imageUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'><rect width='400' height='200' fill='%23e2e8f0'/><text x='50%23' y='50%23' font-family='sans-serif' font-size='18' fill='%23334155' text-anchor='middle'>Comprovativo de Transferência Bancária - Banco Millenium</text><text x='50%23' y='65%23' font-family='sans-serif' font-size='12' fill='%2364748b' text-anchor='middle'>IBAN Beneficiário: AO06 0040 ... 10149 | Valor: 1.500.000,00 AOA</text></svg>",
          status: "Aprovado",
          notes: "Mensalidade do serviço de consultoria",
          adminNotes: "Valor recebido e confirmado em conta no dia 12/06.",
          processedAt: new Date(Date.now() - 3600 * 24 * 2 * 1000).toISOString(),
        },
        {
          id: "p_2",
          userId: "u_joao",
          userName: "João Silva",
          userEmail: "joao@email.com",
          amount: "300.00",
          currency: "USDT (TRC20)",
          timestamp: new Date(Date.now() - 3600 * 3 * 1000).toISOString(), // 3 hours ago
          imageUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'><rect width='400' height='200' fill='%23ecfdf5'/><text x='50%23' y='50%23' font-family='sans-serif' font-size='18' fill='%23047857' text-anchor='middle'>USDT TRC20 Transaction Receipt</text><text x='50%23' y='65%23' font-family='sans-serif' font-size='12' fill='%23065f46' text-anchor='middle'>TxHash: ee20610...d3b079 | Valor: 300.00 USDT</text></svg>",
          status: "Pendente",
          notes: "Adesão ao plano VIP anual",
          adminNotes: "",
          processedAt: "",
        },
      ],
      raffles: [
        {
          id: "r_1",
          title: "Sorteio de Boas-Vindas Agelga",
          prize: "100 TH/s de Poder de Hash por 90 dias",
          description: "Sorteio promocional especial de ativação de conta. Todos os utilizadores que tiverem pelo menos 1 comprovativo aprovado participam automaticamente.",
          status: "completed",
          drawDate: new Date(Date.now() - 3600 * 24 * 5 * 1000).toISOString(),
          winnerUserId: "u_joao",
          winnerUserName: "João Silva",
          winnerUserPhone: "+351 934 567 890",
          winnerTicketNumber: "AG-8197-SLV",
          participantsCount: 42,
        },
        {
          id: "r_2",
          title: "Sorteio Mega ASIC Miner 2026",
          prize: "Máquina Antminer S19 XP (141 TH/s física)",
          description: "Cada 200.000 AOA liquidados e validados dão direito a 1 Bilhete Digital de Sorteio automático. Válido até final de Junho de 2026.",
          status: "active",
          drawDate: new Date(Date.now() + 3600 * 24 * 15 * 1000).toISOString(),
          participantsCount: 15,
        },
        {
          id: "r_3",
          title: "Super Bónus Reinvestimento Kwanza",
          prize: "500.000,00 AOA Reinvestidos em Hashrate Xeon Pro",
          description: "Fabuloso bónus creditado diretamente como volume de mineração no seu saldo. Sorteado quinzenalmente.",
          status: "active",
          drawDate: new Date(Date.now() + 3600 * 24 * 10 * 1000).toISOString(),
          participantsCount: 9,
        }
      ],
      withdrawals: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(seedData, null, 2), "utf8");
  }
}

function readDB(): DatabaseSchema {
  initDB();
  try {
    const data = fs.readFileSync(DB_FILE, "utf8");
    const db = JSON.parse(data) as DatabaseSchema;
    
    // Auto-migrate if DB exists but raffles property does not
    let updated = false;
    if (!db.raffles) {
      db.raffles = [
        {
          id: "r_1",
          title: "Sorteio de Boas-Vindas Agelga",
          prize: "100 TH/s de Poder de Hash por 90 dias",
          description: "Sorteio promocional especial de ativação de conta. Todos os utilizadores que tiverem pelo menos 1 comprovativo aprovado participam automaticamente.",
          status: "completed",
          drawDate: new Date(Date.now() - 3600 * 24 * 5 * 1000).toISOString(),
          winnerUserId: "u_joao",
          winnerUserName: "João Silva",
          winnerUserPhone: "+351 934 567 890",
          winnerTicketNumber: "AG-8197-SLV",
          participantsCount: 42,
        },
        {
          id: "r_2",
          title: "Sorteio Mega ASIC Miner 2026",
          prize: "Máquina Antminer S19 XP (141 TH/s física)",
          description: "Cada 200.000 AOA liquidados e validados dão direito a 1 Bilhete Digital de Sorteio automático. Válido até final de Junho de 2026.",
          status: "active",
          drawDate: new Date(Date.now() + 3600 * 24 * 15 * 1000).toISOString(),
          participantsCount: 15,
        },
        {
          id: "r_3",
          title: "Super Bónus Reinvestimento Kwanza",
          prize: "500.000,00 AOA Reinvestidos em Hashrate Xeon Pro",
          description: "Fabuloso bónus creditado diretamente como volume de mineração no seu saldo. Sorteado quinzenalmente.",
          status: "active",
          drawDate: new Date(Date.now() + 3600 * 24 * 10 * 1000).toISOString(),
          participantsCount: 9,
        }
      ];
      updated = true;
    }
    if (!db.withdrawals) {
      db.withdrawals = [];
      updated = true;
    }
    if (updated) {
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf8");
    }
    return db;
  } catch (err) {
    console.error("Error reading database file", err);
    return { users: [], payments: [], raffles: [], withdrawals: [] };
  }
}

function writeDB(data: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing database file", err);
  }
}

// Express Routes API
// 1. Register User
app.post("/api/auth/register", (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password || !phone) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios." });
  }

  const db = readDB();
  const emailLower = email.trim().toLowerCase();

  const userExists = db.users.find((u) => u.email.toLowerCase() === emailLower);
  if (userExists) {
    return res.status(400).json({ error: "Este e-mail já está cadastrado." });
  }

  const newUser: User = {
    id: "u_" + Math.random().toString(36).substring(2, 9),
    name: name.trim(),
    email: emailLower,
    password: password, // For dev/preview convenience
    phone: phone.trim(),
    role: "user",
  };

  db.users.push(newUser);
  writeDB(db);

  // Return user without password for safety
  const { password: _, ...userWithoutPassword } = newUser;
  return res.status(201).json({ user: userWithoutPassword });
});

// 2. Login User
app.post("/api/auth/login", (req, res) => {
  const { email, phone, password } = req.body;

  const identifier = (email || phone || "").trim();
  if (!identifier || !password) {
    return res.status(400).json({ error: "E-mail/Telefone e senha são obrigatórios." });
  }

  const db = readDB();
  const searchStr = identifier.toLowerCase();

  // Special Admin Fallback Injection
  if (searchStr === "afonsoemanuel03@gmail.com" && password === "Caminhodobem3") {
    let adminUser = db.users.find((u) => u.email.toLowerCase() === "afonsoemanuel03@gmail.com");
    if (!adminUser) {
      adminUser = {
        id: "u_admin_afonso",
        name: "Afonso Emanuel",
        email: "afonsoemanuel03@gmail.com",
        password: "Caminhodobem3",
        phone: "+244 923 000 000",
        role: "admin",
      };
      db.users.push(adminUser);
      writeDB(db);
    } else if (adminUser.role !== "admin" || adminUser.password !== "Caminhodobem3") {
      adminUser.role = "admin";
      adminUser.password = "Caminhodobem3";
      writeDB(db);
    }
  }

  // Search by email, phone, or formatted phone
  const user = db.users.find((u) => {
    const dbEmail = u.email.toLowerCase();
    const dbPhone = u.phone.toLowerCase().replace(/\s+/g, "").replace(/\+/g, "");
    const cleanSearchStr = searchStr.replace(/\s+/g, "").replace(/\+/g, "");

    return (
      dbEmail === searchStr ||
      dbPhone === cleanSearchStr ||
      dbPhone.endsWith(cleanSearchStr) ||
      cleanSearchStr.endsWith(dbPhone)
    ) && u.password === password;
  });

  if (!user) {
    return res.status(401).json({ error: "Credenciais inválidas." });
  }

  const { password: _, ...userWithoutPassword } = user;
  return res.json({
    user: userWithoutPassword,
    token: userWithoutPassword.id, // For simple preview session verification
  });
});

// Helper validation for user/admin authorization.
function getUserByToken(token: string | undefined): User | null {
  if (!token) return null;
  const db = readDB();
  const user = db.users.find((u) => u.id === token);
  if (!user) return null;
  return user;
}

// 3. Get User's payments
app.get("/api/user/payments", (req, res) => {
  const token = req.headers.authorization;
  const user = getUserByToken(token);

  if (!user) {
    return res.status(401).json({ error: "Não autorizado." });
  }

  const db = readDB();
  const userPayments = db.payments.filter((p) => p.userId === user.id);

  // Sort by date descending
  userPayments.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return res.json({ payments: userPayments });
});

// 3.5. Get User's withdrawals
app.get("/api/user/withdrawals", (req, res) => {
  const token = req.headers.authorization;
  const user = getUserByToken(token);

  if (!user) {
    return res.status(401).json({ error: "Não autorizado." });
  }

  const db = readDB();
  const userWithdrawals = (db.withdrawals || []).filter((w) => w.userId === user.id);

  // Sort by date descending
  userWithdrawals.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return res.json({ withdrawals: userWithdrawals });
});

// 3.6. Submit Withdrawal Request
app.post("/api/user/withdrawals/submit", (req, res) => {
  const token = req.headers.authorization;
  const user = getUserByToken(token);

  if (!user) {
    return res.status(401).json({ error: "Não autorizado." });
  }

  const { amount, currency, destination } = req.body;

  if (!amount || !currency || !destination) {
    return res.status(400).json({
      error: "Montante de saque, moeda de câmbio (IBAN/USDT) e endereço/dados de destino são obrigatórios.",
    });
  }

  const db = readDB();
  
  const amtVal = parseFloat(amount);
  if (isNaN(amtVal) || amtVal <= 0) {
    return res.status(400).json({ error: "O valor de saque deve ser um número inteiro ou decimal positivo." });
  }

  const newWithdrawal: Withdrawal = {
    id: "w_" + Math.random().toString(36).substring(2, 9),
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    amount: amtVal.toFixed(2),
    currency,
    destination: destination.trim(),
    timestamp: new Date().toISOString(),
    status: "Pendente",
    adminNotes: "",
    processedAt: "",
  };

  if (!db.withdrawals) {
    db.withdrawals = [];
  }
  db.withdrawals.push(newWithdrawal);
  writeDB(db);

  return res.status(201).json({ withdrawal: newWithdrawal });
});

// 4. Submit Payment receipt
app.post("/api/user/payments/submit", (req, res) => {
  const token = req.headers.authorization;
  const user = getUserByToken(token);

  if (!user) {
    return res.status(401).json({ error: "Não autorizado." });
  }

  const { amount, currency, notes, imageUrl } = req.body;

  if (!amount || !currency || !imageUrl) {
    return res.status(400).json({
      error: "Valor, modalidade (IBAN/USDT) e imagem do comprovativo são obrigatórios.",
    });
  }

  const db = readDB();
  const newPayment: Payment = {
    id: "p_" + Math.random().toString(36).substring(2, 9),
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    amount: parseFloat(amount).toFixed(2),
    currency,
    timestamp: new Date().toISOString(),
    imageUrl,
    status: "Pendente",
    notes: notes || "",
    adminNotes: "",
    processedAt: "",
  };

  db.payments.push(newPayment);
  writeDB(db);

  return res.status(201).json({ payment: newPayment });
});

// 5. Admin: Get all payments
app.get("/api/admin/payments", (req, res) => {
  const token = req.headers.authorization;
  const user = getUserByToken(token);

  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Acesso administrativo negado." });
  }

  const db = readDB();
  // Sort payments by timestamp descending
  const sortedPayments = [...db.payments].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return res.json({ payments: sortedPayments });
});

// 6. Admin: Get all registered users and stats
app.get("/api/admin/users", (req, res) => {
  const token = req.headers.authorization;
  const user = getUserByToken(token);

  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Acesso administrativo negado." });
  }

  const db = readDB();
  const usersClean = db.users.map(({ password: _, ...u }) => u);

  // Calculate some simple stats
  const totalPayments = db.payments.length;
  const pendingPayments = db.payments.filter((p) => p.status === "Pendente").length;
  const approvedVolume = db.payments
    .filter((p) => p.status === "Aprovado")
    .reduce((acc, p) => acc + parseFloat(p.amount), 0);

  return res.json({
    users: usersClean,
    stats: {
      totalUsers: db.users.length,
      totalPayments,
      pendingPayments,
      approvedVolume: approvedVolume.toFixed(2),
    },
  });
});

// 7. Admin: Update payment status
app.post("/api/admin/payments/:id/status", (req, res) => {
  const token = req.headers.authorization;
  const user = getUserByToken(token);

  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Acesso administrativo negado." });
  }

  const { id } = req.params;
  const { status, adminNotes } = req.body;

  if (!status || !["Aprovado", "Rejeitado", "Pendente"].includes(status)) {
    return res.status(400).json({ error: "Status inválido fornecido." });
  }

  const db = readDB();
  const paymentIndex = db.payments.findIndex((p) => p.id === id);

  if (paymentIndex === -1) {
    return res.status(404).json({ error: "Comprovativo não encontrado." });
  }

  db.payments[paymentIndex].status = status;
  db.payments[paymentIndex].adminNotes = adminNotes || "";
  db.payments[paymentIndex].processedAt = new Date().toISOString();

  writeDB(db);

  return res.json({ payment: db.payments[paymentIndex] });
});

// 7.5. Admin: Get all withdrawals
app.get("/api/admin/withdrawals", (req, res) => {
  const token = req.headers.authorization;
  const user = getUserByToken(token);

  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Acesso administrativo negado." });
  }

  const db = readDB();
  const sortedWithdrawals = [...(db.withdrawals || [])].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return res.json({ withdrawals: sortedWithdrawals });
});

// 7.6. Admin: Update withdrawal request status
app.post("/api/admin/withdrawals/:id/status", (req, res) => {
  const token = req.headers.authorization;
  const user = getUserByToken(token);

  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Acesso administrativo negado." });
  }

  const { id } = req.params;
  const { status, adminNotes } = req.body;

  if (!status || !["Aprovado", "Rejeitado", "Pendente"].includes(status)) {
    return res.status(400).json({ error: "Status de saque inválido fornecido." });
  }

  const db = readDB();
  if (!db.withdrawals) {
    db.withdrawals = [];
  }
  const withdrawIndex = db.withdrawals.findIndex((w) => w.id === id);

  if (withdrawIndex === -1) {
    return res.status(404).json({ error: "Solicitação de saque não encontrada." });
  }

  db.withdrawals[withdrawIndex].status = status;
  db.withdrawals[withdrawIndex].adminNotes = adminNotes || "";
  db.withdrawals[withdrawIndex].processedAt = new Date().toISOString();

  writeDB(db);

  return res.json({ withdrawal: db.withdrawals[withdrawIndex] });
});

// 9. Raffles: Get all raffles
app.get("/api/raffles", (req, res) => {
  const token = req.headers.authorization;
  const user = getUserByToken(token);

  if (!user) {
    return res.status(401).json({ error: "Não autorizado." });
  }

  const db = readDB();
  return res.json({ raffles: db.raffles || [] });
});

// 10. Admin: Create a new Raffle
app.post("/api/admin/raffles/create", (req, res) => {
  const token = req.headers.authorization;
  const user = getUserByToken(token);

  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Acesso administrativo negado." });
  }

  const { title, prize, description, drawDate } = req.body;

  if (!title || !prize || !description || !drawDate) {
    return res.status(400).json({ error: "Título, prémio, descrição e data de sorteio são obrigatórios." });
  }

  const db = readDB();
  const newRaffle: Raffle = {
    id: "r_" + Math.random().toString(36).substring(2, 9),
    title,
    prize,
    description,
    status: "active",
    drawDate,
    participantsCount: Math.floor(5 + Math.random() * 20), // Simulated standard interest
  };

  if (!db.raffles) db.raffles = [];
  db.raffles.push(newRaffle);
  writeDB(db);

  return res.status(201).json({ raffle: newRaffle, raffles: db.raffles });
});

// 11. Admin: Draw a winner for an active Raffle
app.post("/api/admin/raffles/:id/draw", (req, res) => {
  const token = req.headers.authorization;
  const user = getUserByToken(token);

  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Acesso administrativo negado." });
  }

  const { id } = req.params;
  const db = readDB();

  const raffleIndex = db.raffles.findIndex((r) => r.id === id);
  if (raffleIndex === -1) {
    return res.status(404).json({ error: "Sorteio não encontrado." });
  }

  const raffle = db.raffles[raffleIndex];
  if (raffle.status === "completed") {
    return res.status(400).json({ error: "Este sorteio já foi realizado." });
  }

  // Choose a real user as candidate (any registered customer)
  const candidates = db.users.filter((u) => u.role !== "admin");
  if (candidates.length === 0) {
    return res.status(400).json({ error: "Não existem utilizadores suficientes cadastrados para realizar o sorteio." });
  }

  // To be super realistic, search for users with approved payments to build candidates with ticket-weight
  const approvedPayments = db.payments.filter((p) => p.status === "Aprovado");
  let chosenUser = candidates[Math.floor(Math.random() * candidates.length)];
  
  if (approvedPayments.length > 0) {
    // Pick from a random approved payment's owner to reward active investors!
    const randomPayment = approvedPayments[Math.floor(Math.random() * approvedPayments.length)];
    const verifiedOwner = candidates.find((u) => u.id === randomPayment.userId);
    if (verifiedOwner) {
      chosenUser = verifiedOwner;
    }
  }

  // Generate lucky ticket code
  const ticketId = "AG-" + Math.floor(1000 + Math.random() * 8999) + "-" + chosenUser.name.substring(0, 3).toUpperCase();

  raffle.status = "completed";
  raffle.winnerUserId = chosenUser.id;
  raffle.winnerUserName = chosenUser.name;
  raffle.winnerUserPhone = chosenUser.phone;
  raffle.winnerTicketNumber = ticketId;
  raffle.participantsCount = Math.max(raffle.participantsCount, db.payments.filter((p) => p.status === "Aprovado").length + 7);

  writeDB(db);

  return res.json({ raffle, raffles: db.raffles });
});

// 8. Reset/Re-seed Database for Test Flow
app.post("/api/admin/reset", (req, res) => {
  const token = req.headers.authorization;
  const user = getUserByToken(token);

  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Acesso administrativo negado." });
  }

  if (fs.existsSync(DB_FILE)) {
    fs.unlinkSync(DB_FILE);
  }
  initDB();

  return res.json({ message: "Banco de dados reiniciado com sucesso!" });
});


// FRONTEND EMBEDDING (Vite Integration in Server)
async function startServer() {
  initDB();

  // If in development mode, link Vite Dev server middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve the compiled vite bundle output assets
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express custom server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
