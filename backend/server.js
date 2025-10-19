const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('frontend'));

const contractsRoute = require('./routes/contracts');
const paymentFormatsRoute = require('./routes/paymentFormats');
const paymentRhythmsRoute = require('./routes/paymentRhythms');
const transactionsRoute = require('./routes/transactions');

app.use('/api/contracts', contractsRoute);
app.use('/api/payment-formats', paymentFormatsRoute);
app.use('/api/payment-rhythms', paymentRhythmsRoute);
app.use('/api/transactions', transactionsRoute);

// Übersicht/Stats für Dashboard
const db = require('./database');
app.get('/api/summary', (req, res) => {
  const summary = {};
  db.get(`SELECT IFNULL(SUM(amount),0) AS totalIncome FROM transaction WHERE type='income'`, [], (e1, r1) => {
    if (e1) return res.status(500).json({ error: e1.message });
    summary.totalIncome = r1.totalIncome || 0;

    db.get(`SELECT IFNULL(SUM(amount),0) AS totalExpense FROM transaction WHERE type='expense'`, [], (e2, r2) => {
      if (e2) return res.status(500).json({ error: e2.message });
      summary.totalExpense = r2.totalExpense || 0;

      db.get(`SELECT IFNULL(SUM(yearly_cost),0) AS contractsYearly FROM v_contract_costs WHERE is_active=1`, [], (e3, r3) => {
        if (e3) return res.status(500).json({ error: e3.message });
        summary.contractsYearly = r3.contractsYearly || 0;
        summary.net = summary.totalIncome - summary.totalExpense;

        // Kategorien-Verteilung (Ausgaben)
        db.all(
          `SELECT category, IFNULL(SUM(amount),0) as sum
             FROM transaction
            WHERE type='expense'
            GROUP BY category
            ORDER BY sum DESC`,
          [],
          (e4, r4) => {
            if (e4) return res.status(500).json({ error: e4.message });
            summary.expenseByCategory = r4 || [];
            res.json(summary);
          }
        );
      });
    });
  });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Server läuft auf http://localhost:${PORT}`));
