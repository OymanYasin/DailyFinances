const express = require('express');
const router = express.Router();
const db = require('../database');

// List transactions (?type=income|expense)
router.get('/', (req, res) => {
  const { type } = req.query;
  let sql = `SELECT * FROM finance_transaction`;
  const params = [];
  if (type === 'income' || type === 'expense') {
    sql += ` WHERE type=?`;
    params.push(type);
  }
  sql += ` ORDER BY date DESC, id DESC`;
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Create
router.post('/', (req, res) => {
  const t = req.body;
  const sql = `
    INSERT INTO finance_transaction (type, amount, date, category, description, is_contract, contract_id)
    VALUES (?,?,?,?,?,?,?)
  `;
  const params = [
    t.type, Number(t.amount), t.date,
    t.category || null, t.description || null,
    t.is_contract ? 1 : 0, t.contract_id || null
  ];
  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

// Update
router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const t = req.body;
  const sql = `
    UPDATE finance_transaction SET
      type=?, amount=?, date=?, category=?, description=?, is_contract=?, contract_id=?
    WHERE id=?
  `;
  const params = [
    t.type, Number(t.amount), t.date, t.category || null, t.description || null,
    t.is_contract ? 1 : 0, t.contract_id || null, id
  ];
  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ updated: this.changes });
  });
});

// Delete
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  db.run(`DELETE FROM finance_transaction WHERE id=?`, [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

module.exports = router;
