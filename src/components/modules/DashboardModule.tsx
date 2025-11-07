import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Brain, Cpu, Layout, Database, Printer, CheckCircle2, MessageSquare, ListTodo } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { Loader } from '../Loader';

interface ProjectArea {
  id: string;
  name: string;
  description: string;
  progress: number;
}

const areaIcons = {
  'ai': Brain,
  'hardware-code': Cpu,
  'interfaz': Layout,
  'base-datos': Database,
  'impresion': Printer
};

export function DashboardModule() {
  const [areas, setAreas] = useState<ProjectArea[]>([]);
  const [stats, setStats] = useState({ totalComments: 0, totalSubpoints: 0, completedTasks: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Initialize areas if needed
      await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-cd127cd4/init`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });

      // Load areas
      const areasRes = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-cd127cd4/project-areas`,
        { headers: { 'Authorization': `Bearer ${publicAnonKey}` } }
      );
      const areasData = await areasRes.json();
      
      if (areasData.success) {
        setAreas(areasData.data || []);
        
        // Calculate statistics
        let totalComments = 0;
        let totalSubpoints = 0;
        let completedTasks = 0;

        for (const area of areasData.data || []) {
          const areaId = area.id;
          
          // Get comments count
          const commentsRes = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-cd127cd4/comments/${areaId}`,
            { headers: { 'Authorization': `Bearer ${publicAnonKey}` } }
          );
          const commentsData = await commentsRes.json();
          totalComments += commentsData.data?.length || 0;

          // Get subpoints and count completed
          const subpointsRes = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-cd127cd4/subpoints/${areaId}`,
            { headers: { 'Authorization': `Bearer ${publicAnonKey}` } }
          );
          const subpointsData = await subpointsRes.json();
          const subpoints = subpointsData.data || [];
          totalSubpoints += subpoints.length;
          completedTasks += subpoints.filter((sp: any) => sp.completed).length;
        }

        setStats({ totalComments, totalSubpoints, completedTasks });
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="dark:text-white">Dashboard del Proyecto</h2>
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="dark:text-white">Dashboard del Proyecto</h2>
        <p className="text-gray-500 dark:text-gray-400">Resumen general del progreso del equipo</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-[#008080]" />
              <span>Comentarios</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl text-[#008080]">{stats.totalComments}</p>
            <p className="text-sm text-gray-500">Total en el proyecto</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <ListTodo className="w-5 h-5 text-[#4682B4]" />
              <span>Sub-Puntos</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl text-[#4682B4]">{stats.totalSubpoints}</p>
            <p className="text-sm text-gray-500">Tareas definidas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span>Completadas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl text-green-600">{stats.completedTasks}</p>
            <p className="text-sm text-gray-500">
              {stats.totalSubpoints > 0 
                ? `${Math.round((stats.completedTasks / stats.totalSubpoints) * 100)}% del total`
                : 'Sin tareas aún'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Project Areas Overview */}
      <div>
        <h3 className="mb-4 dark:text-white">Áreas del Proyecto</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {areas.map((area) => {
            const Icon = areaIcons[area.id as keyof typeof areaIcons];
            
            return (
              <Card key={area.id}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    {Icon && <Icon className="w-6 h-6 text-[#008080]" />}
                    <span>{area.name}</span>
                  </CardTitle>
                  <CardDescription>{area.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progreso</span>
                      <span>{area.progress || 0}%</span>
                    </div>
                    <Progress value={area.progress || 0} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
