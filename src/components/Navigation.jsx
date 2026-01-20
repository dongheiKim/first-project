import { NavLink } from 'react-router-dom';
import { useTranslation } from '../locales';
import '../style.css';

/**
 * 네비게이션 바 컴포넌트
 */
export function Navigation() {
  const t = useTranslation();

  return (
    <nav className="navigation">
      <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
        🏠 {t.navHome}
      </NavLink>
      <NavLink to="/write" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
        ✏️ {t.navWrite}
      </NavLink>
      <NavLink to="/stats" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
        📊 {t.navStats}
      </NavLink>
      <NavLink to="/settings" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
        ⚙️ {t.navSettings}
      </NavLink>
    </nav>
  );
}
