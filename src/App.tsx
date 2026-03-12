import React from 'react';
import { AppProvider, useAppContext } from './AppContext';
import Landing from './components/Landing';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import VideoEditor from './components/VideoEditor';

const AppContent = () => {
  const { view } = useAppContext();

  return (
    <>
      {view === 'landing' && <Landing />}
      {view === 'auth' && <><Landing /><Auth /></>}
      {view === 'dashboard' && <Dashboard />}
      {view === 'editor' && <VideoEditor />}
    </>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
