import React from 'react';
import { FiBell, FiChevronsLeft, FiChevronsRight, FiMenu, FiMoon, FiSun, FiX } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const LabTopBar = ({
  search,
  setSearch,
  theme,
  toggleTheme,
  sidebarCollapsed,
  toggleSidebarCollapsed,
  isMenuOpen,
  onToggleMenu,
}) => {
  const { user } = useAuth();

  const displayName =
    user?.full_name || user?.username || user?.user?.first_name || 'User';

  return (
    <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
      <div className="flex items-center gap-3 flex-1">
        <button
          type="button"
          onClick={onToggleMenu}
          className="md:hidden px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold"
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMenuOpen ? <FiX /> : <FiMenu />}
        </button>

        <button
          type="button"
          onClick={toggleSidebarCollapsed}
          className="hidden md:inline-flex px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <FiChevronsRight /> : <FiChevronsLeft />}
        </button>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search experiments / runs"
          className="w-full md:max-w-xl px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 justify-end">
        <button
          type="button"
          onClick={toggleTheme}
          className="px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold flex items-center gap-2"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <FiSun /> : <FiMoon />}
          <span className="text-sm">{theme === 'dark' ? 'Light' : 'Dark'}</span>
        </button>

        <button
          type="button"
          className="px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold flex items-center gap-2"
          aria-label="Notifications"
        >
          <FiBell />
          <span className="text-sm hidden sm:inline">Notifications</span>
        </button>

        <div className="px-3 py-2 rounded-lg bg-primary-100 text-primary-700 font-semibold">
          <span className="text-sm">{displayName}</span>
        </div>
      </div>
    </div>
  );
};

export default LabTopBar;
