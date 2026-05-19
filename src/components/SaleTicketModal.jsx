import React, { useRef } from 'react';
import { Printer, Share2, ShoppingBag, Calendar, Clock, CreditCard, Banknote, User, CheckCircle2 } from 'lucide-react';
import dayjs from 'dayjs';

const SaleTicketModal = ({ sale, onClose }) => {
  const ticketRef = useRef();

  if (!sale) return null;

  const handlePrint = () => {
    const printContent = ticketRef.current.innerHTML;
    const originalContent = document.body.innerHTML;
    
    // Simple print implementation using a new window or just standard print
    // For a real professional app, we'd use a hidden iframe or a specific print library
    // but for MVP, window.print() on the whole page with CSS media print is best.
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="p-5 bg-slate-50 border-b border-slate-100 flex justify-center items-center shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <h3 className="font-black text-slate-800 text-xs tracking-[0.2em] uppercase">Venta Registrada</h3>
          </div>
        </div>

        {/* TICKET CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 bg-white custom-scrollbar" ref={ticketRef}>
          <div className="flex flex-col items-center mb-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                <ShoppingBag size={18} />
              </div>
              <h2 className="text-lg font-black text-slate-800">Kiosco<span className="text-emerald-600">Pro</span></h2>
            </div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">Comprobante de Venta</p>
          </div>

          <div className="space-y-3 border-t border-b border-dashed border-slate-200 py-4 mb-4">
            <div className="flex justify-between text-xs font-bold text-slate-500">
              <div className="flex items-center gap-1.5">
                <Calendar size={12} />
                <span>{dayjs(sale.date).format('DD/MM/YYYY')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={12} />
                <span>{dayjs(sale.date).format('HH:mm')}hs</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
              {sale.paymentMethod === 'efectivo' ? <Banknote size={12} className="text-emerald-500" /> : 
               sale.paymentMethod === 'transferencia' ? <CreditCard size={12} className="text-blue-500" /> : 
               <User size={12} className="text-amber-500" />}
              <span className="uppercase tracking-widest">{sale.paymentMethod}</span>
              {sale.client_name && <span className="text-slate-800 ml-1">- {sale.client_name}</span>}
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              <span className="flex-1">Producto</span>
              <span className="w-12 text-center">Cant</span>
              <span className="w-16 text-right">Total</span>
            </div>
            {sale.items.map((item, idx) => (
              <div key={idx} className="flex text-sm">
                <div className="flex-1 font-bold text-slate-700 truncate pr-2">
                  {item.product_name || 'Producto'}
                  <div className="text-[10px] font-medium text-slate-400">${parseFloat(item.price_at_sale).toFixed(2)} c/u</div>
                </div>
                <div className="w-12 text-center font-bold text-slate-500">x{item.quantity}</div>
                <div className="w-16 text-right font-black text-slate-800">
                  ${(item.quantity * item.price_at_sale).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 flex justify-between items-center border border-slate-100">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Pagado</span>
            <span className="text-2xl font-black text-emerald-600 notranslate" translate="no">
              ${parseFloat(sale.total).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs font-bold text-slate-400">¡Gracias por su compra!</p>
            <div className="w-full h-12 flex justify-center items-center mt-4 opacity-20">
               {/* Placeholder for barcode/qr */}
               <div className="w-48 h-full bg-slate-800 flex items-center justify-center space-x-1">
                 {[...Array(20)].map((_, i) => (
                   <div key={i} className="w-1 bg-white" style={{ height: `${Math.random() * 80 + 20}%` }}></div>
                 ))}
               </div>
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-6 bg-white border-t border-slate-100 flex flex-col gap-3 shrink-0 print:hidden">
          <div className="flex gap-3">
            <button 
              onClick={handlePrint}
              className="flex-1 bg-slate-100 text-slate-700 rounded-2xl py-3 font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-200 transition-all active:scale-95"
            >
              <Printer size={16} />
              Imprimir
            </button>
            <button 
              className="flex-1 bg-slate-100 text-slate-700 rounded-2xl py-3 font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-200 transition-all active:scale-95"
              onClick={() => alert("Link de ticket copiado al portapapeles (Simulado)")}
            >
              <Share2 size={16} />
              Compartir
            </button>
          </div>
          
          <button 
            onClick={onClose}
            className="w-full bg-emerald-600 text-white rounded-2xl py-4 font-black text-sm flex items-center justify-center gap-3 hover:bg-emerald-500 transition-all active:scale-95 shadow-xl shadow-emerald-100 uppercase tracking-widest"
          >
            <CheckCircle2 size={20} />
            Finalizar Operación
          </button>
        </div>

        {/* CSS for print */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body * { visibility: hidden; }
            .print\\:hidden { display: none !important; }
            .fixed { position: relative !important; background: white !important; }
            .bg-slate-900\\/60 { background: white !important; }
            .shadow-2xl { shadow: none !important; }
            [ref="ticketRef"], [ref="ticketRef"] * { visibility: visible; }
            [ref="ticketRef"] { 
              position: absolute; 
              left: 0; 
              top: 0; 
              width: 100%;
              padding: 0;
            }
          }
        `}} />
      </div>
    </div>
  );
};

export default SaleTicketModal;
