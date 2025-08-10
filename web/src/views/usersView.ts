// src/views/usersView.ts
import type { User } from '../types';
import { getUsers } from '../api/users';
import { renderLoginView } from './loginView';

export function renderUsersView(container: HTMLElement) {
  container.innerHTML = `
    <div class="container">
      <div class="panel">
        <div class="header">
          <h2>Users</h2>
          <span class="badge" id="count">0</span>
          <div class="actions">
            <button class="btn" id="refresh">Refresh</button>
          </div>
        </div>
        <div class="state" id="state">Loading…</div>
        <div class="list" id="list" hidden></div>
      </div>
    </div>
  `;
  document.getElementById('refresh')!.addEventListener('click', loadUsers);
}

export async function loadUsers() {
  const state = document.getElementById('state')!;
  const list = document.getElementById('list')!;
  state.classList.remove('err');
  state.textContent = 'Loading…';
  list.setAttribute('hidden', '');

  try {
    const users = await getUsers();
    renderUserList(users);
  } catch (err: any) {
    if (err?.message === 'unauthorized') {
      const app = document.getElementById('app')!;
      renderLoginView(app);
      return;
    }
    console.error(err);
    state.textContent = 'Gagal memuat users';
    state.classList.add('err');
  }
}

function renderUserList(users: User[]) {
  const list = document.getElementById('list')!;
  const count = document.getElementById('count')!;
  const state = document.getElementById('state')!;

  count.textContent = String(users.length);
  state.textContent = users.length ? '' : 'Belum ada user lain.';
  list.toggleAttribute('hidden', users.length === 0);

  list.innerHTML = users.map(u => `
    <div class="item" data-id="${u.id}">
      <div class="avatar">${firstLetter(u.username)}</div>
      <div class="meta">
        <div class="name">${u.username}</div>
        <div class="id">${u.id}</div>
      </div>
      <button class="btn start" data-id="${u.id}" data-name="${u.username}">Start chat</button>
    </div>
  `).join('');
}

function firstLetter(name: string) {
  const c = (name || '?').trim().charAt(0).toUpperCase();
  return c || '?';
}
