const txTableBody = document.querySelector('#txTable tbody');

function getQueryParam(name) {
  const url = new URL(location.href);
  return url.searchParams.get(name);
}

async function loadTxList() {
  const preType = getQueryParam('type');
  const rows = await API.getTransactions(preType);
  txTableBody.innerHTML = '';
  rows.forEach(t => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${t.type === 'income' ? 'Einnahme' : 'Ausgabe'}</td>
      <td>${Number(t.amount).toFixed(2)} €</td>
      <td>${t.date}</td>
      <td>${t.category || '—'}</td>
      <td>${t.description || '—'}</td>
      <td>${t.is_contract ? (t.contract_id || 'ja') : '—'}</td>
      <td><button class="link" data-id="${t.id}">Löschen</button></td>
    `;
    txTableBody.appendChild(tr);
  });
}

document.getElementById('txForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    type: document.getElementById('txType').value,
    amount: document.getElementById('txAmount').value,
    date: document.getElementById('txDate').value,
    category: document.getElementById('txCategory').value,
    description: document.getElementById('txDescription').value,
    is_contract: document.getElementById('txIsContract').checked,
    contract_id: document.getElementById('txContractId').value || null,
  };
  await API.addTransaction(payload);
  e.target.reset();
  await loadTxList();
});

txTableBody.addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-id]');
  if (!btn) return;
  await API.deleteTransaction(Number(btn.dataset.id));
  await loadTxList();
});

// Type-Vorauswahl aus Query
(function initTypeFromQuery() {
  const preType = getQueryParam('type');
  if (preType === 'income' || preType === 'expense') {
    document.getElementById('txType').value = preType;
  }
})();
loadTxList();
