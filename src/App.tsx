import { useState, useEffect } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardModule } from './components/modules/DashboardModule';
import { ProjectAreaModule } from './components/modules/ProjectAreaModule';
import { Toaster } from './components/ui/sonner';

const areaDetails = {
  'ai': { name: 'AI', description: 'Desarrollo e implementación de IA' },
  'hardware-code': { name: 'Hardware & Code', description: 'Desarrollo de hardware y código' },
  'interfaz': { name: 'Interfaz', description: 'Diseño y desarrollo de interfaz de usuario' },
  'base-datos': { name: 'Base de Datos', description: 'Arquitectura y gestión de datos' },
  'impresion': { name: 'Impresión (encapsulación)', description: 'Impresión 3D y encapsulación' }
};

export default function App() {
  const [username, setUsername] = useState<string | null>(null);
  const [activeModule, setActiveModule] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
      setUsername(savedUsername);
    }

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLogin = (user: string) => {
    setUsername(user);
    localStorage.setItem('username', user);
  };

  const handleLogout = () => {
    setUsername(null);
    localStorage.removeItem('username');
    setActiveModule('dashboard');
  };

  if (!username) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const renderActiveModule = () => {
    if (activeModule === 'dashboard') {
      return <DashboardModule />;
    }
    
    if (activeModule in areaDetails) {
      const area = areaDetails[activeModule as keyof typeof areaDetails];
      return (
        <ProjectAreaModule
          areaId={activeModule}
          areaName={area.name}
          username={username}
        />
      );
    }
    
    return <DashboardModule />;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header username={username} onLogout={handleLogout} isDarkMode={isDarkMode} onToggleTheme={toggleTheme} />
      <div className="flex">
        <Sidebar activeModule={activeModule} onModuleChange={setActiveModule} />
        <main className="flex-1 p-6 ml-64">
          {renderActiveModule()}
        </main>
      </div>
      <Toaster />
    </div>
  );
}
