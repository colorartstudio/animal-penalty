import React, { useContext } from 'react';
import { AppProvider, AppContext } from './context/AppContext';
import { Header, BottomNav } from './components/layout/Navigation';

// Screens
import { AuthScreen } from './screens/AuthScreen';
import { HomeScreen } from './screens/HomeScreen';
import { WalletScreen } from './screens/WalletScreen';
import { LobbyScreen } from './screens/LobbyScreen';
import { MatchScreen } from './screens/MatchScreen';
import { ResultScreen } from './screens/ResultScreen';
import { ReportScreen } from './screens/ReportScreen';
import { ForumScreen } from './screens/ForumScreen';
import { SettingsScreen, SupportScreen, LanguagesScreen } from './screens/SettingsScreen';
import { StoreScreen } from './screens/StoreScreen';
import { InventoryScreen } from './screens/InventoryScreen';

import { audioManager } from './utils/audio';

// Error Boundary para capturar erros de renderização
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, color: 'red', background: 'white', overflow: 'auto', maxHeight: '100vh' }}>
          <h1>Algo deu errado.</h1>
          <pre>{this.state.error && this.state.error.toString()}</pre>
          <pre>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
        </div>
      );
    }

    return this.props.children; 
  }
}

const Router = () => {
  const { route, currentUser } = useContext(AppContext);
  
  // Unlock audio on first interaction
  React.useEffect(() => {
    const unlock = () => {
      audioManager.unlock();
      window.removeEventListener('click', unlock);
      window.removeEventListener('touchstart', unlock);
    };
    window.addEventListener('click', unlock);
    window.addEventListener('touchstart', unlock);
    return () => {
      window.removeEventListener('click', unlock);
      window.removeEventListener('touchstart', unlock);
    };
  }, []);
  
  if (!currentUser) return <AuthScreen />;
  
  const routes = {
    '/': <HomeScreen />,
    '/wallet': <WalletScreen />,
    '/play': <LobbyScreen />,
    '/match': <MatchScreen />,
    '/result': <ResultScreen />,
    '/report': <ReportScreen />,
    '/forum': <ForumScreen />,
    '/settings': <SettingsScreen />,
    '/support': <SupportScreen />,
    '/languages': <LanguagesScreen />,
    '/store': <StoreScreen />,
    '/inventory': <InventoryScreen />
  };
  
  const Component = routes[route.path] || <HomeScreen />;
  const isMatchPage = route.path.startsWith('/match');
  
  return (
    <div className={`flex-1 overflow-y-auto bg-blue-100 text-black font-sans ${isMatchPage ? '' : 'pt-20 px-4 pb-24'}`}>
      {Component}
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <div className="h-screen w-screen bg-gray-900 flex justify-center items-center overflow-hidden">
        <div className="w-full max-w-md h-full max-h-screen bg-blue-100 shadow-2xl relative overflow-hidden flex flex-col">
          <AppProvider>
            <style>{`
              body { margin: 0; font-family: 'Nunito', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #111827; overflow: hidden; }
              .cartoon-bg { background-image: radial-gradient(#60a5fa 2px, transparent 2px); background-size: 30px 30px; }
              input, select, button { outline: none; }
              /* Esconde scrollbar mas permite scroll */
              ::-webkit-scrollbar { width: 0px; background: transparent; }
            `}</style>
            <Header />
            <Router />
            <BottomNav />
          </AppProvider>
        </div>
      </div>
    </ErrorBoundary>
  );
}
