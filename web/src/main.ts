import './style.css';
import { renderUsersView, loadUsers } from './views/usersView';

const app = document.getElementById('app')!;
renderUsersView(app);
loadUsers();
