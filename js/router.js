import { supabase } from './supabase.js';
import { renderDashboard } from './views/dashboard.js';

const routes = {
  dashboard: renderDashboard,
};

async function router() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    window.location.href = 'auth.html';
    return;
  }

  const app = document.getElementById('app');
  const [path, param] = location.hash.slice(2).split('/');
  const render = routes[path] || renderDashboard;
  await render(app, param, session.user);
}

window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', router);