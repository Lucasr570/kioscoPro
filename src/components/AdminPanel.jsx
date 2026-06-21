import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { Users, ShieldAlert, CheckCircle2, XCircle, Calendar, Trash2 } from 'lucide-react';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/admin-users/');
      setUsers(response.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Error al cargar la lista de usuarios.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (userId) => {
    try {
      const response = await apiClient.post(`/admin-users/${userId}/toggle_active/`);
      setUsers(users.map(u => u.id === userId ? { ...u, is_active: response.data.is_active } : u));
    } catch (err) {
      alert(err.response?.data?.error || 'Error al cambiar estado.');
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar DEFINITIVAMENTE a este usuario? Se perderán todos sus datos (ventas, clientes, etc).')) {
      try {
        await apiClient.delete(`/admin-users/${userId}/`);
        setUsers(users.filter(u => u.id !== userId));
      } catch (err) {
        alert('Error al eliminar el usuario.');
      }
    }
  };

  const handleUpdateExpiration = async (userId, currentExpiresAt) => {
    const newDate = window.prompt('Ingresa la nueva fecha de vencimiento (YYYY-MM-DD):', currentExpiresAt ? currentExpiresAt.split('T')[0] : '');
    if (newDate) {
      try {
        const response = await apiClient.post(`/admin-users/${userId}/update_subscription/`, {
          expires_at: `${newDate}T00:00:00Z`
        });
        setUsers(users.map(u => {
          if (u.id === userId) {
            return {
              ...u,
              subscription: {
                ...u.subscription,
                expires_at: response.data.expires_at
              }
            };
          }
          return u;
        }));
      } catch (err) {
        alert('Error al actualizar fecha.');
      }
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><p className="text-slate-500 font-bold">Cargando usuarios...</p></div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Users className="text-emerald-500" size={32} />
            Panel de SuperAdmin
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Gestión de Suscripciones y Usuarios
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2">
          <ShieldAlert size={20} />
          {error}
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500">
                <th className="p-4 font-bold">Usuario</th>
                <th className="p-4 font-bold">Email</th>
                <th className="p-4 font-bold">Suscripción</th>
                <th className="p-4 font-bold">Estado</th>
                <th className="p-4 font-bold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-bold text-slate-800">
                    {user.username}
                    {user.is_staff && <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Admin</span>}
                  </td>
                  <td className="p-4 text-slate-500">{user.email || '-'}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-slate-400" />
                      <span className="font-medium text-slate-600">
                        {user.subscription?.expires_at 
                          ? new Date(user.subscription.expires_at).toLocaleDateString()
                          : 'Sin fecha'}
                      </span>
                      <button 
                        onClick={() => handleUpdateExpiration(user.id, user.subscription?.expires_at)}
                        className="text-xs text-emerald-600 hover:text-emerald-700 ml-2 font-bold"
                      >
                        Editar
                      </button>
                    </div>
                  </td>
                  <td className="p-4">
                    {user.is_active ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-xs font-bold">
                        <CheckCircle2 size={14} /> Activo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-3 py-1 rounded-full text-xs font-bold">
                        <XCircle size={14} /> Suspendido
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleToggleActive(user.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        user.is_active 
                          ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' 
                          : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                      }`}
                    >
                      {user.is_active ? 'Suspender' : 'Activar'}
                    </button>
                    
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 transition-all inline-flex items-center gap-1"
                    >
                      <Trash2 size={14} /> Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500 font-medium">
                    No hay usuarios registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
