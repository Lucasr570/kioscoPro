import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Users, Phone, MapPin, Receipt, DollarSign, Trash2, ChevronDown, ChevronUp, CheckCircle2, XCircle, Edit3 } from 'lucide-react';
import { getClients, createClient, updateClient, deleteClient } from '../services/clientService';
import { getSales, createSale } from '../services/saleService';
import ClientForm from './ClientForm';
import dayjs from 'dayjs';

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [sales, setSales] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedClient, setExpandedClient] = useState(null);
  const [payingClient, setPayingClient] = useState(null);
  const [payAmount, setPayAmount] = useState('');

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [clientsData, salesData] = await Promise.all([
        getClients(),
        getSales()
      ]);
      setClients(clientsData);
      setSales(salesData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveClient = async clientData => {
    try {
      if (editingClient) {
        const updated = await updateClient(editingClient.id, clientData);
        setClients(prev => prev.map(c => c.id === editingClient.id ? updated : c));
        setEditingClient(null);
      } else {
        const newClient = await createClient({ ...clientData, debt: 0 });
        setClients(prev => [...prev, newClient]);
        setShowForm(false);
      }
    } catch (err) {
      alert("Error al guardar cliente: " + err.message);
    }
  };

  const handleDelete = async id => {
    if(!window.confirm('¿Seguro que deseas eliminar este cliente?')) return;
    try {
      await deleteClient(id);
      setClients(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      alert("Error deleting client: " + err.message);
    }
  };

  const toggleTickets = id => {
    setExpandedClient(prev => (prev === id ? null : id));
  };

  const handleStartPayment = id => {
    setPayingClient(id);
    setPayAmount('');
  };

  const handleConfirmPayment = async id => {
    const amount = parseFloat(payAmount);
    if (isNaN(amount) || amount <= 0) return alert('Ingresa un monto válido');
    
    const client = clients.find(c => c.id === id);
    if (client && amount > parseFloat(client.debt)) {
      return alert(`No puedes cobrar más de la deuda actual ($${parseFloat(client.debt).toFixed(2)})`);
    }
    
    try {
      await createSale({
        date: new Date().toISOString(),
        items: [],
        total: amount,
        paymentMethod: 'abono',
        client: id
      });
      loadData();
      setPayingClient(null);
    } catch (err) {
      alert("Error registrando pago: " + err.message);
    }
  };

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
              <Users className="text-emerald-600" size={24} />
              Gestión de Clientes
            </h2>
            <p className="text-slate-500 text-xs md:text-sm">Cuentas corrientes y seguimiento de deudas</p>
          </div>
          
          <button
            onClick={() => { setShowForm(!showForm); setEditingClient(null); }}
            className={`flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl font-bold transition-all w-full sm:w-auto ${
              showForm || editingClient
                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-100'
            }`}
          >
            {showForm || editingClient ? <span>Cerrar</span> : <><UserPlus size={20} /><span>Nuevo Cliente</span></>}
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre de cliente..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
          />
        </div>
      </div>

      {(showForm || editingClient) && (
        <div className="bg-white p-6 rounded-2xl shadow-xl border-2 border-emerald-50 fade-in">
          <h3 className="text-lg font-bold text-slate-800 mb-4">
            {editingClient ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}
          </h3>
          <ClientForm 
            onSave={handleSaveClient} 
            initialData={editingClient}
            onCancel={() => { setShowForm(false); setEditingClient(null); }}
          />
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-3 py-2 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">Cliente</th>
                <th className="hidden md:table-cell px-3 py-2 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">Contacto</th>
                <th className="px-3 py-2 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Deuda Actual</th>
                <th className="px-3 py-2 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredClients.map(client => (
                <React.Fragment key={client.id}>
                  <tr className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-3 py-2">
                      <div className="font-bold text-slate-800 text-sm md:text-base">{client.name}</div>
                      <div className="flex items-center text-[10px] text-slate-400 font-medium mt-0.5 md:hidden">
                        <Phone size={10} className="mr-1" /> {client.phone || 'S/T'}
                      </div>
                      <div className="flex items-center text-[10px] text-slate-400 font-medium mt-0.5">
                        <MapPin size={10} className="mr-1" /> {client.address || 'Sin dirección'}
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-3 py-2">
                      <div className="flex items-center text-sm text-slate-600 font-medium">
                        <Phone size={12} className="mr-2 text-slate-400" /> {client.phone || 'N/A'}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-col items-center">
                        <div className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          parseFloat(client.debt) > 0 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
                        }`}>
                          ${(parseFloat(client.debt)||0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex justify-end space-x-1">
                        <button 
                          onClick={() => toggleTickets(client.id)}
                          className={`p-2 rounded-lg transition-all ${expandedClient === client.id ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:bg-slate-100'}`}
                          title="Ver Tickets"
                        >
                          <Receipt size={18} />
                        </button>
                        <button 
                          onClick={() => handleStartPayment(client.id)}
                          className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"
                          title="Registrar Pago"
                          data-testid="pay-button"
                        >
                          <DollarSign size={18} />
                        </button>
                        <button 
                          onClick={() => setEditingClient(client)}
                          className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Editar"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(client.id)}
                          className="p-2 text-rose-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Formulario de cobro integrado */}
                  {payingClient === client.id && (
                    <tr className="bg-emerald-50/30 animate-fadeIn">
                      <td colSpan="4" className="px-6 py-4">
                        <div className="flex items-center justify-end space-x-3 bg-white p-4 rounded-xl border border-emerald-100 shadow-sm">
                          <span className="text-sm font-bold text-emerald-800">Registrar Pago de Deuda:</span>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 font-bold">$</span>
                            <input
                              type="number"
                              placeholder="Monto a cobrar"
                              value={payAmount}
                              onChange={e => setPayAmount(e.target.value)}
                              className="pl-7 pr-3 py-2 border-2 border-emerald-100 rounded-lg focus:ring-0 focus:border-emerald-500 outline-none w-32 font-bold text-emerald-700"
                            />
                          </div>
                          <button
                            onClick={() => handleConfirmPayment(client.id)}
                            className="bg-emerald-600 text-white py-2 px-4 rounded-lg font-bold hover:bg-emerald-500 flex items-center gap-2 transition-all"
                          >
                            <CheckCircle2 size={18} /> Confirmar
                          </button>
                          <button
                            onClick={() => setPayingClient(null)}
                            className="p-2 text-slate-400 hover:text-slate-600"
                          >
                            <XCircle size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* Historial de tickets del cliente */}
                  {expandedClient === client.id && (
                    <tr className="bg-slate-50/50 animate-fadeIn">
                      <td colSpan="4" className="px-6 py-6">
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-inner">
                          <div className="px-4 py-2 bg-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-widest">Historial Reciente</div>
                          <div className="p-4 space-y-4 max-h-80 overflow-y-auto custom-scrollbar">
                            {sales.filter(s => s.client == client.id).length > 0 ? (
                              sales.filter(s => s.client == client.id).map(sale => (
                                <div key={sale.id} className="bg-slate-50 rounded-lg p-3 border border-slate-100 hover:border-emerald-200 transition-colors">
                                  <div className="flex justify-between items-center mb-2">
                                    <div className="text-xs font-bold text-slate-400">{dayjs(sale.date).format('DD/MM/YYYY HH:mm')}</div>
                                    <div className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded uppercase">
                                      {sale.paymentMethod === 'abono' ? 'PAGO' : 'COMPRA'}
                                    </div>
                                    <div className="font-black text-slate-800">${parseFloat(sale.total).toFixed(2)}</div>
                                  </div>
                                  <div className="space-y-1">
                                    {sale.items && sale.items.map(item => (
                                      <div key={item.id} className="flex justify-between text-xs text-slate-500 font-medium">
                                        <span>{item.name || item.product_name}</span>
                                        <span>{item.quantity} x ${parseFloat(item.price_at_sale).toFixed(2)}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-6 text-slate-400 text-sm font-medium italic">Este cliente no registra operaciones.</div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClientList;
