import React from 'react';
import { Search, X, Bell, ChevronDown, User } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { setSearchTerm } from '../store/dashboardSlice';

export const Navbar = () => {
  const dispatch = useDispatch();
  const searchTerm = useSelector((state) => state.dashboard.searchTerm);
  const categories = useSelector((state) => state.dashboard.categories);

  // Calculate search match count
  const matchCount = React.useMemo(() => {
    if (!searchTerm.trim()) return 0;
    const query = searchTerm.toLowerCase();
    let count = 0;
    categories.forEach((cat) => {
      cat.widgets.forEach((w) => {
        if (
          w.visible !== false &&
          (w.name?.toLowerCase().includes(query) || w.text?.toLowerCase().includes(query))
        ) {
          count++;
        }
      });
    });
    return count;
  }, [searchTerm, categories]);

  return (
    <header className="top-navbar">
      <div className="navbar-top-row">
        <div className="navbar-left">
          <nav aria-label="Breadcrumb" className="breadcrumb-nav">
            <span className="breadcrumb-item breadcrumb-inactive">Home</span>
            <span className="breadcrumb-separator">&gt;</span>
            <span className="breadcrumb-item breadcrumb-active">Dashboard V2</span>
          </nav>
        </div>

        <div className="navbar-right">
          <button type="button" className="nav-icon-btn" title="Notifications" aria-label="Notifications">
            <Bell size={18} />
            <span className="notification-dot" />
          </button>

          <div className="user-profile-menu">
            <div className="user-avatar-circle">
              <User size={16} />
            </div>
            <span className="user-name">Security Admin</span>
            <ChevronDown size={14} className="user-dropdown-icon" />
          </div>
        </div>
      </div>

      <div className="navbar-center">
        <div className="search-bar-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search anything..."
            value={searchTerm}
            onChange={(e) => dispatch(setSearchTerm(e.target.value))}
            aria-label="Search widgets"
          />
          {searchTerm && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => dispatch(setSearchTerm(''))}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
          {searchTerm && (
            <span className="search-badge" title="Matching widgets">
              {matchCount} {matchCount === 1 ? 'match' : 'matches'}
            </span>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
