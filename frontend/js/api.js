const API = {
  // SUMMARY
  getSummary: async () => (await fetch('/api/summary')).json(),

  // CONTRACTS
  getContracts: async () => (await fetch('/api/contracts')).json(),
  addContract: async (payload) =>
    (await fetch('/api/contracts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })).json(),
  updateContract: async (id, payload) =>
    (await fetch(`/api/contracts/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })).json(),
  deleteContract: async (id) =>
    (await fetch(`/api/contracts/${id}`, { method: 'DELETE' })).json(),

  // RHYTHMS & FORMATS
  getPaymentRhythms: async () => (await fetch('/api/payment-rhythms')).json(),
  getPaymentFormats: async () => (await fetch('/api/payment-formats')).json(),

  // TRANSACTIONS
  getTransactions: async (type=null) => {
    const url = type ? `/api/transactions?type=${encodeURIComponent(type)}` : '/api/transactions';
    return (await fetch(url)).json();
  },
  addTransaction: async (payload) =>
    (await fetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })).json(),
  updateTransaction: async (id, payload) =>
    (await fetch(`/api/transactions/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })).json(),
  deleteTransaction: async (id) =>
    (await fetch(`/api/transactions/${id}`, { method: 'DELETE' })).json(),
};
