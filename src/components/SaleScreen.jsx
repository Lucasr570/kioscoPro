import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Barcode, Search, User, CreditCard, Banknote, Trash2, CheckCircle2, ChevronDown } from 'lucide-react';
import { getProducts } from '../services/productService';
import { getClients } from '../services/clientService';
import { createSale } from '../services/saleService';
import CustomSelect from './CustomSelect';
import SaleTicketModal from './SaleTicketModal';
import SaleItem from './SaleItem';

/**
 * Componente principal de la interfaz de Punto de Venta (POS).
 * Permite la búsqueda de productos por código de barras o texto,
 * gestión del carrito de compras y procesamiento de transacciones
 * con diferentes métodos de pago.
 * 
 * @returns {JSX.Element} Interfaz de usuario de la pantalla de ventas.
 */
const SaleScreen = () => {
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [currentSale, setCurrentSale] = useState([]);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [total, setTotal] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastSaleForTicket, setLastSaleForTicket] = useState(null);
  const barcodeInputRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [productsData, clientsData] = await Promise.all([
          getProducts(),
          getClients()
        ]);
        setProducts(productsData);
        setClients(clientsData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!isLoading && barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, [isLoading]);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.barcode.includes(searchTerm)
  );

  useEffect(() => {
    const newTotal = currentSale.reduce((sum, item) => {
      const price = parseFloat(String(item.price).replace(',', '.')) || 0;
      return sum + price * item.quantity;
    }, 0);
    setTotal(newTotal);
  }, [currentSale]);

  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    if (!barcodeInput) return;
    const product = products.find(p => p.barcode === barcodeInput);
    if (product) addProductToSale(product);
    setBarcodeInput('');
  };

  const addProductToSale = (product) => {
    const existing = currentSale.find(i => i.id === product.id);
    if (existing) {
      handleUpdateQuantity(product.id, existing.quantity + 1);
    } else {
      if (product.stock <= 0) {
        alert("⚠️ Stock insuficiente para este producto.");
        return;
      }
      setCurrentSale(prev => [...prev, { ...product, quantity: 1 }]);
    }
  };

  const handleUpdateQuantity = (id, newQty) => {
    const product = products.find(p => p.id === id);
    if (product && newQty > product.stock) {
      alert(`⚠️ Stock insuficiente. Solo quedan ${product.stock} unidades.`);
      return;
    }
    
    if (newQty <= 0) return;
    setCurrentSale(prev =>
      prev.map(i => (i.id === id ? { ...i, quantity: newQty } : i))
    );
  };

  const handleRemoveItem = (id) => {
    setCurrentSale(prev => prev.filter(i => i.id !== id));
  };

  const handleProductSelect = (product) => {
    addProductToSale(product);
    setSearchTerm('');
    setShowSearchResults(false);
  };

  const handleCompleteSale = async () => {
    if (paymentMethod === 'cuenta' && !selectedClientId) {
      alert('Debe seleccionar un cliente para esta operación.');
      return;
    }
    
    setIsProcessing(true);
    try {
      const saleData = {
        date: new Date().toISOString(),
        items: currentSale.map(item => ({
          product: item.id,
          product_name: item.name, // Para el ticket
          quantity: item.quantity,
          price_at_sale: item.price,
          product_cost: item.cost
        })),
        total: parseFloat(total),
        paymentMethod,
        client: paymentMethod === 'cuenta' ? selectedClientId : null,
        client_name: paymentMethod === 'cuenta' ? clients.find(c => String(c.id) === String(selectedClientId))?.name : null
      };
      
      await createSale(saleData);
      
      // Mostrar ticket antes de limpiar
      setLastSaleForTicket(saleData);
      
      setCurrentSale([]);
      setPaymentMethod('efectivo');
      setSelectedClientId('');
      
      const updatedProducts = await getProducts();
      setProducts(updatedProducts);

    } catch (error) {
      alert("Error al procesar la venta: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) return (
    <div className="flex-1 flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-500 font-medium animate-pulse">Sincronizando inventario...</p>
    </div>
  );

  return (
    <div className="h-full flex flex-col space-y-3 fade-in p-2 md:p-0">
      {lastSaleForTicket && (
        <SaleTicketModal 
          sale={lastSaleForTicket} 
          onClose={() => setLastSaleForTicket(null)} 
        />
      )}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 min-h-0 overflow-y-auto lg:overflow-visible">
        
        {/* PANEL DE CONTROL (Izquierda) */}
        <div className="lg:col-span-7 flex flex-col space-y-3 min-h-0">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 shrink-0">
            <div className="flex items-center space-x-2 mb-3">
              <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                <Barcode size={16} />
              </div>
              <h2 className="text-base font-bold text-slate-800">Entrada de Productos</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <form onSubmit={handleBarcodeSubmit} className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none">
                  <Barcode size={16} />
                </div>
                <input
                  ref={barcodeInputRef}
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  placeholder="Escanear código..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm font-medium"
                />
              </form>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none">
                  <Search size={16} />
                </div>
                <input
                  type="text"
                  placeholder="Buscar por nombre..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm font-medium"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowSearchResults(e.target.value.length > 0);
                  }}
                />
                
                {showSearchResults && (
                  <div className="absolute z-50 mt-1 w-full bg-white shadow-2xl border border-slate-100 rounded-2xl max-h-60 overflow-auto glass">
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map(product => (
                        <div
                          key={product.id}
                          onClick={() => handleProductSelect(product)}
                          className="px-4 py-3 hover:bg-emerald-50 cursor-pointer border-b border-slate-50 flex justify-between items-center group transition-colors"
                        >
                          <div>
                            <div className="font-bold text-slate-800 group-hover:text-emerald-700 transition-colors text-sm">{product.name}</div>
                            <div className="text-[10px] text-slate-400 font-medium">Cód: {product.barcode}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-extrabold text-emerald-600">${parseFloat(product.price).toFixed(2)}</div>
                            <div className={`text-[9px] font-bold px-2 py-0.5 rounded-full inline-block ${product.stock <= 5 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                              Stock: {product.stock}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-5 py-4 text-slate-400 text-center text-sm">Sin coincidencias</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
            <div className="px-5 py-3 border-b border-slate-50 flex justify-between items-center shrink-0">
               <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
                 <ShoppingCart size={16} className="text-emerald-600" />
                 <span>Carrito</span>
               </div>
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{currentSale.length} Items</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
              {currentSale.length > 0 ? (
                <div className="space-y-2">
                  {currentSale.map(item => (
                    <SaleItem
                      key={item.id}
                      item={item}
                      onRemove={handleRemoveItem}
                      onUpdateQuantity={handleUpdateQuantity}
                    />
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-60">
                  <ShoppingCart size={40} strokeWidth={1.5} className="mb-2" />
                  <p className="text-sm font-medium">Vacío</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* VISOR DIGITAL (Derecha) */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="bg-slate-900 rounded-[1.5rem] shadow-2xl border border-slate-800 p-5 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[60px] rounded-full"></div>
            
            <div className="relative flex flex-col">
              <div className="text-center mb-4">
                <span className="inline-block px-3 py-0.5 bg-emerald-500/10 text-emerald-500 text-[9px] font-bold uppercase tracking-[0.2em] rounded-full border border-emerald-500/20 mb-2">Total Venta</span>
                <div className="terminal-font notranslate" translate="no">
                  <div className="text-4xl md:text-5xl font-extrabold text-emerald-400 tracking-tighter drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                    <span className="text-xl md:text-2xl mr-1 text-emerald-600 opacity-50">$</span>
                    {total.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="flex items-center space-x-2 text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">
                    <CreditCard size={12} className="text-emerald-500" />
                    <span>Método de Pago</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'efectivo', label: 'Efectivo', icon: <Banknote size={14} /> },
                      { id: 'transferencia', label: 'Transf.', icon: <CheckCircle2 size={14} /> },
                      { id: 'cuenta', label: 'Cta. Cte.', icon: <User size={14} /> }
                    ].map(m => (
                      <button
                        key={m.id}
                        onClick={() => setPaymentMethod(m.id)}
                        className={`flex flex-col items-center justify-center py-2.5 rounded-xl border-2 transition-all duration-300 ${
                          paymentMethod === m.id 
                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                            : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500'
                        }`}
                      >
                        <div className="mb-1">{m.icon}</div>
                        <span className="text-[9px] font-bold uppercase">{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {paymentMethod === 'cuenta' && (
                  <div className="fade-in space-y-1">
                    <CustomSelect
                      label="Cliente"
                      icon={User}
                      options={clients}
                      value={selectedClientId}
                      onChange={(e) => setSelectedClientId(e.target.value)}
                      placeholder="Seleccionar Cliente..."
                      variant="dark"
                      className="mt-1"
                    />
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4">
                <button
                  onClick={handleCompleteSale}
                  disabled={currentSale.length === 0 || isProcessing}
                  className={`group relative w-full overflow-hidden rounded-xl py-3.5 transition-all duration-500 ${
                    currentSale.length > 0 && !isProcessing
                      ? 'bg-emerald-500 hover:bg-emerald-400 active:scale-95 shadow-lg shadow-emerald-900/40'
                      : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2 font-black text-base tracking-widest uppercase italic">
                    {isProcessing ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <span className={currentSale.length > 0 ? 'text-white' : 'text-slate-600'}>COBRAR</span>
                        <CheckCircle2 size={20} className={currentSale.length > 0 ? 'text-emerald-200' : 'text-slate-600'} />
                      </>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaleScreen;
