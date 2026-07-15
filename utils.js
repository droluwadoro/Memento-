export function daysLeft(dateStr) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr + 'T00:00:00') - new Date()) / 86400000);
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}