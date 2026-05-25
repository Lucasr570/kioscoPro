import React, { useState, useEffect, useRef } from 'react';
import { Save, X, Truck, MapPin, Phone, Mail } from 'lucide-react';

const SupplierForm = ({ onSave, initialData, onCancel }) => {
  const isMounted = useRef(true);
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const [supplier, setSupplier] = useState({
    name: '',
    address: '',
    phone: '',
    email: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setSupplier({
        name: initialData.name || '',
        address: initialData.address || '',
        phone: initialData.phone || '',
        email: initialData.email || ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSupplier(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({
        ...initialData,
        ...supplier
      });
      if (isMounted.current && !initialData) {
        setSupplier({
          name: '',
          address: '',
          phone: '',
          email: ''
        });
      }
    } catch (error) {
      if (isMounted.current) {
        alert("Error al guardar proveedor: " + error.message);
      }
    } finally {
      if (isMounted.current) {
        setIsSaving(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Razón Social / Nombre</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-3 flex items-center text-slate-300 group-focus-within:text-emerald-500 transition-colors">
              <Truck size={18} />
            </div>
            <input
              type="text"
              name="name"
              value={supplier.name}
              onChange={handleChange}
              placeholder="Nombre del proveedor"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium text-slate-700"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Dirección Comercial</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-3 flex items-center text-slate-300 group-focus-within:text-emerald-500 transition-colors">
              <MapPin size={18} />
            </div>
            <input
              type="text"
              name="address"
              value={supplier.address}
              onChange={handleChange}
              placeholder="Dirección completa"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium text-slate-700"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Teléfono de Contacto</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-3 flex items-center text-slate-300 group-focus-within:text-emerald-500 transition-colors">
              <Phone size={18} />
            </div>
            <input
              type="tel"
              name="phone"
              value={supplier.phone}
              onChange={handleChange}
              placeholder="Teléfono fijo o móvil"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium text-slate-700"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Correo Electrónico</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-3 flex items-center text-slate-300 group-focus-within:text-emerald-500 transition-colors">
              <Mail size={18} />
            </div>
            <input
              type="email"
              name="email"
              value={supplier.email}
              onChange={handleChange}
              placeholder="email@ejemplo.com"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium text-slate-700"
              required
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 px-8 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-500 shadow-lg shadow-emerald-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <Save size={20} />
          )}
          <span>{initialData ? 'Actualizar Proveedor' : 'Guardar Proveedor'}</span>
        </button>
      </div>
    </form>
  );
};

export default SupplierForm;
