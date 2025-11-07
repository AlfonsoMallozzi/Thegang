import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Progress } from '../ui/progress';
import { MessageSquare, Plus, Trash2, CheckCircle2, Circle, Link2, AlertCircle, Edit2, UserPlus, Save, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { toast } from 'sonner@2.0.3';
import { Loader } from '../Loader';

interface ProjectAreaModuleProps {
  areaId: string;
  areaName: string;
  username: string;
}

interface Comment {
  id: string;
  username: string;
  message: string;
  timestamp: number;
}

interface SubPoint {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdBy: string;
  timestamp: number;
  dependsOn?: string; // ID of the subpoint this depends on
  responsibleUser?: string; // User who claimed responsibility
}

const areaNames: Record<string, string> = {
  'ai': 'AI',
  'hardware-code': 'Hardware & Code',
  'interfaz': 'Interfaz',
  'base-datos': 'Base de Datos',
  'impresion': 'Impresión'
};

export function ProjectAreaModule({ areaId, areaName, username }: ProjectAreaModuleProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [subpoints, setSubpoints] = useState<SubPoint[]>([]);
  const [allSubpoints, setAllSubpoints] = useState<SubPoint[]>([]);
  const [newComment, setNewComment] = useState('');
  const [newSubpointTitle, setNewSubpointTitle] = useState('');
  const [newSubpointDesc, setNewSubpointDesc] = useState('');
  const [newSubpointDependency, setNewSubpointDependency] = useState('none');
  const [showAddSubpoint, setShowAddSubpoint] = useState(false);
  const [editingSubpoint, setEditingSubpoint] = useState<SubPoint | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editDependency, setEditDependency] = useState('none');
  const [loading, setLoading] = useState(true);

  const getAreaName = (subpointId: string) => {
    const parts = subpointId.split(':');
    if (parts.length >= 2) {
      return areaNames[parts[1]] || parts[1];
    }
    return '';
  };

  useEffect(() => {
    loadAreaData();
    // Refresh every 5 seconds for real-time updates
    const interval = setInterval(loadAreaData, 5000);
    return () => clearInterval(interval);
  }, [areaId]);

  const loadAreaData = async () => {
    try {
      // Load comments
      const commentsRes = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-cd127cd4/comments/${areaId}`,
        { headers: { 'Authorization': `Bearer ${publicAnonKey}` } }
      );
      const commentsData = await commentsRes.json();
      if (commentsData.success) {
        setComments((commentsData.data || []).sort((a: Comment, b: Comment) => b.timestamp - a.timestamp));
      }

      // Load subpoints for this area
      const subpointsRes = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-cd127cd4/subpoints/${areaId}`,
        { headers: { 'Authorization': `Bearer ${publicAnonKey}` } }
      );
      const subpointsData = await subpointsRes.json();
      if (subpointsData.success) {
        setSubpoints((subpointsData.data || []).sort((a: SubPoint, b: SubPoint) => a.timestamp - b.timestamp));
      }

      // Load all subpoints from all areas (for cross-area dependencies)
      const allSubpointsRes = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-cd127cd4/subpoints-all`,
        { headers: { 'Authorization': `Bearer ${publicAnonKey}` } }
      );
      const allSubpointsData = await allSubpointsRes.json();
      if (allSubpointsData.success) {
        setAllSubpoints(allSubpointsData.data || []);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading area data:', error);
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-cd127cd4/comments/${areaId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username,
            message: newComment,
            timestamp: Date.now()
          })
        }
      );

      const data = await res.json();
      if (data.success) {
        setNewComment('');
        loadAreaData();
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleAddSubpoint = async () => {
    if (!newSubpointTitle.trim()) return;

    try {
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-cd127cd4/subpoints/${areaId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: newSubpointTitle,
            description: newSubpointDesc,
            completed: false,
            createdBy: username,
            timestamp: Date.now(),
            dependsOn: (newSubpointDependency && newSubpointDependency !== 'none') ? newSubpointDependency : undefined
          })
        }
      );

      const data = await res.json();
      if (data.success) {
        setNewSubpointTitle('');
        setNewSubpointDesc('');
        setNewSubpointDependency('none');
        setShowAddSubpoint(false);
        loadAreaData();
        toast.success('Sub-punto agregado exitosamente');
      }
    } catch (error) {
      console.error('Error adding subpoint:', error);
      toast.error('Error al agregar sub-punto');
    }
  };

  const handleToggleSubpoint = async (subpoint: SubPoint) => {
    // Check if dependency is met
    if (!subpoint.completed && subpoint.dependsOn) {
      const dependency = subpoints.find(sp => sp.id === subpoint.dependsOn);
      if (dependency && !dependency.completed) {
        toast.error('Debes completar la dependencia primero: ' + dependency.title);
        return;
      }
    }

    try {
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-cd127cd4/subpoints/${subpoint.id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...subpoint,
            completed: !subpoint.completed
          })
        }
      );

      const data = await res.json();
      if (data.success) {
        loadAreaData();
        toast.success(subpoint.completed ? 'Tarea marcada como incompleta' : 'Tarea completada!');
      }
    } catch (error) {
      console.error('Error toggling subpoint:', error);
      toast.error('Error al actualizar tarea');
    }
  };

  const handleDeleteSubpoint = async (subpointId: string) => {
    try {
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-cd127cd4/subpoints/${subpointId}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }
      );

      const data = await res.json();
      if (data.success) {
        loadAreaData();
        toast.success('Sub-punto eliminado');
      }
    } catch (error) {
      console.error('Error deleting subpoint:', error);
      toast.error('Error al eliminar sub-punto');
    }
  };

  const handleEditSubpoint = (subpoint: SubPoint) => {
    setEditingSubpoint(subpoint);
    setEditTitle(subpoint.title);
    setEditDesc(subpoint.description || '');
    setEditDependency(subpoint.dependsOn || 'none');
  };

  const handleSaveEdit = async () => {
    if (!editingSubpoint || !editTitle.trim()) return;

    try {
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-cd127cd4/subpoints/${editingSubpoint.id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...editingSubpoint,
            title: editTitle,
            description: editDesc,
            dependsOn: (editDependency && editDependency !== 'none') ? editDependency : undefined
          })
        }
      );

      const data = await res.json();
      if (data.success) {
        setEditingSubpoint(null);
        setEditTitle('');
        setEditDesc('');
        setEditDependency('none');
        loadAreaData();
        toast.success('Sub-punto actualizado');
      }
    } catch (error) {
      console.error('Error updating subpoint:', error);
      toast.error('Error al actualizar sub-punto');
    }
  };

  const handleClaimResponsibility = async (subpoint: SubPoint) => {
    try {
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-cd127cd4/subpoints/${subpoint.id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...subpoint,
            responsibleUser: username
          })
        }
      );

      const data = await res.json();
      if (data.success) {
        loadAreaData();
        toast.success('Responsabilidad asignada a ' + username);
      }
    } catch (error) {
      console.error('Error claiming responsibility:', error);
      toast.error('Error al asignar responsabilidad');
    }
  };

  const completedCount = subpoints.filter(sp => sp.completed).length;
  const totalCount = subpoints.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="dark:text-white">{areaName}</h2>
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="dark:text-white">{areaName}</h2>
        <p className="text-gray-500 dark:text-gray-400">Gestión colaborativa del área de proyecto</p>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Progreso General</CardTitle>
          <CardDescription>
            {completedCount} de {totalCount} tareas completadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={progressPercentage} className="h-3" />
          <p className="text-sm text-gray-500 mt-2">{progressPercentage}% completado</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sub-Points Section */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Sub-Puntos de Desarrollo</CardTitle>
                <Button
                  size="sm"
                  onClick={() => setShowAddSubpoint(!showAddSubpoint)}
                  className="bg-[#008080] hover:bg-[#006666]"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Agregar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {showAddSubpoint && (
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3 bg-gray-50 dark:bg-gray-800">
                  <Input
                    placeholder="Título del sub-punto"
                    value={newSubpointTitle}
                    onChange={(e) => setNewSubpointTitle(e.target.value)}
                  />
                  <Textarea
                    placeholder="Descripción (opcional)"
                    value={newSubpointDesc}
                    onChange={(e) => setNewSubpointDesc(e.target.value)}
                    rows={2}
                  />
                  <div className="space-y-2">
                    <label className="text-sm text-gray-600 dark:text-gray-400 flex items-center space-x-1">
                      <Link2 className="w-4 h-4" />
                      <span>Dependencia (opcional)</span>
                    </label>
                    <Select value={newSubpointDependency} onValueChange={setNewSubpointDependency}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sin dependencia" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sin dependencia</SelectItem>
                        {allSubpoints.map((sp) => {
                          const spAreaId = sp.id.split(':')[1];
                          const isCurrentArea = spAreaId === areaId;
                          return (
                            <SelectItem key={sp.id} value={sp.id}>
                              {!isCurrentArea && `[${getAreaName(sp.id)}] `}{sp.title} {sp.completed ? '✓' : ''}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">
                      Puedes seleccionar dependencias de otras áreas. Este sub-punto solo podrá completarse cuando la dependencia esté completada.
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={handleAddSubpoint}
                      className="bg-[#008080] hover:bg-[#006666]"
                    >
                      Guardar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setShowAddSubpoint(false);
                        setNewSubpointTitle('');
                        setNewSubpointDesc('');
                        setNewSubpointDependency('none');
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {subpoints.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No hay sub-puntos aún. Agrega el primero.
                  </p>
                ) : (
                  subpoints.map((subpoint) => {
                    const dependency = subpoint.dependsOn ? allSubpoints.find(sp => sp.id === subpoint.dependsOn) : null;
                    const isDependencyMet = !dependency || dependency.completed;
                    const isBlocked = !subpoint.completed && !isDependencyMet;
                    const isCreator = subpoint.createdBy === username;
                    const isEditing = editingSubpoint?.id === subpoint.id;
                    
                    return (
                      <div
                        key={subpoint.id}
                        className={`p-4 border rounded-lg ${
                          subpoint.completed 
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                            : isBlocked 
                            ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' 
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        {isEditing ? (
                          <div className="space-y-3">
                            <Input
                              placeholder="Título del sub-punto"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                            />
                            <Textarea
                              placeholder="Descripción (opcional)"
                              value={editDesc}
                              onChange={(e) => setEditDesc(e.target.value)}
                              rows={2}
                            />
                            <div className="space-y-2">
                              <label className="text-sm text-gray-600 dark:text-gray-400 flex items-center space-x-1">
                                <Link2 className="w-4 h-4" />
                                <span>Dependencia (opcional)</span>
                              </label>
                              <Select value={editDependency} onValueChange={setEditDependency}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sin dependencia" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">Sin dependencia</SelectItem>
                                  {allSubpoints.filter(sp => sp.id !== subpoint.id).map((sp) => {
                                    const spAreaId = sp.id.split(':')[1];
                                    const isCurrentArea = spAreaId === areaId;
                                    return (
                                      <SelectItem key={sp.id} value={sp.id}>
                                        {!isCurrentArea && `[${getAreaName(sp.id)}] `}{sp.title} {sp.completed ? '✓' : ''}
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={handleSaveEdit}
                                className="bg-[#008080] hover:bg-[#006666]"
                              >
                                <Save className="w-4 h-4 mr-1" />
                                Guardar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingSubpoint(null);
                                  setEditTitle('');
                                  setEditDesc('');
                                  setEditDependency('none');
                                }}
                              >
                                <X className="w-4 h-4 mr-1" />
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start space-x-3">
                            <Checkbox
                              checked={subpoint.completed}
                              onCheckedChange={() => handleToggleSubpoint(subpoint)}
                              className="mt-1"
                              disabled={isBlocked}
                            />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 flex-wrap">
                                {subpoint.completed ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                                ) : isBlocked ? (
                                  <AlertCircle className="w-4 h-4 text-orange-600" />
                                ) : (
                                  <Circle className="w-4 h-4 text-gray-400" />
                                )}
                                <h4 className={subpoint.completed ? 'line-through text-gray-500' : ''}>
                                  {subpoint.title}
                                </h4>
                                {subpoint.responsibleUser && (
                                  <Badge variant="outline" className="text-xs">
                                    👤 {subpoint.responsibleUser}
                                  </Badge>
                                )}
                              </div>
                              {subpoint.description && (
                                <p className="text-sm text-gray-600 mt-1">{subpoint.description}</p>
                              )}
                              {dependency && (
                                <div className={`flex items-center space-x-1 mt-2 text-xs ${
                                  isDependencyMet ? 'text-green-600' : 'text-orange-600'
                                }`}>
                                  <Link2 className="w-3 h-3" />
                                  <span>
                                    Depende de: {dependency.title}
                                    {dependency.id.split(':')[1] !== areaId && ` [${getAreaName(dependency.id)}]`}
                                    {isDependencyMet ? ' ✓' : ' (pendiente)'}
                                  </span>
                                </div>
                              )}
                              <p className="text-xs text-gray-400 mt-2">
                                Creado por {subpoint.createdBy} • {new Date(subpoint.timestamp).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex space-x-1">
                              {!subpoint.responsibleUser && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleClaimResponsibility(subpoint)}
                                  className="text-[#4682B4] hover:text-[#3a6ea5] hover:bg-blue-50"
                                  title="Tomar responsabilidad"
                                >
                                  <UserPlus className="w-4 h-4" />
                                </Button>
                              )}
                              {isCreator && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEditSubpoint(subpoint)}
                                  className="text-[#008080] hover:text-[#006666] hover:bg-teal-50"
                                  title="Editar"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                              )}
                              {isCreator && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteSubpoint(subpoint.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  title="Eliminar"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Comments Section */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5" />
                <span>Comentarios y Progreso</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Escribe un comentario..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                />
                <Button
                  onClick={handleAddComment}
                  className="bg-[#4682B4] hover:bg-[#3a6ea5]"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {comments.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No hay comentarios aún. Sé el primero en comentar.
                  </p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-[#008080]">{comment.username}</p>
                          <p className="text-sm text-gray-700 mt-1">{comment.message}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(comment.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
