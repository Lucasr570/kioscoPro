import React, { useState, useEffect } from 'react';
import { TrendingDown, Trash2, Plus, DollarSign, AlertCircle, Calendar, Receipt, Home, Users, Layers, Tag } from 'lucide-react';
import { getExpenses, createExpense, deleteExpense } from '../services/expenseService';
import CustomSelect from './CustomSelect';
import dayjs from 'dayjs';

/**
 * Componente que gestiona el registro y visualización de Egresos.
 * Permite ingresar nuevos gastos, filtrarlos por categoría y eliminarlos.
 * 
 * @returns {JSX.Element} Panel de control de egresos.
 */
const ExpenseList = () => {
  const [expenses, setExpenses] = useState([]);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Varios');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('all'); // Filtro temporal: 'today', '7days', '30days', 'all'

  const categories = [
    { value: 'Servicios', label: 'Servicios', icon: <Receipt size={16} className="text-blue-500" /> },
    { value: 'Impuestos', label: 'Impuestos', icon: <Tag size={16} className="text-red-500" /> },
    { value: 'Alquiler', label: 'Alquiler', icon: <Home size={16} className="text-purple-500" /> },
    { value: 'Sueldos', label: 'Sueldos', icon: <Users size={16} className="text-amber-500" /> },
    { value: 'Proveedores', label: 'Proveedores', icon: <Layers size={16} className="text-emerald-500" /> },
    { value: 'Varios', label: 'Varios', icon: <TrendingDown size={16} className="text-slate-500" /> }
  ];

  const fetchExpenses = async () => {
    try {
      setIsLoading(true);
      const data = await getExpenses();
      setExpenses(data);
    } catch (err) {
      setError('Error al cargar los egresos: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      alert('Por favor ingrese un monto válido.');
      return;
    }

    try {
      setIsSubmitting(true);
      await createExpense({
        amount: parseFloat(amount),
        category,
        description: description.trim()
      });
      setAmount('');
      setDescription('');
      setCategory('Varios');
      await fetchExpenses();
    } catch (err) {
      setError('Error al registrar el egreso: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este registro de gasto?')) {
      return;
    }

    try {
      await deleteExpense(id);
      await fetchExpenses();
    } catch (err) {
      alert('No se pudo eliminar el egreso: ' + err.message);
    }
  };

  const getCategoryIcon = (catName) => {
    const found = categories.find(c => c.value === catName);
    return found ? found.icon : <TrendingDown size={16} className="text-slate-500" />;
  };

  // Filtra los egresos registrados de acuerdo al rango temporal seleccionado por el usuario.
  const getFilteredExpenses = () => {
    const now = dayjs();
    return expenses.filter(exp => {
      const expDate = dayjs(exp.date);
      if (timeRange === 'today') return now.isSame(expDate, 'day');
      if (timeRange === '7days') return now.diff(expDate, 'day') <= 7;
      if (timeRange === '30days') return now.diff(expDate, 'day') <= 30;
      return true;
    });
  };

  const filteredExpenses = getFilteredExpenses();

  // Calcula el total sumando los montos de los egresos que cumplen con el filtro temporal activo.
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-20 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest animate-pulse">Cargando Egresos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 fade-in pb-10">
      {/* CABECERA */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <TrendingDown className="text-red-500" size={20} />
            Gestión de Egresos y Gastos
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Registra los gastos operativos del negocio para el balance general
          </p>
        </div>

        <div className="bg-red-50 px-4 py-2 rounded-xl border border-red-100 flex items-center space-x-3 self-start sm:self-auto">
          <div className="p-2 bg-red-500 text-white rounded-lg">
            <DollarSign size={16} />
          </div>
          <div>
            <span className="text-[8px] font-black text-red-500 uppercase tracking-widest block">Total Egresado</span>
            <span className="text-base font-black text-red-600 notranslate" translate="no">
              ${totalExpenses.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex items-center space-x-2 text-xs">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* CONTENIDO PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* FORMULARIO DE REGISTRO */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 h-fit">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
            <Plus size={14} className="text-emerald-600" />
            Registrar Nuevo Gasto
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Monto ($)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-bold">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white font-bold"
                />
              </div>
            </div>

            <CustomSelect
              label="Categoría"
              icon={Tag}
              options={categories.map(c => ({ id: c.value, name: c.label }))}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Seleccionar Categoría..."
            />

            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Descripción / Nota</label>
              <textarea
                placeholder="Ej. Pago de boleta de luz de abril"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="3"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white text-slate-700 font-medium"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg transition-colors flex items-center justify-center space-x-2 text-xs shadow-md shadow-emerald-100"
            >
              <span>{isSubmitting ? 'Registrando...' : 'Registrar Gasto'}</span>
            </button>
          </form>
        </div>

        {/* LISTADO DE EGRESOS */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl shadow-sm border border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Calendar size={14} className="text-emerald-600" />
              Historial de Egresos Recientes
            </h3>
            
            {/* Selector de rango de tiempo para egresos */}
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 self-start sm:self-auto no-print">
              {[
                { key: 'today', label: 'Hoy' },
                { key: '7days', label: '1 Semana' },
                { key: '30days', label: 'Por Mes' },
                { key: 'all', label: 'Todo' }
              ].map(range => (
                <button
                  key={range.key}
                  type="button"
                  onClick={() => setTimeRange(range.key)}
                  className={`px-3 py-1.5 text-[9px] font-black rounded-md transition-all uppercase tracking-widest ${
                    timeRange === range.key
                      ? 'bg-white text-emerald-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {filteredExpenses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Fecha</th>
                    <th className="pb-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Categoría</th>
                    <th className="pb-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Descripción</th>
                    <th className="pb-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Monto</th>
                    <th className="pb-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center no-print">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 text-[11px] font-bold text-slate-500">
                        {dayjs(exp.date).format('DD/MM/YYYY HH:mm')}
                      </td>
                      <td className="py-3 text-xs font-bold text-slate-800">
                        <div className="flex items-center space-x-1.5">
                          {getCategoryIcon(exp.category)}
                          <span>{exp.category}</span>
                        </div>
                      </td>
                      <td className="py-3 text-xs text-slate-600 font-medium max-w-[200px] truncate" title={exp.description}>
                        {exp.description || <span className="text-slate-300 italic">Sin descripción</span>}
                      </td>
                      <td className="py-3 text-xs font-black text-red-600 text-right notranslate" translate="no">
                        -${parseFloat(exp.amount || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 text-center no-print">
                        <button
                          onClick={() => handleDelete(exp.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all"
                          title="Eliminar registro"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-20">

              <AlertCircle className="mx-auto text-slate-300 mb-2" size={32} />
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">No se registraron egresos todavía</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseList;
