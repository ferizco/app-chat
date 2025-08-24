import { login } from '../../api/users';
import sideImg from "../../assets/images/firstLook.png";
import "./loginstyle.css";

type Props = { 
  onLoggedIn: () => void;
  onGoSignup: () => void;
};

export function LoginPage({ onLoggedIn, onGoSignup }: Props) {
  const root = document.createElement('div');
  root.innerHTML = `
    <div class="container login">
      <div class="container-flex">
        <div class="image-wrapper">
          <img src="${sideImg}" alt="Ilustrasi signup" />
        </div>
        <div class="card">
          <div class="card-header"><h2>Login</h2></div>
          <form id="loginForm" class="form">
            <div>
              <div class="form-label">Username</div>
              <input id="username" class="form-input" autocomplete="username" />
            </div>
            <div>
              <div class="form-label">Password</div>
              <div class="form-input-with-toggle">
                <input id="password" class="form-input" type="password" autocomplete="current-password" />
                <button class="btn btn-outline-secondary toggle-pass" type="button" id="togglePassword"
                    aria-controls="password" aria-pressed="false" title="Tampilkan password">
                  <i class="bi bi-eye-slash"></i>
                </button>
              </div>
            </div>
            <div class="row">
              <button class="btn" type="submit">Masuk</button>
              <div id="loginError" class="err hidden"></div>
            </div>
          </form>
          <div class="row" style="margin-top:8px">
            <span class="muted">Belum punya akun?</span>
            <button id="goSignup" class="linktext">Daftar</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // =========================
  // Navigasi
  // =========================
  root.querySelector<HTMLButtonElement>('#goSignup')!.onclick = onGoSignup;

  // =========================
  // Elemen-elemen penting
  // =========================
  const form         = root.querySelector<HTMLFormElement>('#loginForm')!;
  const errEl        = root.querySelector<HTMLDivElement>('#loginError')!;
  const usernameEl   = root.querySelector<HTMLInputElement>('#username')!;
  const passwordEl   = root.querySelector<HTMLInputElement>('#password')!;
  const toggleBtn    = root.querySelector<HTMLButtonElement>('#togglePassword')!;
  const toggleIcon   = toggleBtn.querySelector<HTMLElement>('i')!;

  // =========================
  // Event handler
  // =========================
  setupPasswordToggle(passwordEl, toggleBtn, toggleIcon);

  // =========================
  // Reset error
  // =========================
  usernameEl.addEventListener('input', clearError);
  passwordEl.addEventListener('input', clearError);

  // =========================
  // Action handler
  // =========================
  form.onsubmit = async (e) => {
    e.preventDefault();
    clearError();

    // validasi sederhana (pakai required juga di HTML)
    const username = usernameEl.value.trim();
    const password = passwordEl.value;

    if (!username || !password) {
      showError('Username dan password wajib diisi.');
      return;
    }

    try {
      await login(username, password);
      onLoggedIn();
    } catch (err) {
      console.error(err);
      showError('Login gagal. Periksa username/password.');
    }
  };

  // =========================
  // State (tidak ada)
  // =========================

  // =========================
  // Load (tidak ada)
  // =========================

  // =========================
  // Functions
  // =========================
  function setupPasswordToggle(
    input: HTMLInputElement,
    btn: HTMLButtonElement,
    icon: HTMLElement
  ) {
    btn.onclick = () => {
      const hidden = input.type === 'password';
      input.type = hidden ? 'text' : 'password';

      // icon: eye saat hidden, eye-slash saat visible
      icon.classList.toggle('bi-eye', hidden);
      icon.classList.toggle('bi-eye-slash', !hidden);

      // aria/tips
      btn.setAttribute('aria-pressed', String(!hidden));
      btn.title = hidden ? 'Sembunyikan password' : 'Tampilkan password';
      btn.setAttribute('aria-label', btn.title);
    };
  }

  function showError(msg: string) {
    errEl.textContent = msg;
    errEl.classList.remove('hidden');
  }

  function clearError() {
    errEl.textContent = '';
    errEl.classList.add('hidden');
  }

  return root;
}
