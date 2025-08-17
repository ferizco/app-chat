import { LoginPage } from './pages/Login/LoginPage';
import { UsersPage } from './pages/Users/UsersPage';
import { SignupPage } from './pages/Signup/SignupPage';

type View = 'login' | 'signup' | 'users';

export function init(app: HTMLElement) {
  const render = (view: View) => {
    const el =
      view === 'users'
        ? UsersPage({ onLogout: () => render('login') })
        : view === 'signup'
        ? SignupPage()
        : LoginPage({
            onLoggedIn: () => render('users'),    // sementara: nanti disambung API
            onGoSignup: () => render('signup'),
          });

    app.replaceChildren(el);
  };

  // start di login (atau ganti ke users jika kamu mau)
  render('login');
}
