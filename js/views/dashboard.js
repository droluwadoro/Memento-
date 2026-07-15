import { supabase } from '../supabase.js';
import { escapeHtml, formatDate } from '../utils.js';

export async function renderDashboard(container, param, user) {
  container.innerHTML = `<div class="app-container"><div class="loading">Loading…</div></div>`;

  const [{ data: profile }, { data: purchases }] = await Promise.all([
    supabase.from('profiles').select('name, email').eq('id', user.id).single(),
    supabase.from('purchases_with_status').select('*').order('return_by_date', { ascending: true }),
  ]);

  const displayName = profile?.name || profile?.email?.split('@')[0] || 'there';
  const items = purchases || [];
  const expiring = items.filter(p => p.status === 'expiring' && !p.is_returned);

  container.innerHTML = `
    <div class="app-container">
      <div class="app-header">
        <div class="greeting">Hey, ${escapeHtml(displayName)}</div>
        <button id="logout-btn" class="icon-btn" title="Log out">Log out</button>
      </div>

      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-num">${items.length}</div>
          <div class="stat-label">Tracked</div>
        </div>
        <div class="stat-card">
          <div class="stat-num" style="color:var(--red)">${expiring.length}</div>
          <div class="stat-label">Expiring soon</div>
        </div>
      </div>

      ${items.length === 0 ? renderEmptyState() : renderItems(items, expiring)}
    </div>
    <a href="#/add" class="fab">+</a>
  `;

  document.getElementById('logout-btn')?.addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.href = 'auth.html';
  });
}

function renderEmptyState() {
  return `
    <div class="empty-state">
      <div style="font-size:40px;">🧾</div>
      <p>No purchases yet. Add your first one and Memento starts tracking the deadline for you.</p>
      <a href="#/add" class="btn-primary" style="text-decoration:none;">Add your first purchase</a>
    </div>
  `;
}

function renderItems(items, expiring) {
  const expiringHtml = expiring.length ? `
    <div class="section-heading">Expiring soon</div>
    <div class="expiring-scroll">
      ${expiring.map(p => `
        <div class="expiring-card">
          <div class="days">${p.days_left}</div>
          <div class="days-label">days left</div>
          <div class="item-name">${escapeHtml(p.item_name)}</div>
        </div>
      `).join('')}
    </div>
  ` : '';

  const allItemsHtml = `
    <div class="section-heading">All items</div>
    <div class="item-list">
      ${items.map(p => {
        const badge = statusBadge(p);
        return `
          <a href="#/purchase/${p.id}" class="item-row">
            <div>
              <div class="item-name">${escapeHtml(p.item_name)}</div>
              <div class="item-meta">${escapeHtml(p.retailer_name || '')} · Return by ${formatDate(p.return_by_date)}</div>
            </div>
            <span class="badge ${badge.cls}">${badge.text}</span>
          </a>
        `;
      }).join('')}
    </div>
  `;

  return expiringHtml + allItemsHtml;
}

function statusBadge(p) {
  if (p.status === 'returned') return { cls: 'returned', text: 'Returned' };
  if (p.status === 'expired') return { cls: 'expired', text: 'Expired' };
  if (p.status === 'expiring') return { cls: 'expiring', text: `${p.days_left}d left` };
  return { cls: 'active', text: `${p.days_left}d left` };
}