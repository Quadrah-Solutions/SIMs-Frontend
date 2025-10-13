import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import {
  FiHome, FiUsers, FiCalendar, FiPlusSquare, FiDroplet, FiBarChart2, FiFileText,
  FiChevronsLeft, FiChevronsRight, FiLogOut, FiSettings, 
} from 'react-icons/fi'; // Icons imported from parent scope for easy use

// Define the navigation items (Moved outside for cleaner AppShell logic)
const sidebarItems = [
  { path: "/", label: "Dashboard", icon: <FiHome /> },
  { path: "/students", label: "Students", icon: <FiUsers /> },
  { path: "/visits", label: "Visits", icon: <FiCalendar /> },
  { path: "/visits/new", label: "New Visit", icon: <FiPlusSquare /> },
  { path: "/medications", label: "Medications", icon: <FiDroplet /> },
  { path: "/analytics", label: "Analytics", icon: <FiBarChart2 /> },
  { path: "/reports", label: "Reports", icon: <FiFileText /> },
];

// -------------------------------------------------------------------
// 1. Sidebar Component (Updated to receive state/toggle as props)
// -------------------------------------------------------------------
function Sidebar({ currentPath, collapsed, toggleSidebar }) {
  const navigate = useNavigate();

  return (
    <aside
      className={`
        bg-white text-gray-800
        h-screen fixed top-0 left-0
        transition-all duration-300 ease-in-out
        shadow-lg
        z-40
        ${collapsed ? 'w-20' : 'w-64'} 
      `}
    >
      {/* Sidebar Header (Logo and Toggle Button) */}
      <div className="flex items-center p-4 h-16 border-b border-gray-200">
        {!collapsed && (
          <div className="flex flex-col flex-grow">
            <div className="font-extrabold text-2xl text-gray-900 leading-none">SIMS</div>
            <div className="text-xs text-gray-500 mt-1">Infirmary Management System</div>
          </div>
        )}
        <button
          onClick={toggleSidebar} // Use the prop function here!
          className={`
            p-2 rounded-full text-gray-500
            hover:bg-gray-200 hover:text-gray-700
            transition-colors duration-200
            ${collapsed ? 'mx-auto' : 'ml-auto'} 
          `}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <FiChevronsRight size={20} /> : <FiChevronsLeft size={20} />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-col p-2 space-y-2 mt-4">
        {sidebarItems.map((item) => (
          <button
            key={item.path}
            type="button"
            onClick={() => navigate(item.path)}
            className={`
              flex items-center px-3 py-2 rounded-lg
              text-sm font-medium
              transition-colors duration-200
              ${currentPath === item.path
                ? 'bg-emerald-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
              ${collapsed ? 'justify-center' : ''}
            `}
          >
            <span className={collapsed ? '' : 'mr-3'}>
              {React.cloneElement(item.icon, { size: 20 })}
            </span>
            {!collapsed && item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

// -------------------------------------------------------------------
// 2. Topbar Component (FIXED for hiding content)
// -------------------------------------------------------------------
function Topbar({ isSidebarCollapsed = false }) {
  const { user, logout } = useAuth();
  
  // lg:left-64 (16rem) when expanded, lg:left-20 (5rem) when collapsed
  const leftPositionClass = isSidebarCollapsed ? 'lg:left-20' : 'lg:left-64';

  return (
    <header 
      className={`
        h-16 fixed top-0 z-30 
        bg-white border-b border-gray-200
        flex items-center justify-between
        transition-all duration-300 ease-in-out
        
        // FIX: Use inset-x-0 (left-0 and right-0) for mobile.
        // Then, override 'left-0' with the dynamic 'left-xx' on desktop, 
        // while keeping 'right-0' to define the dynamic width.
        inset-x-0 lg:right-0
        ${leftPositionClass} 
      `}
    >
      <div className="flex items-center px-6">
        <h1 className="text-xl font-semibold text-gray-800">
          Dashboard
        </h1>
      </div>

      <div className="flex items-center px-6 space-x-4">
        <button 
          aria-label="Settings"
          className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        >
          <FiSettings size={20} />
        </button>

        <div className="text-sm font-medium text-gray-700">
          Welcome, 
          <span className="font-semibold text-gray-900 ml-1">
            {user?.name || 'User'}
          </span>
        </div>
        
        <button 
          onClick={logout} 
          className="flex items-center space-x-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-2 rounded-lg text-sm font-medium transition-colors border border-transparent hover:border-gray-300"
        >
          <FiLogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}

// -------------------------------------------------------------------
// 3. AppShell Component (Central State Management)
// -------------------------------------------------------------------
export default function AppShell() {
  const location = useLocation();
  // CENTRALIZED STATE: The one source of truth for the collapsed state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); 
  
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Content Margin: ml-64 (expanded) or ml-20 (collapsed)
  const contentMarginClass = isSidebarCollapsed ? 'ml-20' : 'ml-64';

  return (
    <div className="min-h-screen bg-gray-100">
      
      {/* Sidebar: Pass the state and the toggle function down */}
      <Sidebar 
        currentPath={location.pathname} 
        collapsed={isSidebarCollapsed} // Pass the state down
        toggleSidebar={toggleSidebar} // Pass the setter function down
      />

      {/* Topbar: Pass the state down */}
      <Topbar isSidebarCollapsed={isSidebarCollapsed} />

      {/* Main Content Wrapper Div */}
      <div 
        // This margin updates immediately when 'isSidebarCollapsed' changes
        className={`
          transition-all duration-300 ease-in-out
          ${contentMarginClass} // Dynamic margin fix
        `}
      >
        {/* Main content with top padding to clear the fixed Topbar */}
        <main className="p-6 pt-24">
          <Outlet />
        </main>
      </div>
    </div>
  );
}