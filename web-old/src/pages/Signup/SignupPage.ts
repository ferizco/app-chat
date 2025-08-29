import { getAlias, signup } from "../../api/users";
import type { Alias } from "../../types/alias";
import sideImg from "../../assets/images/firstLook.png";
import "./signupstyle.css";

// Props
// - onSignup: dipanggil saat pendaftaran sukses
// - onGoLogin: pindah ke halaman login

type Props = {
  onSignup: () => void;
  onGoLogin: () => void;
};

export function SignupPage({ onSignup, onGoLogin }: Props) {
  const root = document.createElement("div");
  root.innerHTML = `
    <div class="container signup">
      <div class="container-flex">
        <div class="image-wrapper">
          <img src="${sideImg}" alt="Ilustrasi signup" />
        </div>
        <div class="card">
          <div class="card-header"><h2>Buat Akun</h2></div>
          <form id="signupForm" class="form" novalidate>
            <div>
              <div class="form-label">Nama</div>
              <input id="name" name="name" class="form-input" autocomplete="name" required />
            </div>
            <div>
              <div class="form-label">Username</div>
              <input id="username" name="username" class="form-input" autocomplete="username" required
                    pattern="^[a-zA-Z0-9._-]{3,}$" title="Minimal 3 karakter. Hanya huruf, angka, titik, underscore, atau minus." />
            </div>
            <div>
              <div class="form-label">Email</div>
              <input id="email" name="email" class="form-input" type="email" autocomplete="email" required />
            </div>
            <div>
              <div class="form-label">Password</div>
              <div class="form-input-with-toggle">
                <input id="password" name="password" class="form-input" type="password"
                      autocomplete="new-password" required minlength="8" title="Minimal 8 karakter." />
                <button class="btn btn-outline-secondary toggle-pass" type="button" id="togglePassword"
                        aria-controls="password" aria-pressed="false" title="Tampilkan password">
                  <i class="bi bi-eye-slash"></i>
                </button>
              </div>
            </div>
            <div>
              <div class="form-label">Konfirmasi Password</div>
              <div class="form-input-with-toggle">
                <input id="confirm" name="confirm" class="form-input" type="password" autocomplete="new-password" required />
                <button class="btn btn-outline-secondary toggle-pass" type="button" id="toggleConfirm"
                        aria-controls="confirm" aria-pressed="false" title="Tampilkan password">
                  <i class="bi bi-eye-slash"></i>
                </button>
              </div>
            </div>
            <!-- === Alias section === -->
            <div>
              <div class="form-label">Alias</div>
              <div class="form-radiobtn" id="aliasRow" role="radiogroup" aria-label="Pilih alias">
                <button type="button" class="btn chip" id="aliasA" role="radio" aria-checked="false">—</button>
                <button type="button" class="btn chip" id="aliasB" role="radio" aria-checked="false">—</button>
                <button type="button" class="btn" id="aliasShuffle">Acak</button>
              </div>
              <input type="hidden" id="aliasId" name="id_alias" />
              <div class="form-help">Pilih salah satu alias, atau klik “Acak” untuk mengganti pilihan.</div>
            </div>
            <!-- ===================== -->

            <div class="row">
              <button class="btn" type="submit" id="submitBtn">Daftar</button>
              <div id="signupError" class="err hidden" role="alert" aria-live="assertive"></div>
            </div>
          </form>

          <div style="margin-top:20px">
            <span class="muted">Sudah punya akun?</span>
            <button id="goLogin" class="linktext">Masuk</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // =========================
  // navigasi
  // =========================
  root.querySelector<HTMLButtonElement>('#goLogin')!.onclick = onGoLogin;

  // =========================
  // elemen-elemen penting
  // =========================
  const form           = root.querySelector<HTMLFormElement>('#signupForm')!;
  const errEl          = root.querySelector<HTMLDivElement>('#signupError')!;
  const submitBtn      = root.querySelector<HTMLButtonElement>('#submitBtn')!;

  const nameEl         = root.querySelector<HTMLInputElement>('#name')!;
  const usernameEl     = root.querySelector<HTMLInputElement>('#username')!;
  const emailEl        = root.querySelector<HTMLInputElement>('#email')!;

  const passwordEl     = root.querySelector<HTMLInputElement>('#password')!;
  const passBtn        = root.querySelector<HTMLButtonElement>('#togglePassword')!;
  const passIcon       = passBtn.querySelector<HTMLElement>('i')!;

  const confirmEl      = root.querySelector<HTMLInputElement>('#confirm')!;
  const confirmBtn     = root.querySelector<HTMLButtonElement>('#toggleConfirm')!;
  const confirmIcon    = confirmBtn.querySelector<HTMLElement>('i')!;

  const aliasA         = root.querySelector<HTMLButtonElement>('#aliasA')!;
  const aliasB         = root.querySelector<HTMLButtonElement>('#aliasB')!;
  const aliasShuffle   = root.querySelector<HTMLButtonElement>('#aliasShuffle')!;
  const aliasIdInput   = root.querySelector<HTMLInputElement>('#aliasId')!;

  // =========================
  // eventhandler
  // =========================
  setupPasswordToggle(passwordEl, passBtn, passIcon);
  setupPasswordToggle(confirmEl, confirmBtn, confirmIcon);

  aliasA.onclick = () => selectAliasBtn(aliasA);
  aliasB.onclick = () => selectAliasBtn(aliasB);
  aliasShuffle.onclick = () => reshuffle();

  // =========================
  // reset error
  // =========================
  [nameEl, usernameEl, emailEl, passwordEl, confirmEl].forEach((el) => {
    el.addEventListener('input', clearError);
  });

  // =========================
  // action handler
  // =========================
  form.onsubmit = async (e) => {
    e.preventDefault();
    clearError();

    if (!form.checkValidity()) {
      form.reportValidity?.();
      showError('Periksa kembali isian formulir.');
      return;
    }

    const name = nameEl.value.trim();
    const username = usernameEl.value.trim();
    const email = emailEl.value.trim();
    const password = passwordEl.value;
    const confirm = confirmEl.value;
    const id_alias = aliasIdInput.value;

    if (!id_alias) {
      showError('Pilih salah satu alias.');
      return;
    }
    if (password !== confirm) {
      showError('Password tidak sama dengan konfirmasi.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError('Format email tidak valid.');
      return;
    }

    submitBtn.disabled = true;
    const originalText = submitBtn.textContent ?? 'Daftar';
    submitBtn.textContent = 'Memproses...';

    try {
      await signup(name, username, email, password, id_alias);
      onSignup();
    } catch (err) {
      console.error(err);
      showError((err as Error)?.message || 'Pendaftaran gagal. Coba lagi.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  };

  // =========================
  // state
  // =========================
  let allAliases: Alias[] = [];

  // =========================
  // load
  // =========================
  loadAlias();

  // =========================
  // fuction
  // =========================
  function setupPasswordToggle(input: HTMLInputElement, btn: HTMLButtonElement, icon: HTMLElement) {
    // sinkronkan icon awal dgn state input
    syncToggleVisual(input, btn, icon);

    btn.onclick = () => {
      const hidden = input.type === 'password';
      input.type = hidden ? 'text' : 'password';
      syncToggleVisual(input, btn, icon);
    };
  }

  function syncToggleVisual(input: HTMLInputElement, btn: HTMLButtonElement, icon: HTMLElement) {
    const visible = input.type === 'text';
    // eye saat hidden, eye-slash saat visible
    icon.classList.toggle('bi-eye', !visible);
    icon.classList.toggle('bi-eye-slash', visible);
    btn.setAttribute('aria-pressed', String(visible));
    btn.title = visible ? 'Sembunyikan password' : 'Tampilkan password';
    btn.setAttribute('aria-label', btn.title);
  }

  async function loadAlias() {
    try {
      const res = await getAlias();
      if (!res || res.length === 0) {
        showError('Alias tidak tersedia. Coba lagi nanti.');
        aliasShuffle.disabled = true;
        setAliasBtn(aliasA, { id_alias: '', alias_name: '—' } as Alias);
        setAliasBtn(aliasB, { id_alias: '', alias_name: '—' } as Alias);
        aliasA.disabled = true;
        aliasB.disabled = true;
        return;
      }

      allAliases = res;
      if (allAliases.length === 1) {
        setAliasBtn(aliasA, allAliases[0]);
        aliasB.disabled = true;
        aliasShuffle.disabled = true;
        selectAliasBtn(aliasA);
      } else {
        reshuffle();
      }
    } catch (err) {
      console.error(err);
      showError('Gagal memuat daftar alias.');
      aliasShuffle.disabled = true;
      aliasA.disabled = true;
      aliasB.disabled = true;
    }
  }

  function reshuffle() {
    if (allAliases.length < 2) return;
    const [a, b] = pickTwoDistinct(allAliases);
    setAliasBtn(aliasA, a);
    setAliasBtn(aliasB, b);

    aliasIdInput.value = '';
    [aliasA, aliasB].forEach((b) => {
      b.classList.remove('active');
      b.setAttribute('aria-checked', 'false');
    });
  }

  function setAliasBtn(btn: HTMLButtonElement, item: Alias) {
    btn.textContent = item.alias_name;
    btn.dataset.id = String((item as any).id_alias ?? '');
  }

  function selectAliasBtn(btn: HTMLButtonElement) {
    [aliasA, aliasB].forEach((b) => {
      b.classList.remove('active');
      b.setAttribute('aria-checked', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-checked', 'true');
    aliasIdInput.value = btn.dataset.id || '';
    clearError();
  }

  function pickTwoDistinct<T>(arr: T[]): [T, T] {
    const i = Math.floor(Math.random() * arr.length);
    let j = Math.floor(Math.random() * arr.length);
    if (arr.length > 1) {
      while (j === i) j = Math.floor(Math.random() * arr.length);
    }
    return [arr[i], arr[j]];
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
