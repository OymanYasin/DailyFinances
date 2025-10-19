async function loadSummary() {
  const s = await API.getSummary();
  const fmt = (n) => (Number(n).toFixed(2) + ' €').replace('.', ',');

  document.getElementById('totalIncome').textContent = fmt(s.totalIncome || 0);
  document.getElementById('totalExpense').textContent = fmt(s.totalExpense || 0);
  document.getElementById('contractsYearly').textContent = fmt(s.contractsYearly || 0);
  document.getElementById('net').textContent = fmt((s.totalIncome || 0) - (s.totalExpense || 0));

  const ctx = document.getElementById('expenseByCategory');
  const labels = (s.expenseByCategory || []).map(r => r.category || 'Unkategorisiert');
  const data = (s.expenseByCategory || []).map(r => r.sum);

  new Chart(ctx, {
    type: 'pie',
    data: { labels, datasets: [{ data }] },
  });
}

loadSummary();
