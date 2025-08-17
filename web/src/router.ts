import { LoginPage } from './pages/Login/LoginPage';
import { UsersPage } from './pages/Users/UsersPage';

type View = 'login' | 'users';

export function init(app: HTMLElement) {
  function render(view: View) {
    const el =
      view === 'users'
        ? UsersPage({ onLogout: () => render('login') })
        : LoginPage({ onLoggedIn: () => render('users') });
    app.replaceChildren(el);
  }

  // Cek cookie
  const token = getCookie('auth_token');
  render(token ? 'users' : 'login');
}

function getCookie(name: string): string | null {
  const m = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return m ? decodeURIComponent(m[2]) : null;
}
