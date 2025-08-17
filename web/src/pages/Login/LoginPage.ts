import { login } from '../../api/auth';

type Props = { onLoggedIn: () => void };

export function LoginPage({ onLoggedIn }: Props) {
  const root = document.createElement('div');
  root.innerHTML = `
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

  const form = root.querySelector<HTMLFormElement>('#loginForm')!;
  const errEl = root.querySelector<HTMLDivElement>('#loginError')!;

  form.onsubmit = async (e) => {
    e.preventDefault();
    errEl.textContent = '';
    errEl.classList.add('hidden');

    const username = (root.querySelector('#username') as HTMLInputElement).value.trim();
    const password = (root.querySelector('#password') as HTMLInputElement).value;

    if (!username || !password) {
      errEl.textContent = 'Username dan password wajib diisi.';
      errEl.classList.remove('hidden');
      return;
    }

    try {
      await login(username, password);     // set cookie di server
      onLoggedIn();                        // switch ke Users
    } catch (err) {
      console.error(err);
      errEl.textContent = 'Login gagal. Periksa username/password.';
      errEl.classList.remove('hidden');
    }
  };

  return root;
}
