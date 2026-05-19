import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';

const SaleItem = ({ item, onRemove, onUpdateQuantity }) => {
  const handleIncrease = () => {
    onUpdateQuantity(item.id, item.quantity + 1);
  };

  const handleDecrease = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.id, item.quantity - 1);
    }
  };

  return (
    <div className="flex items-center p-3 bg-white hover:bg-slate-50 rounded-xl transition-all group border border-transparent hover:border-slate-100">
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-slate-800 truncate">{item.name}</h3>
        <p className="text-xs font-semibold text-slate-400">
          ${parseFloat(String(item.price).replace(',', '.')).toFixed(2)} <span className="mx-1 opacity-30">|</span> un.
        </p>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={handleDecrease}
            className={`p-1 rounded-md transition-colors ${
              item.quantity <= 1 
                ? 'text-slate-300 cursor-not-allowed' 
                : 'text-slate-600 hover:bg-white hover:shadow-sm'
            }`}
            disabled={item.quantity <= 1}
            aria-label="Disminuir cantidad"
          >
            <Minus size={14} />
          </button>
          
          <span className="w-8 text-center text-sm font-bold text-slate-700">
            {item.quantity}
          </span>
          
          <button
            onClick={handleIncrease}
            className="p-1 text-slate-600 hover:bg-white hover:shadow-sm rounded-md transition-colors"
            aria-label="Aumentar cantidad"
          >
            <Plus size={14} />
          </button>
        </div>
        
        <div className="w-24 text-right notranslate" translate="no">
          <p className="text-sm font-black text-emerald-600">
            ${(parseFloat(String(item.price).replace(',', '.')) * item.quantity).toFixed(2)}
          </p>
        </div>
        
        <button
          onClick={() => onRemove(item.id)}
          className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
          aria-label="Eliminar item"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default SaleItem;
