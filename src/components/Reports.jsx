import React, { useState, useEffect } from 'react';
import { BarChart3, PieChart as PieIcon, Clock, TrendingUp, DollarSign, ShoppingBag, Award, Calendar, TrendingDown, ChevronDown, Download, Printer } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, CartesianGrid, ComposedChart, Line } from 'recharts';
import { getSales } from '../services/saleService';
import { getExpenses } from '../services/expenseService';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

dayjs.locale('es');

/**
 * Componente de Reportes y Análisis de Negocio.
 * Proporciona estadísticas avanzadas, tendencias de ventas,
 * desglose de métodos de pago, productos más vendidos e indicadores por horario.
 * 
 * @returns {JSX.Element} Dashboard analítico completo.
 */
const Reports = () => {
  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('7days'); // '7days', '30days', 'all'
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [salesData, expensesData] = await Promise.all([
          getSales(),
          getExpenses()
        ]);
        setSales(salesData);
        setExpenses(expensesData);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-20 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest animate-pulse">Cargando Análisis...</p>
      </div>
    );
  }

  // Filtrar ventas por rango de tiempo seleccionado
  const getFilteredSales = () => {
    const now = dayjs();
    return sales.filter(sale => {
      const saleDate = dayjs(sale.date);
      if (timeRange === '7days') return now.diff(saleDate, 'day') <= 7;
      if (timeRange === '30days') return now.diff(saleDate, 'day') <= 30;
      return true;
    });
  };

  const filteredSales = getFilteredSales();

  // Filtrar egresos por rango de tiempo seleccionado
  const getFilteredExpenses = () => {
    const now = dayjs();
    return expenses.filter(exp => {
      const expDate = dayjs(exp.date);
      if (timeRange === '7days') return now.diff(expDate, 'day') <= 7;
      if (timeRange === '30days') return now.diff(expDate, 'day') <= 30;
      return true;
    });
  };

  const filteredExpenses = getFilteredExpenses();

  // --- 1. TENDENCIA DE VENTAS (Últimos 7 o 30 días) ---
  const getTrendData = () => {
    const daysToGenerate = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 15;
    const days = Array.from({ length: daysToGenerate }).map((_, i) => {
      return dayjs().subtract(daysToGenerate - 1 - i, 'day').format('YYYY-MM-DD');
    });

    return days.map(date => {
      const daySales = sales.filter(s => dayjs(s.date).format('YYYY-MM-DD') === date);
      const total = daySales.reduce((sum, s) => sum + parseFloat(s.total || 0), 0);
      return {
        name: dayjs(date).format(daysToGenerate === 7 ? 'ddd D' : 'DD/MM'),
        total: total
      };
    });
  };

  const trendData = getTrendData();

  // --- 1B. BALANCE DE FLUJO DE CAJA ---
  // Genera los datos para el flujo de caja neto del periodo seleccionado.
  // Calcula ingresos totales diarios, egresos diarios y la utilidad neta
  // restando el costo total de los productos vendidos y los egresos fijos/operativos.
  const getBalanceData = () => {
    const daysToGenerate = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 15;
    const days = Array.from({ length: daysToGenerate }).map((_, i) => {
      return dayjs().subtract(daysToGenerate - 1 - i, 'day').format('YYYY-MM-DD');
    });

    return days.map(date => {
      const daySales = sales.filter(s => dayjs(s.date).format('YYYY-MM-DD') === date);
      const dayExpenses = expenses.filter(e => dayjs(e.date).format('YYYY-MM-DD') === date);

      const ingresos = daySales.reduce((sum, s) => sum + parseFloat(s.total || 0), 0);
      const egresos = dayExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
      
      const costos = daySales.reduce((sum, s) => {
        return sum + (s.items || []).reduce((sub, i) => {
          const unitCost = parseFloat(i.cost) || parseFloat(i.product_cost) || 0;
          return sub + (unitCost * (parseInt(i.quantity) || 0));
        }, 0);
      }, 0);

      const utilidad = (ingresos - costos) - egresos;

      const rawName = dayjs(date).format('dddd D [de] MMMM');
      const fullName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

      return {
        name: dayjs(date).format(daysToGenerate === 7 ? 'ddd D' : 'DD/MM'),
        fullName,
        Ingresos: Math.round(ingresos),
        Egresos: Math.round(egresos),
        Utilidad: Math.round(utilidad)
      };
    });
  };

  const balanceData = getBalanceData();

  // --- 2. MÉTODOS DE PAGO ---
  const cashTotal = filteredSales
    .filter(s => s.paymentMethod?.toLowerCase() === 'efectivo' || s.paymentMethod?.toLowerCase() === 'abono')
    .reduce((sum, s) => sum + parseFloat(s.total || 0), 0);
    
  const transferTotal = filteredSales
    .filter(s => s.paymentMethod?.toLowerCase() === 'transferencia')
    .reduce((sum, s) => sum + parseFloat(s.total || 0), 0);
    
  const accountTotal = filteredSales
    .filter(s => s.paymentMethod?.toLowerCase() === 'cuenta')
    .reduce((sum, s) => sum + parseFloat(s.total || 0), 0);

  const paymentMethodsData = [
    { name: 'Efectivo', value: cashTotal, color: '#10b981' },
    { name: 'Transferencia', value: transferTotal, color: '#3b82f6' },
    { name: 'Cuenta Cte', value: accountTotal, color: '#f59e0b' }
  ].filter(item => item.value > 0);

  // --- 3. PRODUCTOS MÁS VENDIDOS (TOP 5) ---
  const getTopProductsData = () => {
    const productQuantities = {};
    filteredSales.forEach(sale => {
      (sale.items || []).forEach(item => {
        const name = item.product_name || 'Producto Desconocido';
        const qty = parseInt(item.quantity) || 0;
        productQuantities[name] = (productQuantities[name] || 0) + qty;
      });
    });

    return Object.entries(productQuantities)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  };

  const topProductsData = getTopProductsData();

  // --- 4. VENTAS POR HORA DEL DÍA ---
  const getHourlySalesData = () => {
    const hours = Array.from({ length: 15 }).map((_, i) => i + 8); // 8:00 a 22:00
    return hours.map(hour => {
      const hourSales = filteredSales.filter(s => {
        const saleHour = dayjs(s.date).hour();
        return saleHour === hour;
      });
      const total = hourSales.reduce((sum, s) => sum + parseFloat(s.total || 0), 0);
      return {
        hour: `${hour}:00`,
        total: Math.round(total)
      };
    });
  };

  const hourlySalesData = getHourlySalesData();

  // --- 5. INDICADORES DE VALOR ---
  const totalSalesCount = filteredSales.length;
  const totalRevenue = filteredSales.reduce((sum, s) => sum + parseFloat(s.total || 0), 0);
  const averageTicket = totalSalesCount > 0 ? (totalRevenue / totalSalesCount) : 0;
  
  const totalCost = filteredSales.reduce((sum, s) => {
    return sum + (s.items || []).reduce((sub, i) => {
      const unitCost = parseFloat(i.cost) || parseFloat(i.product_cost) || 0;
      return sub + (unitCost * (parseInt(i.quantity) || 0));
    }, 0);
  }, 0);
  const estimatedProfit = totalRevenue - totalCost; // Ganancia Bruta
  const totalExpensesAmount = filteredExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
  const netProfit = estimatedProfit - totalExpensesAmount; // Ganancia Neta Real
  // Exporta el desglose del balance financiero diario a un archivo CSV.
  // Utiliza codificación UTF-8 con marca BOM (\uFEFF) y delimitador ';'
  // para asegurar la compatibilidad nativa y lectura correcta de caracteres
  // y separadores numéricos en Microsoft Excel.
  const exportToExcel = () => {
    const headers = ['Fecha/Dia', 'Ingresos ($)', 'Egresos ($)', 'Utilidad Neta ($)'];
    const rows = balanceData.map(row => [
      row.fullName || row.name,
      row.Ingresos,
      row.Egresos,
      row.Utilidad
    ]);

    const csvContent = "\uFEFF" 
      + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    
    const rangeText = timeRange === '7days' ? '1_semana' : timeRange === '30days' ? 'por_mes' : 'historico';
    link.setAttribute("download", `reporte_financiero_kioscopro_${rangeText}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 fade-in pb-10">
      
      {/* FILTROS E INDICADORES DE RANGO */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 className="text-emerald-600" size={20} />
            Estadísticas y Reportes
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Información e indicadores del rendimiento del negocio</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
          {/* Selector de Rango */}
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            {[
              { key: '7days', label: '1 Semana' },
              { key: '30days', label: 'Por Mes' },
              { key: 'all', label: 'Todo' }
            ].map(range => (
              <button
                key={range.key}
                onClick={() => setTimeRange(range.key)}
                className={`px-4 py-1.5 text-[10px] font-black rounded-md transition-all uppercase tracking-widest ${
                  timeRange === range.key
                    ? 'bg-white text-emerald-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>

          {/* Botones de Exportación / Impresión */}
          <div className="flex items-center gap-2 no-print">
            <button
              onClick={exportToExcel}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-3.5 py-2 rounded-lg text-[10px] uppercase tracking-widest transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
              title="Exportar reporte de balance a Excel (.csv)"
            >
              <Download size={12} className="text-white" />
              <span>Excel</span>
            </button>
            
            <button
              onClick={() => window.print()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-black px-3.5 py-2 rounded-lg text-[10px] uppercase tracking-widest transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
              title="Imprimir reporte o exportar a PDF"
            >
              <Printer size={12} className="text-white" />
              <span>Imprimir / PDF</span>
            </button>
          </div>
        </div>

      </div>

      {/* METRICAS DE VALOR AGREGADO */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-2.5">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
            <DollarSign size={16} />
          </div>
          <div>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Recaudación Total</span>
            <span className="text-xs font-black text-slate-800 notranslate" translate="no">
              ${totalRevenue.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-2.5">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg shrink-0">
            <TrendingUp size={16} />
          </div>
          <div>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Ganancia Bruta</span>
            <span className="text-xs font-black text-blue-600 notranslate" translate="no">
              ${estimatedProfit.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-2.5">
          <div className="p-2.5 bg-red-50 text-red-500 rounded-lg shrink-0">
            <TrendingDown size={16} />
          </div>
          <div>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Gastos / Egresos</span>
            <span className="text-xs font-black text-red-600 notranslate" translate="no">
              -${totalExpensesAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="bg-emerald-600 p-3 rounded-xl shadow-md text-white flex items-center space-x-2.5 col-span-2 md:col-span-1">
          <div className="p-2.5 bg-emerald-500 text-white rounded-lg shrink-0">
            <DollarSign size={16} />
          </div>
          <div>
            <span className="text-[8px] font-black text-emerald-100 uppercase tracking-widest block">Ganancia Neta Real</span>
            <span className="text-sm font-black notranslate" translate="no">
              ${netProfit.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-2.5 col-span-2 md:col-span-1">
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg shrink-0">
            <ShoppingBag size={16} />
          </div>
          <div>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Ticket Promedio</span>
            <span className="text-xs font-black text-slate-800 notranslate" translate="no">
              ${averageTicket.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* GRÁFICO NUEVO: BALANCE GENERAL (Ingresos vs Egresos vs Utilidad) */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <TrendingUp size={14} className="text-emerald-600" />
              Balance de Flujo de Caja (Ingresos vs Egresos vs Utilidad Neta)
            </h3>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Representación de rendimiento económico del negocio</p>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-bold">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
              <span className="text-slate-500">Ingresos</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
              <span className="text-slate-500">Egresos</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
              <span className="text-slate-500">Utilidad Neta</span>
            </div>
          </div>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={balanceData} margin={{ top: 10, right: 5, bottom: 5, left: -20 }}>
              <defs>
                <linearGradient id="colorBalanceIngresos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: '#64748b', fontWeight: 'bold' }} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} />
              <Tooltip 
                cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '3 3' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value, name) => [`$${value.toLocaleString('es-AR')}`, name]}
              />
              <Area type="monotone" dataKey="Ingresos" fill="url(#colorBalanceIngresos)" stroke="#10b981" strokeWidth={2} />
              <Bar dataKey="Egresos" fill="#f87171" radius={[3, 3, 0, 0]} barSize={16} />
              <Line type="monotone" dataKey="Utilidad" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#ffffff' }} activeDot={{ r: 6 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* TABLA DE MONTOS ESPECÍFICOS COMPRESIBLE */}
        <div className="border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center justify-between w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/60 rounded-xl text-xs font-black text-slate-600 uppercase tracking-widest transition-all"
          >
            <span className="flex items-center gap-2">
              <Calendar size={14} className="text-emerald-600 animate-pulse" />
              {showDetails ? 'Ocultar Detalle de Montos' : 'Ver Detalle de Montos Específicos por Día'}
            </span>
            <ChevronDown size={16} className={`text-slate-400 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
          </button>

          {showDetails && (
            <div className="overflow-x-auto rounded-xl border border-slate-100 mt-3 animate-fadeIn">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="p-2.5 text-[9px] font-black text-slate-400 uppercase tracking-widest pl-4">Fecha / Día</th>
                    <th className="p-2.5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Ingresos</th>
                    <th className="p-2.5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Egresos</th>
                    <th className="p-2.5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right pr-4">Utilidad Neta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {balanceData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-2.5 text-xs font-bold text-slate-700 pl-4">{row.fullName || row.name}</td>
                      <td className="p-2.5 text-xs font-semibold text-emerald-600 text-right notranslate" translate="no">
                        ${row.Ingresos.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-2.5 text-xs font-semibold text-red-500 text-right notranslate" translate="no">
                        ${row.Egresos > 0 ? `-${row.Egresos.toLocaleString('es-AR', { minimumFractionDigits: 2 })}` : '$0,00'}
                      </td>
                      <td className={`p-2.5 text-xs font-black text-right pr-4 notranslate ${row.Utilidad >= 0 ? 'text-blue-600' : 'text-rose-600'}`} translate="no">
                        ${row.Utilidad.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>



      {/* FILA 1 DE GRÁFICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* GRÁFICO DE TENDENCIA DE VENTAS */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
            <TrendingUp size={14} className="text-emerald-600" />
            Tendencia de Ventas (${timeRange === '7days' ? '7 Días' : '30 Días'})
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#64748b', fontWeight: 'bold' }} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  cursor={{ stroke: '#10b981', strokeWidth: 1, strokeDasharray: '4 4' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`$${value}`, 'Monto']}
                />
                <Area type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* MÉTODOS DE PAGO */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
            <PieIcon size={14} className="text-emerald-600" />
            Métodos de Pago Utilizados
          </h3>
          <div className="flex-1 flex flex-col justify-center items-center">
            {paymentMethodsData.length > 0 ? (
              <>
                <div className="h-44 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentMethodsData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {paymentMethodsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`$${value}`, 'Monto']}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '11px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full mt-2 space-y-2">
                  {paymentMethodsData.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between text-[11px] font-bold">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></div>
                        <span className="text-slate-500">{entry.name}</span>
                      </div>
                      <span className="text-slate-800 notranslate" translate="no">
                        ${entry.value.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-10 text-slate-400 font-bold text-xs uppercase tracking-widest">Sin datos de pago</div>
            )}
          </div>
        </div>
      </div>

      {/* FILA 2 DE GRÁFICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* PRODUCTOS MÁS VENDIDOS */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
            <Award size={14} className="text-emerald-600" />
            Top 5 Productos más Vendidos
          </h3>
          <div className="h-60">
            {topProductsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProductsData} layout="vertical" margin={{ top: 5, right: 5, bottom: 5, left: 30 }}>
                  <XAxis type="number" tick={{ fontSize: 9, fill: '#64748b', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: '#64748b', fontWeight: 'bold' }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="quantity" fill="#10b981" radius={[0, 4, 4, 0]} name="Cantidad Vendida" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 font-bold text-xs uppercase tracking-widest">Sin transacciones registradas</div>
            )}
          </div>
        </div>

        {/* RENDIMIENTO POR HORA */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
            <Clock size={14} className="text-emerald-600" />
            Picos de Venta por Horario (8:00 - 22:00)
          </h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlySalesData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="hour" tick={{ fontSize: 9, fill: '#64748b', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#64748b', fontWeight: 'bold' }} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`$${value}`, 'Vendido']}
                />
                <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Recaudación" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Reports;
