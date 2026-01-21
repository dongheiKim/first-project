import { memo } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from '../locales';

/**
 * 네비게이션 바 컴포넌트
 */
const NavigationComponent = () => {
  const t = useTranslation();

  return (
    <nav className="navigation">
      <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
        <span>🏠</span>
        <span className="nav-label">{t.navHome}</span>
      </NavLink>
      <NavLink to="/write" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
        <span>✏️</span>
        <span className="nav-label">{t.navWrite}</span>
      </NavLink>
      <NavLink to="/stats" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
        <span>📊</span>
        <span className="nav-label">{t.navStats}</span>
      </NavLink>
      <NavLink to="/settings" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
        <span>⚙️</span>
        <span className="nav-label">{t.navSettings}</span>
      </NavLink>
    </nav>
  );
};

export const Navigation = memo(NavigationComponent);
