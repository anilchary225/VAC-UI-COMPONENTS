import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/shell/Sidebar';
import { Topbar } from '../components/shell/Topbar';
import { CommandPalette } from '../components/shell/CommandPalette';
import { AuthModal } from '../features/auth/AuthModal';

export const AppLayout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F5F6FA] dark:bg-[#0A0B10]">
      {/* Sidebar with Deep Twilight Purple Gradient from Reference */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F5F6FA] dark:bg-[#0A0B10]">
        <Topbar onOpenCommandPalette={() => setIsCommandPaletteOpen(true)} />
        
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-[#F5F6FA] via-[#FAF5FF]/40 to-[#FFFBEB]/20 dark:from-[#0A0B10] dark:via-[#0E0F16] dark:to-[#0A0B10]">
          <Outlet />
        </main>
      </div>

      {/* Global Modals */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
      <AuthModal />
    </div>
  );
};
