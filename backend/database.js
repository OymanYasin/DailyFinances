const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./finance.db', (err) => {
  if (err) console.error('DB-Fehler:', err.message);
  else console.log('💾 SQLite verbunden.');
});

db.serialize(() => {
  // Zahlungsart (z.B. Bankeinzug, PayPal, Kreditkarte)
  db.run(`CREATE TABLE IF NOT EXISTS payment_format (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  )`);

  // Zahlungsrhythmus (Monat, Jahr, Woche, etc.) + Multiplikator pro Jahr
  db.run(`CREATE TABLE IF NOT EXISTS payment_rhythm (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    per_year INTEGER NOT NULL
  )`);

  // Verträge – Betrag + Rhythmus reichen, Kosten werden dynamisch berechnet
  db.run(`CREATE TABLE IF NOT EXISTS contract (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    provider TEXT NOT NULL,
    description TEXT,
    category TEXT,
    amount REAL NOT NULL,               -- Grundbetrag entsprechend payment_rhythm
    payment_format_id INTEGER,
    payment_rhythm_id INTEGER NOT NULL,
    email TEXT,
    contract_number TEXT,
    customer_number TEXT,
    start_date TEXT,
    end_date TEXT,
    billing_date TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY(payment_format_id) REFERENCES payment_format(id),
    FOREIGN KEY(payment_rhythm_id) REFERENCES payment_rhythm(id)
  )`);

  // Transaktionen (Einnahmen/Ausgaben) für Plus/Minus
  db.run(`CREATE TABLE IF NOT EXISTS finance_transaction (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK(type IN ('income','expense')),
  amount REAL NOT NULL,
  date TEXT NOT NULL,
  category TEXT,
  description TEXT,
  is_contract INTEGER NOT NULL DEFAULT 0,
  contract_id INTEGER,
  FOREIGN KEY(contract_id) REFERENCES contract(id)
)`);

  // View: Vertragskosten als Monats- und Jahreswert
  db.run(`CREATE VIEW IF NOT EXISTS v_contract_costs AS
    SELECT
      c.id,
      c.provider,
      c.description,
      c.category,
      c.amount,
      pr.name AS rhythm_name,
      pr.per_year,
      (c.amount * CAST(pr.per_year AS REAL) / 12.0) AS monthly_cost,
      (c.amount * CAST(pr.per_year AS REAL)) AS yearly_cost,
      c.is_active,
      c.payment_format_id,
      c.payment_rhythm_id
    FROM contract c
    JOIN payment_rhythm pr ON pr.id = c.payment_rhythm_id
  `);

  // Seed-Daten für Rhythmen (idempotent)
  const rhythms = [
    ['monatlich', 12],
    ['jährlich', 1],
    ['wöchentlich', 52],
    ['täglich', 365],
    ['quartalsweise', 4]
  ];
  rhythms.forEach(([name, perYear]) => {
    db.run(`INSERT OR IGNORE INTO payment_rhythm(name, per_year) VALUES(?,?)`, [name, perYear]);
  });

  // Seed für Zahlungsformate
  ['Bankeinzug', 'Kreditkarte', 'PayPal', 'Überweisung'].forEach((pf) => {
    db.run(`INSERT OR IGNORE INTO payment_format(name) VALUES(?)`, [pf]);
  });
});

module.exports = db;
