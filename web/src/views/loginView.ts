import { login } from '../api/auth';
import { renderUsersView, loadUsers } from './usersView'; // ← langsung import

export function renderLoginView(container: HTMLElement) {
  container.innerHTML = `
    <div class="container">
      <div class="panel">
        <div class="header"><h2>Login</h2></div>
        <form id="loginForm" class="form">
          <div>
            <div class="label">Username</div>
            <input id="username" class="input" autocomplete="username" />
          </div>
          <div>
            <div class="label">Password</div>
            <input id="password" class="input" type="password" autocomplete="current-password" />
          </div>
          <div class="row">
            <button class="btn" type="submit">Masuk</button>
            <div id="loginError" class="err hidden"></div>
          </div>
        </form>
      </div>
    </div>
  `;

  const form = container.querySelector('#loginForm') as HTMLFormElement;
  const errEl = container.querySelector('#loginError') as HTMLDivElement;

  form.onsubmit = async (e) => {
    e.preventDefault();
    errEl.textContent = '';
    errEl.classList.add('hidden');

    const username = (container.querySelector('#username') as HTMLInputElement).value.trim();
    const password = (container.querySelector('#password') as HTMLInputElement).value;

    if (!username || !password) {
      errEl.textContent = 'Username dan password wajib diisi.';
      errEl.classList.remove('hidden');
      return;
    }
    try {
      await login(username, password);
      renderUsersView(container);
      await loadUsers(); // ← panggil langsung
    } catch (err) {
      errEl.textContent = 'Login gagal. Periksa username/password.';
      errEl.classList.remove('hidden');
      console.error(err);
    }
  };
}
