import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import {
  FiHome, FiUsers, FiCalendar, FiPlusSquare, FiDroplet, FiBarChart2, FiFileText,
  FiChevronsLeft, FiChevronsRight, FiLogOut, FiSettings, 
} from 'react-icons/fi';

// Define the navigation items
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
// 1. Sidebar Component (Entire sidebar as a rounded card)
// -------------------------------------------------------------------
function Sidebar({ currentPath, collapsed, toggleSidebar }) {
  const navigate = useNavigate();

  return (
    <aside
      className={`
        bg-white text-gray-800
        h-[calc(100vh-2rem)] fixed top-4 left-4
        transition-all duration-300 ease-in-out
        shadow-2xl
        z-40
        rounded-3xl
        border border-gray-200/60
        backdrop-blur-sm
        overflow-hidden
        ${collapsed ? 'w-20' : 'w-64'} 
        
        // Subtle hover effect for the entire sidebar card
        hover:shadow-2xl
        transition-shadow duration-300
      `}
    >
      {/* Sidebar Header - Integrated into card design */}
      <div className="flex items-center p-4 h-16 border-b border-gray-100/80">
        {!collapsed && (
          <div className="flex flex-col flex-grow">
            <div className="font-extrabold text-2xl text-gray-900 leading-none">SYTE</div>
            <div className="text-xs text-gray-500 mt-1">Infirmary Management System</div>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className={`
            p-2 rounded-xl text-gray-500
            bg-white border border-gray-200
            hover:bg-gray-50 hover:text-gray-700 hover:shadow-md
            transition-all duration-200
            ${collapsed ? 'mx-auto' : 'ml-auto'} 
          `}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <FiChevronsRight size={20} /> : <FiChevronsLeft size={20} />}
        </button>
      </div>

      {/* Navigation Links - Enhanced rounded cards */}
      <nav className="flex flex-col p-3 space-y-2 mt-4">
        {sidebarItems.map((item) => (
          <button
            key={item.path}
            type="button"
            onClick={() => navigate(item.path)}
            className={`
              flex items-center px-4 py-3 rounded-2xl
              text-sm font-medium
              transition-all duration-300 ease-out
              border border-transparent
              relative
              overflow-hidden
              group
              ${currentPath === item.path
                ? 'bg-gradient-to-r from-violet-500 to-violet-600 text-white shadow-lg transform scale-[1.02]'
                : 'text-gray-600 bg-white/80 hover:bg-white hover:border-gray-200 hover:shadow-lg hover:transform hover:scale-[1.02]'}
              ${collapsed ? 'justify-center' : ''}
              
              // Hover illusion effect
              before:absolute before:inset-0 before:bg-gradient-to-r before:from-gray-50 before:to-gray-100 
              before:opacity-0 before:transition-opacity before:duration-300
              hover:before:opacity-100
            `}
          >
            {/* Active state overlay */}
            {currentPath === item.path && (
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-violet-600 rounded-2xl" />
            )}
            
            {/* Content */}
            <span className={`relative z-10 flex items-center ${collapsed ? '' : 'mr-3'}`}>
              {React.cloneElement(item.icon, { 
                size: 20,
                className: currentPath === item.path ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'
              })}
            </span>
            {!collapsed && (
              <span className="relative z-10 font-semibold">
                {item.label}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Sidebar Footer - Optional bottom area */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="text-xs text-gray-400 text-center">
          {!collapsed && "Powered by "}
          {!collapsed && <span className="font-bold text-violet-600">Quadrah Solutions</span>}
        </div>
      </div>
    </aside>
  );
}

// -------------------------------------------------------------------
// 2. Topbar Component (Updated to match sidebar card style)
// -------------------------------------------------------------------
function Topbar({ isSidebarCollapsed = false }) {
  const { user, logout } = useAuth();
  
  const leftPositionClass = isSidebarCollapsed ? 'lg:left-28' : 'lg:left-72'; // Adjusted for card margins

  return (
    <header 
      className={`
        h-16 fixed top-4 z-30 
        bg-white border border-gray-200/60
        flex items-center justify-between
        transition-all duration-300 ease-in-out
        shadow-lg
        rounded-2xl
        backdrop-blur-sm
        
        // Position adjustments for sidebar card
        inset-x-4 lg:right-4
        ${leftPositionClass} 
      `}
    >
     <div className="flex items-center px-6">
        <img 
          src="/images/school-logo.png" 
          alt="School Logo" 
          className="h-12 w-12 object-cover rounded-lg" // Equal height and width
        />
        {/* Fallback if image doesn't load */}
        <div 
          className="hidden items-center justify-center h-12 w-12 bg-gradient-to-r from-blue-500 to-violet-500 rounded-lg"
          style={{display: 'none'}}
        >
          <span className="text-white font-bold text-xs">SCHOOL</span>
        </div>
      </div>


      <div className="flex items-center px-6 space-x-3">
        {/* Settings Button - Rounded Card with Hover */}
        <button 
          aria-label="Settings"
          className="p-2.5 rounded-xl text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-700 hover:shadow-md transition-all duration-200"
        >
          <FiSettings size={20} />
        </button>

        {/* User Welcome - Rounded Card */}
        <div className="px-4 py-2 rounded-xl bg-gray-50/80 border border-gray-100">
          <div className="text-sm font-medium text-gray-700">
            Welcome, 
            <span className="font-semibold text-gray-900 ml-1">
              {user?.name || 'User'}
            </span>
          </div>
        </div>
        
        {/* Logout Button - Rounded Card with Hover */}
        <button 
          onClick={logout} 
          className="flex items-center space-x-2 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-md px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
        >
          <FiLogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}

// -------------------------------------------------------------------
// 3. AppShell Component (Updated with card-based layout)
// -------------------------------------------------------------------
export default function AppShell() {
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); 
  
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const contentMarginClass = isSidebarCollapsed ? 'ml-28' : 'ml-72'; // Adjusted for card margins

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-violet-50/30">
      
      {/* Sidebar as Card */}
      <Sidebar 
        currentPath={location.pathname} 
        collapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
      />

      {/* Topbar as Card */}
      <Topbar isSidebarCollapsed={isSidebarCollapsed} />

      {/* Main Content Wrapper - Adjusted for card layout */}
      <div 
        className={`
          transition-all duration-300 ease-in-out
          ${contentMarginClass}
          mt-4
        `}
      >
        {/* Main content with enhanced card appearance */}
        <main className="p-6 pt-24">
          <div className="rounded-3xl bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200/50 min-h-[calc(100vh-8rem)] overflow-hidden">
            {/* Subtle top gradient accent */}
            <div className="h-1 bg-gradient-to-r from-violet-400 to-blue-400"></div>
            <div className="p-6">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}