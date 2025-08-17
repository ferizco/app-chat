// src/pages/Signup/SignupPage.ts
import { getAlias } from '../../api/alias';
import { signup } from '../../api/auth';

type AliasItem = { 
  id_alias: string; 
  alias_name: string 
};

type Props = { 
  onSignup: () => void;
};

export function SignupPage({ onSignup }: Props) {
  const root = document.createElement('div');
  root.innerHTML = `
    <div class="container">
      <div class="panel">
        <div class="header"><h2>Buat Akun</h2></div>
        <form id="signupForm" class="form">
          <div>
            <div class="label">Name</div>
            <input id="name" class="input" autocomplete="name" />
          </div>
          <div>
            <div class="label">Username</div>
            <input id="username" class="input" autocomplete="username" />
          </div>
          <div>
            <div class="label">Email</div>
            <input id="email" class="input" autocomplete="email" />
          </div>
          <div>
            <div class="label">Password</div>
            <input id="password" class="input" type="password" autocomplete="new-password" />
          </div>
          <div>
            <div class="label">Konfirmasi Password</div>
            <input id="confirm" class="input" type="password" autocomplete="new-password" />
          </div>

          <!-- === Alias section === -->
          <div>
            <div class="label">Alias</div>
            <div class="row" id="aliasRow" style="gap:8px; flex-wrap:wrap">
              <button type="button" class="btn chip" id="aliasA">—</button>
              <button type="button" class="btn chip" id="aliasB">—</button>
              <button type="button" class="btn" id="aliasShuffle">Acak</button>
            </div>
            <input type="hidden" id="aliasId" />
            <div class="help">Pilih salah satu alias, atau klik “Acak” untuk mengganti pilihan.</div>
          </div>
          <!-- ===================== -->

          <div class="row">
            <button class="btn" type="submit">Daftar</button>
            <div id="signupError" class="err hidden"></div>
          </div>
        </form>

        <div class="row" style="margin-top:8px">
          <span class="muted">Sudah punya akun?</span>
          <button id="goLogin" class="linklike">Masuk</button>
        </div>
      </div>
    </div>
  `;

  const form = root.querySelector<HTMLFormElement>('#signupForm')!;
  const errEl = root.querySelector<HTMLDivElement>('#signupError')!;
  const aliasA = root.querySelector<HTMLButtonElement>('#aliasA')!;
  const aliasB = root.querySelector<HTMLButtonElement>('#aliasB')!;
  const aliasShuffle = root.querySelector<HTMLButtonElement>('#aliasShuffle')!;
  const aliasIdInput = root.querySelector<HTMLInputElement>('#aliasId')!;

  let allAliases: AliasItem[] = [];
  let current: [AliasItem | null, AliasItem | null] = [null, null];

  // handlers
  aliasA.onclick = () => selectAliasBtn(aliasA);
  aliasB.onclick = () => selectAliasBtn(aliasB);
  aliasShuffle.onclick = () => reshuffle();

  form.onsubmit = async (e) => {
    e.preventDefault();

    const name = (root.querySelector<HTMLInputElement>('#name')?.value || '').trim();
    const username = (root.querySelector<HTMLInputElement>('#username')?.value || '').trim();
    const email = (root.querySelector<HTMLInputElement>('#email')?.value || '').trim();
    const password = root.querySelector<HTMLInputElement>('#password')?.value || '';
    const confirm = root.querySelector<HTMLInputElement>('#confirm')?.value || '';
    const id_alias = aliasIdInput.value;

    // validasi sederhana
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

    // log semua value
    console.log({
      name,
      username,
      email,
      password,
      id_alias
    });

    try {
      await signup(name, username, email, password, id_alias);
    } catch (err) {
      console.error(err);
    }
  };

  loadAlias();
  return root;

  // === functions ===
  async function loadAlias() {
    try {
      const res = await getAlias();  
      allAliases = res || [];
      reshuffle();
    } catch (err) {
      console.error(err);
      showError('Gagal memuat daftar alias.');
    }
  }

  function reshuffle() {
    if (allAliases.length < 2) return;
    const [a, b] = pickTwoDistinct(allAliases);
    current = [a, b];
    
    setAliasBtn(aliasA, a);
    setAliasBtn(aliasB, b);

    aliasIdInput.value = '';
    aliasA.classList.remove('active');
    aliasB.classList.remove('active');
  }

  function setAliasBtn(btn: HTMLButtonElement, item: AliasItem) {
    btn.textContent = item.alias_name;
    btn.dataset.id = item.id_alias;
  }

  function selectAliasBtn(btn: HTMLButtonElement) {
    aliasA.classList.remove('active');
    aliasB.classList.remove('active');
    btn.classList.add('active');
    aliasIdInput.value = btn.dataset.id || '';
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
}
