import React, { useState, useEffect } from 'react';
import { Truck, Search, Plus, Trash2, MapPin, Phone, Mail, Edit3 } from 'lucide-react';
import { getSuppliers, deleteSupplier, createSupplier, updateSupplier } from '../services/supplierService';
import SupplierForm from './SupplierForm';

const SupplierList = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadSuppliers = async () => {
    try {
      setIsLoading(true);
      const data = await getSuppliers();
      setSuppliers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const handleSaveSupplier = async (supplierData) => {
    try {
      if (editingSupplier) {
        const updated = await updateSupplier(editingSupplier.id, supplierData);
        setSuppliers(prev => prev.map(s => s.id === editingSupplier.id ? updated : s));
        setEditingSupplier(null);
      } else {
        const newSupplier = await createSupplier(supplierData);
        setSuppliers(prev => [...prev, newSupplier]);
        setShowForm(false);
      }
    } catch (err) {
      alert("Error al guardar proveedor: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este proveedor?')) return;
    try {
      await deleteSupplier(id);
      setSuppliers(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      alert("Error deleting supplier: " + err.message);
    }
  };

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return (
    <div className="flex justify-center p-20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    </div>
  );

  return (
    <div className="space-y-6 fade-in">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Truck className="text-emerald-600" size={24} />
              <span>Gestión de Proveedores</span>
            </h2>
            <p className="text-slate-500 text-xs md:text-sm">Directorio de contacto y logística</p>
          </div>
          
          <button
            onClick={() => { setShowForm(!showForm); setEditingSupplier(null); }}
            className={`flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl font-bold transition-all w-full sm:w-auto ${
              showForm || editingSupplier
                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-100'
            }`}
          >
            {showForm || editingSupplier ? <span>Cerrar</span> : <><Plus size={20} /><span>Nuevo Proveedor</span></>}
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar proveedor por nombre..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
          />
        </div>
      </div>

      {(showForm || editingSupplier) && (
        <div className="bg-white p-6 rounded-2xl shadow-xl border-2 border-emerald-50 fade-in">
          <h3 className="text-lg font-bold text-slate-800 mb-4">
            {editingSupplier ? 'Editar Proveedor' : 'Registrar Nuevo Proveedor'}
          </h3>
          <SupplierForm 
            onSave={handleSaveSupplier} 
            initialData={editingSupplier}
            onCancel={() => { setShowForm(false); setEditingSupplier(null); }}
          />
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-4 py-3 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">Proveedor</th>
                <th className="px-4 py-3 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">Contacto</th>
                <th className="hidden lg:table-cell px-4 py-3 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">Ubicación</th>
                <th className="px-4 py-3 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-10 text-center text-slate-400 font-medium">
                    No hay proveedores registrados.
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map(supplier => (
                  <tr key={supplier.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-4 py-2.5">
                      <div className="font-bold text-slate-800 text-sm md:text-base">{supplier.name}</div>
                      <div className="flex items-center text-[10px] text-slate-400 font-medium mt-0.5 md:hidden">
                        <Phone size={10} className="mr-1" />
                        <span>{supplier.phone || 'S/T'}</span>
                      </div>
                      <div className="flex items-center text-[10px] text-slate-400 font-medium mt-0.5">
                        <Mail size={10} className="mr-1" />
                        <span>{supplier.email || 'Sin email'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center text-sm text-slate-600 font-medium">
                        <Phone size={12} className="mr-2 text-slate-400 hidden md:inline" />
                        <span>{supplier.phone || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="hidden lg:table-cell px-4 py-2.5">
                      <div className="flex items-center text-sm text-slate-600 font-medium">
                        <MapPin size={12} className="mr-2 text-slate-400" />
                        <span>{supplier.address || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex justify-end space-x-1">
                        <button 
                          onClick={() => setEditingSupplier(supplier)}
                          className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Editar"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(supplier.id)} 
                          className="p-2 text-rose-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SupplierList;
