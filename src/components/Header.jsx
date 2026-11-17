
import { Link, NavLink } from "react-router-dom";
import { useFavorites } from "../context/useFavorites";

function Header() {
  const { notificationCount } = useFavorites();

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          THREAD<span>SCOPE</span>
        </Link>

        <nav className="navigation">
          <NavLink to="/" end>
            Home
          </NavLink>

          <NavLink
            to="/favorites"
            className="favorites-link"
            aria-label={`Favorites${notificationCount > 0
              ? `, ${notificationCount} notification${notificationCount === 1 ? "" : "s"}`
              : ""}`}
          >
            Favorites
            {notificationCount > 0 && (
              <span className="favorites-badge" aria-hidden="true">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

export default Header;
