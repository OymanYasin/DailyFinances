const express = require('express');
const router = express.Router();
const db = require('../database');

// Alle Verträge (mit berechneten Kosten) – inkl. Rhythmus/Format
router.get('/', (req, res) => {
  const sql = `
    SELECT vc.*, pf.name AS payment_format_name
      FROM v_contract_costs vc
      LEFT JOIN payment_format pf ON pf.id = vc.payment_format_id
     ORDER BY vc.provider ASC
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Vertrag anlegen
router.post('/', (req, res) => {
  const c = req.body;
  const sql = `
    INSERT INTO contract
      (provider, description, category, amount, payment_format_id, payment_rhythm_id,
       email, contract_number, customer_number, start_date, end_date, billing_date, is_active)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
  `;
  const params = [
    c.provider, c.description || null, c.category || null,
    Number(c.amount),
    c.payment_format_id || null,
    Number(c.payment_rhythm_id),
    c.email || null, c.contract_number || null, c.customer_number || null,
    c.start_date || null, c.end_date || null, c.billing_date || null,
    c.is_active === 0 ? 0 : 1
  ];
  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

// Vertrag ändern
router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const c = req.body;
  const sql = `
    UPDATE contract SET
      provider=?, description=?, category=?, amount=?, payment_format_id=?, payment_rhythm_id=?,
      email=?, contract_number=?, customer_number=?, start_date=?, end_date=?, billing_date=?, is_active=?
    WHERE id=?
  `;
  const params = [
    c.provider, c.description || null, c.category || null,
    Number(c.amount),
    c.payment_format_id || null,
    Number(c.payment_rhythm_id),
    c.email || null, c.contract_number || null, c.customer_number || null,
    c.start_date || null, c.end_date || null, c.billing_date || null,
    c.is_active === 0 ? 0 : 1,
    id
  ];
  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ updated: this.changes });
  });
});

// Vertrag löschen
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  db.run(`DELETE FROM contract WHERE id=?`, [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

module.exports = router;
