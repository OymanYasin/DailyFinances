const elRhythm = document.getElementById('payment_rhythm_id');
const elFormat = document.getElementById('payment_format_id');
const tableBody = document.querySelector('#contractsTable tbody');

async function fillSelects() {
  const rhythms = await API.getPaymentRhythms();
  elRhythm.innerHTML = rhythms.map(r => `<option value="${r.id}">${r.name}</option>`).join('');

  const formats = await API.getPaymentFormats();
  elFormat.innerHTML = `<option value="">– Zahlungsart –</option>` +
    formats.map(f => `<option value="${f.id}">${f.name}</option>`).join('');
}

async function loadContracts() {
  const rows = await API.getContracts();
  tableBody.innerHTML = '';
  rows.forEach((c) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${c.provider}</td>
      <td>${c.category || '—'}</td>
      <td>${Number(c.amount).toFixed(2)} €</td>
      <td>${c.rhythm_name}</td>
      <td>${Number(c.monthly_cost).toFixed(2)} €</td>
      <td>${Number(c.yearly_cost).toFixed(2)} €</td>
      <td>${c.is_active ? '✔' : '✖'}</td>
      <td>
        <button class="link" data-action="del" data-id="${c.id}">Löschen</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

document.getElementById('contractForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    provider: document.getElementById('provider').value,
    description: document.getElementById('description').value,
    category: document.getElementById('category').value,
    amount: document.getElementById('amount').value,
    payment_rhythm_id: document.getElementById('payment_rhythm_id').value,
    payment_format_id: document.getElementById('payment_format_id').value || null,
    email: document.getElementById('email').value,
    contract_number: document.getElementById('contract_number').value,
    customer_number: document.getElementById('customer_number').value,
    start_date: document.getElementById('start_date').value,
    end_date: document.getElementById('end_date').value,
    billing_date: document.getElementById('billing_date').value,
    is_active: document.getElementById('is_active').checked ? 1 : 0,
  };
  await API.addContract(payload);
  e.target.reset();
  await loadContracts();
});

tableBody.addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  if (btn.dataset.action === 'del') {
    const id = Number(btn.dataset.id);
    await API.deleteContract(id);
    await loadContracts();
  }
});

(async () => {
  await fillSelects();
  await loadContracts();
})();
