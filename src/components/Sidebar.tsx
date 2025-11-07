import { Brain, Cpu, Layout, Database, Printer, LayoutDashboard } from 'lucide-react';

interface SidebarProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
}

const modules = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
  { id: 'ai', name: 'AI', icon: Brain },
  { id: 'hardware-code', name: 'Hardware & Code', icon: Cpu },
  { id: 'interfaz', name: 'Interfaz', icon: Layout },
  { id: 'base-datos', name: 'Base de Datos', icon: Database },
  { id: 'impresion', name: 'Impresión', icon: Printer }
];

export function Sidebar({ activeModule, onModuleChange }: SidebarProps) {
  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-[calc(100vh-73px)] fixed left-0 transition-colors">
      <nav className="p-4 space-y-2">
        {modules.map((module) => {
          const Icon = module.icon;
          const isActive = activeModule === module.id;
          
          return (
            <button
              key={module.id}
              onClick={() => onModuleChange(module.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-gradient-to-r from-[#008080] to-[#4682B4] text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{module.name}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
