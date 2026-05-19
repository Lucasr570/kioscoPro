import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';

const CustomSelect = ({ 
  options = [], 
  value, 
  onChange, 
  placeholder = "Seleccionar...", 
  label, 
  icon: Icon,
  className = "",
  variant = "light"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);

  const isDark = variant === "dark";

  const selectedOption = options.find(opt => String(opt.id) === String(value));

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => 
    opt.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`flex flex-col space-y-1 min-w-0 ${className}`} ref={containerRef}>
      {label && (
        <label className={`text-[10px] font-black uppercase tracking-[0.1em] px-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {label}
        </label>
      )}
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between border-2 rounded-xl px-3 py-2 text-sm font-bold transition-all outline-none ${
            isDark 
              ? 'bg-slate-800/80 border-slate-700 text-emerald-400 focus:border-emerald-500' 
              : 'bg-white border-slate-200 text-slate-700 focus:border-emerald-500'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            {Icon && <Icon size={14} className="text-emerald-500 shrink-0" />}
            <span className="truncate">
              {selectedOption ? selectedOption.name : <span className={isDark ? 'text-slate-600' : 'text-slate-400'}>{placeholder}</span>}
            </span>
          </div>
          <ChevronDown size={14} className={`text-emerald-500 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className={`absolute z-[100] mt-1 w-full border shadow-2xl rounded-xl overflow-hidden animate-fadeIn max-w-[calc(100vw-2rem)] md:max-w-none ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            {options.length > 5 && (
              <div className={`p-2 border-b ${isDark ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    className={`w-full pl-9 pr-3 py-1.5 text-xs rounded-lg outline-none border transition-all ${
                      isDark 
                        ? 'bg-slate-900 border-slate-700 text-slate-300 focus:border-emerald-500' 
                        : 'bg-white border-slate-200 text-slate-700 focus:border-emerald-500'
                    }`}
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            )}
            
            <div className="max-h-60 overflow-y-auto custom-scrollbar">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${
                      String(opt.id) === String(value) 
                        ? (isDark ? 'bg-emerald-500/10 text-emerald-400 font-bold' : 'bg-emerald-50 text-emerald-700 font-bold') 
                        : (isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-50')
                    }`}
                    onClick={() => {
                      onChange({ target: { value: opt.id, name: label } });
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                  >
                    <span className="truncate">{opt.name}</span>
                    {String(opt.id) === String(value) && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>}
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-slate-400 font-medium">
                  No se encontraron resultados
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomSelect;
