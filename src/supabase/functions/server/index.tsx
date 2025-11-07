import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import * as kv from './kv_store.tsx';
import { createClient } from 'jsr:@supabase/supabase-js@2.49.8';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

// Helper function to get data with keys included
const getByPrefixWithKeys = async (prefix: string): Promise<any[]> => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL'),
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
  );
  const { data, error } = await supabase.from('kv_store_cd127cd4').select('key, value').like('key', prefix + '%');
  if (error) {
    throw new Error(error.message);
  }
  return data?.map((d) => ({ id: d.key, ...d.value })) ?? [];
};

// Helper function to calculate and update area progress
const updateAreaProgress = async (areaId: string): Promise<void> => {
  try {
    const subpoints = await getByPrefixWithKeys(`subpoint:${areaId}:`);
    const totalCount = subpoints.length;
    const completedCount = subpoints.filter((sp: any) => sp.completed).length;
    const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    
    // Get current area data
    const area = await kv.get(`project-area:${areaId}`);
    if (area) {
      // Update progress
      await kv.set(`project-area:${areaId}`, { ...area, progress });
    }
  } catch (error) {
    console.log(`Error updating progress for area ${areaId}:`, error);
  }
};

// Get all project areas
app.get('/make-server-cd127cd4/project-areas', async (c) => {
  try {
    const areas = await getByPrefixWithKeys('project-area:');
    return c.json({ success: true, data: areas });
  } catch (error) {
    console.log('Error fetching project areas:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get specific project area
app.get('/make-server-cd127cd4/project-areas/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const area = await kv.get(`project-area:${id}`);
    return c.json({ success: true, data: area });
  } catch (error) {
    console.log(`Error fetching project area ${c.req.param('id')}:`, error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create or update project area
app.post('/make-server-cd127cd4/project-areas/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    await kv.set(`project-area:${id}`, body);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error saving project area ${c.req.param('id')}:`, error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get comments for a project area
app.get('/make-server-cd127cd4/comments/:areaId', async (c) => {
  try {
    const areaId = c.req.param('areaId');
    const comments = await getByPrefixWithKeys(`comment:${areaId}:`);
    return c.json({ success: true, data: comments });
  } catch (error) {
    console.log(`Error fetching comments for area ${c.req.param('areaId')}:`, error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Add comment
app.post('/make-server-cd127cd4/comments/:areaId', async (c) => {
  try {
    const areaId = c.req.param('areaId');
    const body = await c.req.json();
    const timestamp = Date.now();
    const commentId = `comment:${areaId}:${timestamp}`;
    await kv.set(commentId, body);
    return c.json({ success: true, data: { id: commentId, ...body } });
  } catch (error) {
    console.log(`Error adding comment to area ${c.req.param('areaId')}:`, error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get sub-points for a project area
app.get('/make-server-cd127cd4/subpoints/:areaId', async (c) => {
  try {
    const areaId = c.req.param('areaId');
    const subpoints = await getByPrefixWithKeys(`subpoint:${areaId}:`);
    return c.json({ success: true, data: subpoints });
  } catch (error) {
    console.log(`Error fetching subpoints for area ${c.req.param('areaId')}:`, error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get all sub-points from all areas (for cross-area dependencies)
app.get('/make-server-cd127cd4/subpoints-all', async (c) => {
  try {
    const allSubpoints = await getByPrefixWithKeys('subpoint:');
    return c.json({ success: true, data: allSubpoints });
  } catch (error) {
    console.log('Error fetching all subpoints:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Add sub-point
app.post('/make-server-cd127cd4/subpoints/:areaId', async (c) => {
  try {
    const areaId = c.req.param('areaId');
    const body = await c.req.json();
    const timestamp = Date.now();
    const subpointId = `subpoint:${areaId}:${timestamp}`;
    await kv.set(subpointId, body);
    
    // Update area progress
    await updateAreaProgress(areaId);
    
    return c.json({ success: true, data: { id: subpointId, ...body } });
  } catch (error) {
    console.log(`Error adding subpoint to area ${c.req.param('areaId')}:`, error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update sub-point (for checking/unchecking)
app.put('/make-server-cd127cd4/subpoints/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    await kv.set(id, body);
    
    // Extract areaId from the subpoint id (format: subpoint:areaId:timestamp)
    const parts = id.split(':');
    if (parts.length >= 2) {
      const areaId = parts[1];
      await updateAreaProgress(areaId);
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error updating subpoint ${c.req.param('id')}:`, error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete sub-point
app.delete('/make-server-cd127cd4/subpoints/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(id);
    
    // Extract areaId from the subpoint id and update progress
    const parts = id.split(':');
    if (parts.length >= 2) {
      const areaId = parts[1];
      await updateAreaProgress(areaId);
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting subpoint ${c.req.param('id')}:`, error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Initialize default project areas
app.post('/make-server-cd127cd4/init', async (c) => {
  try {
    const defaultAreas = [
      { id: 'ai', name: 'AI', description: 'Desarrollo e implementación de IA', progress: 0 },
      { id: 'hardware-code', name: 'Hardware & Code', description: 'Desarrollo de hardware y código', progress: 0 },
      { id: 'interfaz', name: 'Interfaz', description: 'Diseño y desarrollo de interfaz de usuario', progress: 0 },
      { id: 'base-datos', name: 'Base de Datos', description: 'Arquitectura y gestión de datos', progress: 0 },
      { id: 'impresion', name: 'Impresión (encapsulación)', description: 'Impresión 3D y encapsulación', progress: 0 }
    ];

    for (const area of defaultAreas) {
      await kv.set(`project-area:${area.id}`, area);
    }

    return c.json({ success: true });
  } catch (error) {
    console.log('Error initializing project areas:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

Deno.serve(app.fetch);
