import React, { useState } from "react";
import { Menu, X, ShoppingCart, Package, History, Users, Truck, Store, BarChart3, TrendingDown, LogOut, ShieldCheck } from "lucide-react";

const Navigation = ({ activeTab, setActiveTab, includeSuppliers, includeClients, onLogout, isStaff }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { key: "sale", label: "Venta", icon: <ShoppingCart size={16} /> },
    { key: "products", label: "Inventario", icon: <Package size={16} /> },
    { key: "history", label: "Caja", icon: <History size={16} /> },
    { key: "reports", label: "Reportes", icon: <BarChart3 size={16} /> },
    { key: "expenses", label: "Egresos", icon: <TrendingDown size={16} /> },
    includeSuppliers && { key: "suppliers", label: "Proveedores", icon: <Truck size={16} /> },
    includeClients && { key: "clients", label: "Clientes", icon: <Users size={16} /> },
    isStaff && { key: "admin", label: "Panel Admin", icon: <ShieldCheck size={16} /> },
  ].filter(Boolean);

  return (
    <nav className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between mb-4 fade-in">
      <div className="flex items-center justify-between w-full md:w-auto">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-emerald-600 rounded-lg shadow-sm">
            <Store size={18} className="text-white" />
          </div>
          <span className="text-base font-black text-slate-800 tracking-tight">KioscoPro</span>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-all md:hidden"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <div className={`${isOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row items-center gap-1 mt-3 md:mt-0`}>
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => {
              setActiveTab(item.key);
              setIsOpen(false);
            }}
            className={`flex items-center space-x-2 py-1.5 px-3.5 text-sm font-bold rounded-lg transition-all duration-200 w-full md:w-auto ${
              activeTab === item.key
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-100"
                : "text-slate-500 hover:bg-slate-50 hover:text-emerald-600"
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
        
        {/* Botón de Cerrar Sesión */}
        <button
          onClick={onLogout}
          className="flex items-center space-x-2 py-1.5 px-3.5 text-sm font-bold rounded-lg transition-all duration-200 w-full md:w-auto text-rose-600 hover:bg-rose-50 hover:text-rose-700"
        >
          <LogOut size={16} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </nav>
  );
};

export default Navigation;
