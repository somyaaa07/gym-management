import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [meta, setMeta] = useState({ title: '', subtitle: '' });

  return (
    <div className="flex h-screen bg-ink-900">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title={meta.title} subtitle={meta.subtitle} onOpenMobile={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
          <div className="max-w-6xl mx-auto">
            <Outlet context={{ setMeta }} />
          </div>
        </main>
      </div>
    </div>
  );
}
