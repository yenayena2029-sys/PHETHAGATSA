"use client";

import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

export default function AdminLayoutClient({ children, sidebar, headerRight }: { children: React.ReactNode, sidebar: React.ReactNode, headerRight?: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar on route change in mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="admin-layout-wrapper">
      <style>{`
        .admin-layout-wrapper {
          display: flex;
          min-height: 100vh;
          background-color: #f8fafc;
          position: relative;
        }
        
        .admin-sidebar-container {
          transition: all 0.3s ease;
          z-index: 50;
        }
        
        .admin-main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          width: 100%;
        }

        .mobile-toggle {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          color: #334155;
          padding: 8px;
        }

        .mobile-overlay {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 40;
        }

        @media (max-width: 992px) {
          .admin-sidebar-container {
            position: fixed;
            left: -300px;
            top: 0;
            bottom: 0;
            box-shadow: 0 0 15px rgba(0,0,0,0.1);
          }
          .admin-sidebar-container.open {
            left: 0;
          }
          .mobile-toggle {
            display: block;
          }
          .mobile-overlay.open {
            display: block;
          }
          .admin-top-header {
            padding: 0 16px !important;
          }
          .admin-content-body {
            padding: 16px !important;
          }
          .table-responsive-wrapper {
            overflow-x: auto;
            width: 100%;
            -webkit-overflow-scrolling: touch;
          }
        }
      `}</style>

      {/* Mobile Overlay */}
      <div 
        className={`mobile-overlay ${isSidebarOpen ? 'open' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar */}
      <div className={`admin-sidebar-container ${isSidebarOpen ? 'open' : ''}`}>
        {sidebar}
      </div>

      {/* Main Content */}
      <div className="admin-main-content">
        <header className="admin-top-header" style={{
          height: "70px",
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 32px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button className="mobile-toggle" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <span style={{ fontSize: "15px", fontWeight: "600", color: "#334155" }}>
              SnapShop Dashboard
            </span>
          </div>
          
          <div id="admin-header-right-portal" style={{ display: "flex", alignItems: "center", gap: "24px" }}>
             {headerRight}
          </div>
        </header>

        <div className="admin-content-body" style={{ padding: "32px", overflowY: "auto", flex: 1 }}>
          <div className="table-responsive-wrapper">
             {children}
          </div>
        </div>
      </div>
    </div>
  );
}
