import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { ToastContainer } from './components/layout/ToastContainer';
import { CommandPalette } from './components/layout/CommandPalette';

// Page Views
import { DashboardView } from './components/pages/DashboardView';
import { GISRouteTrackingView } from './components/pages/GISRouteTrackingView';
import { LiveCamerasView } from './components/pages/LiveCamerasView';
import { VehicleSearchView } from './components/pages/VehicleSearchView';
import { WatchlistRegistryView } from './components/pages/WatchlistRegistryView';
import { RealTimeAlertsView } from './components/pages/RealTimeAlertsView';
import { InvestigationDossierView } from './components/pages/InvestigationDossierView';
import { AnalyticsView } from './components/pages/AnalyticsView';
import { CameraFleetView } from './components/pages/CameraFleetView';
import { PipelineArchitectureView } from './components/pages/PipelineArchitectureView';
import { SystemSettingsView } from './components/pages/SystemSettingsView';

const MainLayout = () => {
  const { activePage } = useApp();

  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardView />;
      case 'cameras':
        return <LiveCamerasView />;
      case 'search':
        return <VehicleSearchView />;
      case 'tracking':
      case 'map':
        return <GISRouteTrackingView />;
      case 'watchlist':
        return <WatchlistRegistryView />;
      case 'alerts':
        return <RealTimeAlertsView />;
      case 'dossier':
        return <InvestigationDossierView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'fleet':
        return <CameraFleetView />;
      case 'pipeline':
        return <PipelineArchitectureView />;
      case 'settings':
        return <SystemSettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#060911] text-slate-100 flex flex-col relative overflow-hidden font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Ambient Radial Tactical Background Glow */}
      <div className="fixed inset-0 bg-radial-glow pointer-events-none z-0" />
      <div className="fixed inset-0 bg-threat-glow pointer-events-none z-0" />
      <div className="fixed inset-0 bg-grid-pattern opacity-60 pointer-events-none z-0" />

      {/* Top Navbar */}
      <Navbar />

      {/* Main Content Layout Shell (Sidebar Left + Content Area Right) */}
      <div className="flex-1 flex relative z-10">
        <Sidebar />

        {/* Dynamic Main View Area with custom smooth scrolling */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-[calc(100vh-4rem)]">
          {renderActivePage()}
        </main>
      </div>

      {/* Global Interactive Elements */}
      <ToastContainer />
      <CommandPalette />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
