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

  // Navigasi
  root.querySelector<HTMLButtonElement>("#goLogin")!.onclick = onGoLogin;

  // Elemen-elemen penting
  const form = root.querySelector<HTMLFormElement>("#signupForm")!;
  const errEl = root.querySelector<HTMLDivElement>("#signupError")!;
  const submitBtn = root.querySelector<HTMLButtonElement>("#submitBtn")!;

  const aliasA = root.querySelector<HTMLButtonElement>("#aliasA")!;
  const aliasB = root.querySelector<HTMLButtonElement>("#aliasB")!;
  const aliasShuffle = root.querySelector<HTMLButtonElement>("#aliasShuffle")!;
  const aliasIdInput = root.querySelector<HTMLInputElement>("#aliasId")!;
  const passwordInput = root.querySelector<HTMLInputElement>("#password")!;
  const toggleBtn = root.querySelector<HTMLButtonElement>("#togglePassword")!;
  const icon = toggleBtn.querySelector<HTMLElement>("i")!;

  const confirmPasswordInput = root.querySelector<HTMLInputElement>("#confirm")!;
  const confirmToggleBtn = root.querySelector<HTMLButtonElement>("#toggleConfirm")!;
  const confirmIcon = confirmToggleBtn.querySelector<HTMLElement>("i")!;


  setupPasswordToggle(passwordInput, toggleBtn, icon);
  setupPasswordToggle(confirmPasswordInput, confirmToggleBtn, confirmIcon);

  // Event handlers
  aliasA.onclick = () => selectAliasBtn(aliasA);
  aliasB.onclick = () => selectAliasBtn(aliasB);
  aliasShuffle.onclick = () => reshuffle();

  // Reset Error
  ["#name", "#username", "#email", "#password", "#confirm"].forEach((sel) => {
    root
      .querySelector<HTMLInputElement>(sel)!
      .addEventListener("input", clearError);
  });

  // Action handler
  form.onsubmit = async (e) => {
    e.preventDefault();
    clearError();

    if (!form.checkValidity()) {
      form.reportValidity?.();
      showError("Periksa kembali isian formulir.");
      return;
    }

    const name = (
      root.querySelector<HTMLInputElement>("#name")?.value || ""
    ).trim();
    const username = (
      root.querySelector<HTMLInputElement>("#username")?.value || ""
    ).trim();
    const email = (
      root.querySelector<HTMLInputElement>("#email")?.value || ""
    ).trim();
    const password =
      root.querySelector<HTMLInputElement>("#password")?.value || "";
    const confirm =
      root.querySelector<HTMLInputElement>("#confirm")?.value || "";
    const id_alias = aliasIdInput.value;

    if (!id_alias) {
      showError("Pilih salah satu alias.");
      return;
    }
    if (password !== confirm) {
      showError("Password tidak sama dengan konfirmasi.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError("Format email tidak valid.");
      return;
    }

    submitBtn.disabled = true;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Memproses...";

    try {
      await signup(name, username, email, password, id_alias);
      onSignup();
    } catch (err: any) {
      console.error(err);
      showError(err?.message || "Pendaftaran gagal. Coba lagi.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText || "Daftar";
    }
  };

  // State data
  let allAliases: Alias[] = [];

  // Load saat inisialisasi
  loadAlias();
  return root;

  // === functions ===
  async function loadAlias() {
    try {
      const res = await getAlias();
      if (!res || res.length === 0) {
        showError("Alias tidak tersedia. Coba lagi nanti.");
        aliasShuffle.disabled = true;
        // Kosongkan tombol alias
        setAliasBtn(aliasA, { id_alias: "", alias_name: "—" } as Alias);
        setAliasBtn(aliasB, { id_alias: "", alias_name: "—" } as Alias);
        aliasA.disabled = true;
        aliasB.disabled = true;
        return;
      }

      allAliases = res;
      if (allAliases.length === 1) {
        // Jika hanya satu alias tersedia
        setAliasBtn(aliasA, allAliases[0]);
        aliasB.disabled = true;
        aliasShuffle.disabled = true;
        // Auto-select agar user bisa lanjut
        selectAliasBtn(aliasA);
      } else {
        reshuffle();
      }
    } catch (err) {
      console.error(err);
      showError("Gagal memuat daftar alias.");
      // opsi: disable controls agar jelas
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

    // Reset pilihan
    aliasIdInput.value = "";
    [aliasA, aliasB].forEach((b) => {
      b.classList.remove("active");
      b.setAttribute("aria-checked", "false");
    });
  }

  function setAliasBtn(btn: HTMLButtonElement, item: Alias) {
    btn.textContent = item.alias_name;
    // dataset selalu string
    (btn as HTMLButtonElement).dataset.id = String(
      (item as any).id_alias ?? ""
    );
  }

  function selectAliasBtn(btn: HTMLButtonElement) {
    [aliasA, aliasB].forEach((b) => {
      b.classList.remove("active");
      b.setAttribute("aria-checked", "false");
    });
    btn.classList.add("active");
    btn.setAttribute("aria-checked", "true");
    aliasIdInput.value = btn.dataset.id || "";
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
    errEl.classList.remove("hidden");
  }

  function clearError() {
    errEl.textContent = "";
    errEl.classList.add("hidden");
  }

  function setupPasswordToggle(
    input: HTMLInputElement,
    btn: HTMLButtonElement,
    icon: HTMLElement
  ) {
    btn.onclick = () => {
      const hidden = input.type === "password";
      input.type = hidden ? "text" : "password";

      icon.classList.toggle("bi-eye-slash", !hidden);
      icon.classList.toggle("bi-eye", hidden);

      btn.setAttribute("aria-pressed", String(hidden));
      btn.title = hidden ? "Sembunyikan password" : "Tampilkan password";
    };
  }
}
