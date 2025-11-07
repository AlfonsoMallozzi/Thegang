import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Users } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (username: string) => void;
}

const USERS = {
  'Juanito': 'carrito123',
  'Alfonso': 'blackmonkey',
  'Ximena': 'OliviaRodrigo4life',
  'Jessy': 'Labubu',
  'Andres': '4detrompo'
};

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (USERS[username as keyof typeof USERS] === password) {
      onLogin(username);
    } else {
      setError('Usuario o contraseña incorrectos');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#008080] to-[#4682B4] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-[#008080] rounded-full flex items-center justify-center">
            <Users className="w-8 h-8 text-white" />
          </div>
          <CardTitle>Gestión de Proyectos Colaborativo</CardTitle>
          <CardDescription>
            Ingresa tus credenciales para acceder al sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                type="text"
                placeholder="Ingresa tu usuario"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError('');
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                required
              />
            </div>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600">{error}</p>
              </div>
            )}
            <Button type="submit" className="w-full bg-[#008080] hover:bg-[#006666]">
              Iniciar Sesión
            </Button>
          </form>
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600 mb-2">Usuarios del equipo:</p>
            <ul className="text-xs text-gray-500 space-y-1">
              {Object.keys(USERS).map((user) => (
                <li key={user}>• {user}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
