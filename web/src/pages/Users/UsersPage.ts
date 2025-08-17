import { getUsers } from '../../api/users';
import { logout } from '../../api/auth';
import type { User } from '../../types/user';

type Props = { onLogout: () => void };

export function UsersPage({ onLogout }: Props) {
  const root = document.createElement('div');
  root.innerHTML = `
    <div class="container">
      <div class="panel">
        <div class="header">
          <h2>Users</h2>
          <span class="badge" id="count">0</span>
          <div class="actions">
            <button class="btn" id="logout">Logout</button>
            <button class="btn" id="refresh">Refresh</button>
          </div>
        </div>
        <div class="state" id="state">Loading…</div>
        <div class="list" id="list" hidden></div>
      </div>
    </div>
  `;

  root.querySelector<HTMLButtonElement>('#refresh')!.addEventListener('click', loadUsers);
  root.querySelector<HTMLButtonElement>('#logout')!.addEventListener('click', async () => {
    try {
      await logout();           // server hapus cookie
      onLogout();               // balik ke Login
    } catch (err) {
      console.error('Logout error:', err);
      alert('Gagal logout. Silakan coba lagi.');
    }
  });

  loadUsers();
  return root;

  async function loadUsers() {
    const state = root.querySelector('#state')!;
    const list = root.querySelector('#list')!;

    state.classList.remove('err');
    state.textContent = 'Loading…';
    list.setAttribute('hidden', '');

    try {
      const users = await getUsers();    // jika cookie invalid → backend kirim 401
      renderUserList(users);
    } catch (err: any) {
      if (err?.message === 'unauthorized') {
        onLogout();                      // sesi habis → tampilkan Login
        return;
      }
      console.error(err);
      state.textContent = 'Gagal memuat users';
      state.classList.add('err');
    }
  }

  function renderUserList(users: User[]) {
    const list = root.querySelector('#list')!;
    const count = root.querySelector('#count')!;
    const state = root.querySelector('#state')!;
    count.textContent = String(users.length);
    state.textContent = users.length ? '' : 'Belum ada user yang lain.';
    list.toggleAttribute('hidden', users.length === 0);
    list.innerHTML = users.map(u => `
      <div class="item" data-id="${u.id}">
        <div class="avatar">${(u.username ?? '?').trim().charAt(0).toUpperCase() || '?'}</div>
        <div class="meta">
          <div class="name">${u.username}</div>
          <div class="id">${u.id}</div>
        </div>
        <button class="btn start" data-id="${u.id}" data-name="${u.username}">Start chat</button>
      </div>
    `).join('');
  }
}
