import React, { useState, useEffect } from 'react';
import { History, Calendar, TrendingUp, Wallet, ChevronDown, ChevronUp, Clock, CreditCard, Banknote, ShoppingBag } from 'lucide-react';
import { getSales } from '../services/saleService';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isBetween);
dayjs.locale('es');

/**
 * Componente que renderiza el historial de ventas y métricas financieras.
 * Incluye filtros por rango de fechas, cálculos de caja e ingresos,
 * y visualizaciones interactivas de las métricas clave.
 * 
 * @returns {JSX.Element} Dashboard y lista detallada de transacciones.
 */
const SalesHistory = () => {
  const [sales, setSales] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filterType, setFilterType] = useState('day');
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format('YYYY-MM'));
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [expandedDates, setExpandedDates] = useState({});

  useEffect(() => {
    const fetchSales = async () => {
      try {
        setIsLoading(true);
        const data = await getSales();
        setSales(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSales();
  }, []);

  const filterSales = () => {
    return sales.filter(s => {
      // Normalizar la fecha de la venta a string YYYY-MM-DD local
      const saleDateLocal = dayjs(s.date).format('YYYY-MM-DD');
      const saleMonthLocal = dayjs(s.date).format('YYYY-MM');

      switch (filterType) {
        case 'day':
          return saleDateLocal === selectedDate;
        case 'month':
          return saleMonthLocal === selectedMonth;
        case 'range':
          if (!customStart || !customEnd) return true;
          // Para el rango sí es mejor usar dayjs para comparar
          return dayjs(saleDateLocal).isBetween(customStart, customEnd, 'day', '[]');
        default:
          return true;
      }
    });
  };

  const filteredSales = filterSales();

  // Cálculos Globales para las Cards superiores
  const globalSalesTotal = filteredSales.reduce((sum, s) => sum + parseFloat(s.total || 0), 0);
  
  // El efectivo real en caja incluye ventas en efectivo + abonos (pagos de clientes)
  const globalCash = filteredSales
    .filter(s => s.paymentMethod?.toLowerCase() === 'efectivo' || s.paymentMethod?.toLowerCase() === 'abono')
    .reduce((sum, s) => sum + parseFloat(s.total || 0), 0);
    
  const globalTransfer = filteredSales
    .filter(s => s.paymentMethod?.toLowerCase() === 'transferencia')
    .reduce((sum, s) => sum + parseFloat(s.total || 0), 0);
    
  const globalAccount = filteredSales
    .filter(s => s.paymentMethod?.toLowerCase() === 'cuenta')
    .reduce((sum, s) => sum + parseFloat(s.total || 0), 0);
  const globalCost = filteredSales.reduce((sum, s) => {
    return sum + (s.items || []).reduce((sub, i) => {
      const unitCost = parseFloat(i.cost) || parseFloat(i.product_cost) || 0;
      return sub + (unitCost * (parseInt(i.quantity) || 0));
    }, 0);
  }, 0);
  const globalProfit = globalSalesTotal - globalCost;

  const salesByDate = filteredSales.reduce((acc, sale) => {
    // Usar dayjs para obtener la fecha en hora local para el agrupamiento
    const date = dayjs(sale.date).format('YYYY-MM-DD');
    if (!acc[date]) acc[date] = [];
    acc[date].push(sale);
    return acc;
  }, {});

  const summaries = Object.entries(salesByDate).map(([date, daySales]) => {
    const total = daySales.reduce((sum, sale) => sum + parseFloat(sale.total), 0);
    return { date, total, sales: daySales };
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

  const toggleDate = (date) => {
    setExpandedDates(prev => ({
      ...prev,
      [date]: !prev[date]
    }));
  };

  if (isLoading) return (
    <div className="flex justify-center p-20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    </div>
  );

  return (
    <div className="space-y-4 fade-in">
      {/* HEADER & FILTERS */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <History className="text-emerald-600" size={20} />
              Caja e Historial
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
              {['day', 'month', 'range', 'all'].map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1 text-[10px] font-black rounded-md transition-all uppercase tracking-widest ${
                    filterType === type 
                      ? 'bg-white text-emerald-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {type === 'day' ? 'Hoy' : type === 'month' ? 'Mes' : type === 'range' ? 'Rango' : 'Todo'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {filterType === 'day' && (
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                />
              )}
              {filterType === 'month' && (
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* GLOBAL STATS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <TrendingUp size={12} />
            <span className="text-[8px] font-black uppercase tracking-widest">Venta Bruta</span>
          </div>
          <div className="text-sm font-black text-slate-800 notranslate" translate="no">${globalSalesTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</div>
        </div>
        <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-1.5 text-emerald-600 mb-1">
            <Banknote size={12} />
            <span className="text-[8px] font-black uppercase tracking-widest">Efectivo/Caja</span>
          </div>
          <div className="text-sm font-black text-slate-800 notranslate" translate="no">${globalCash.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</div>
        </div>
        <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-1.5 text-blue-600 mb-1">
            <CreditCard size={12} />
            <span className="text-[8px] font-black uppercase tracking-widest">Transferencias</span>
          </div>
          <div className="text-sm font-black text-slate-800 notranslate" translate="no">${globalTransfer.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</div>
        </div>
        <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-1.5 text-amber-600 mb-1">
            <Wallet size={12} />
            <span className="text-[8px] font-black uppercase tracking-widest">Fiado (Cta. Cte.)</span>
          </div>
          <div className="text-sm font-black text-slate-800 notranslate" translate="no">${globalAccount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</div>
        </div>
        <div className="bg-emerald-600 p-3 rounded-xl shadow-md text-white col-span-2 sm:col-span-1">
          <div className="flex items-center gap-1.5 opacity-80 mb-1">
            <TrendingUp size={12} />
            <span className="text-[8px] font-black uppercase tracking-widest">Ganancia Real</span>
          </div>
          <div className="text-sm font-black notranslate" translate="no">${globalProfit.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</div>
        </div>
      </div>

      {/* LISTADO DE DÍAS (DESPLEGABLES) */}
      <div className="space-y-3">
        {summaries.length > 0 ? (
          summaries.map(summary => (
            <div key={summary.date} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div 
                className="px-5 py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => toggleDate(summary.date)}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-slate-50 text-slate-400 rounded-lg">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-700 capitalize">
                      {dayjs(summary.date).format('dddd, D [de] MMMM')}
                    </h3>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      {summary.sales.length} Ventas
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                   <div className="text-right">
                     <div className="text-[10px] font-black text-emerald-600">${summary.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</div>
                   </div>
                   {expandedDates[summary.date] ? <ChevronUp size={16} className="text-slate-300" /> : <ChevronDown size={16} className="text-slate-300" />}
                </div>
              </div>

              {/* TABLA DE VENTAS - SÓLO VISIBLE AL DESPLEGAR */}
              {expandedDates[summary.date] && (
                <div className="px-4 pb-4 animate-fadeIn">
                  <div className="bg-slate-50 rounded-xl overflow-hidden border border-slate-100">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-slate-200">
                            <th className="hidden sm:table-cell px-3 py-2 text-[9px] font-black text-slate-400 uppercase">Hora</th>
                            <th className="px-3 py-2 text-[9px] font-black text-slate-400 uppercase">Detalle</th>
                            <th className="px-3 py-2 text-[9px] font-black text-slate-400 uppercase">Pago</th>
                            <th className="px-3 py-2 text-[9px] font-black text-slate-400 uppercase text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {summary.sales.map(sale => (
                            <tr key={sale.id} className="hover:bg-white transition-colors">
                              <td className="hidden sm:table-cell px-3 py-2 text-[10px] font-bold text-slate-400">
                                {dayjs(sale.date).format('HH:mm')}
                              </td>
                              <td className="px-3 py-2">
                                <div className="text-[10px] text-slate-400 sm:hidden mb-1 font-bold">
                                  {dayjs(sale.date).format('HH:mm')}
                                </div>
                                {sale.paymentMethod === 'abono' ? (
                                  <span className="text-emerald-600 text-[10px] font-bold italic">Pago a cuenta corriente</span>
                                ) : (
                                  <div className="flex flex-col gap-0.5">
                                    {(sale.items || []).map((item, idx) => (
                                      <div key={idx} className="text-[10px] text-slate-600 flex items-center gap-1">
                                        <ShoppingBag size={10} className="text-slate-300 shrink-0" />
                                        <span className="font-bold truncate max-w-[100px] sm:max-w-none">{item.product_name || 'Producto'}</span>
                                        <span className="text-slate-400 shrink-0">x{item.quantity}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </td>
                              <td className="px-3 py-2">
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                  sale.paymentMethod === 'efectivo' ? 'bg-emerald-100 text-emerald-700' :
                                  sale.paymentMethod === 'transferencia' ? 'bg-blue-100 text-blue-700' :
                                  'bg-amber-100 text-amber-700'
                                }`}>
                                  {sale.paymentMethod}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-right">
                                <span className="text-xs font-black text-slate-800">${parseFloat(sale.total).toFixed(2)}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white p-10 rounded-xl shadow-sm border border-slate-100 text-center">
            <p className="text-slate-400 font-bold text-sm">No hay registros para este periodo</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesHistory;
