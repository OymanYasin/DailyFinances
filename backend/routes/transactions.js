const express = require('express');
const router = express.Router();
const db = require('../database');

// Liste abrufen (optional ?type=income|expense)
router.get('/', (req, res) => {
  const { type } = req.query;
  let sql = `SELECT * FROM transaction`;
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

// Anlegen
router.post('/', (req, res) => {
  const t = req.body;
  const sql = `
    INSERT INTO transaction (type, amount, date, category, description, is_contract, contract_id)
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

// Ändern
router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const t = req.body;
  const sql = `
    UPDATE transaction SET
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

// Löschen
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  db.run(`DELETE FROM transaction WHERE id=?`, [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

module.exports = router;
