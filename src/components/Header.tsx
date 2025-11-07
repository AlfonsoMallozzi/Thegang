import { Users, LogOut, Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';

interface HeaderProps {
  username: string;
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export function Header({ username, onLogout, isDarkMode, onToggleTheme }: HeaderProps) {
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 transition-colors">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#008080] to-[#4682B4] rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="dark:text-white">Gestión de Proyectos</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Sistema Colaborativo del Equipo</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleTheme}
            className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
            title={isDarkMode ? 'Modo claro' : 'Modo oscuro'}
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">Conectado como</p>
            <p className="text-[#008080] dark:text-[#5dc1e4]">{username}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="border-[#008080] text-[#008080] hover:bg-[#008080] hover:text-white dark:border-[#5dc1e4] dark:text-[#5dc1e4] dark:hover:bg-[#5dc1e4] dark:hover:text-gray-900"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Salir
          </Button>
        </div>
      </div>
    </header>
  );
}
