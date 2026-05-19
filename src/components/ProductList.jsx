import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Edit3, Trash2, AlertCircle, Package, ChevronDown } from 'lucide-react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/productService';
import { getSuppliers } from '../services/supplierService';
import ProductForm from './ProductForm';
import CustomSelect from './CustomSelect';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [prodsData, suppsData] = await Promise.all([
        getProducts(),
        getSuppliers()
      ]);
      setProducts(prodsData);
      setSuppliers(suppsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode.includes(search);
    const matchesCategory = categoryFilter ? p.category === categoryFilter : true;
    return matchesSearch && matchesCategory;
  });

  const handleAdd = async (prod) => {
    try {
      const newProd = await createProduct(prod);
      setProducts(prev => [...prev, newProd]);
      setShowForm(false);
    } catch (err) {
      alert("Error saving product: " + err.message);
    }
  };

  const handleEdit = async (prod) => {
    try {
      const updated = await updateProduct(prod.id, prod);
      setProducts(prev => prev.map(p => p.id === prod.id ? updated : p));
      setEditing(null);
    } catch (err) {
      alert("Error updating product: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este producto?')) return;
    try {
      await deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert("Error deleting product: " + err.message);
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
              <Package className="text-emerald-600" size={24} />
              Gestión de Inventario
            </h2>
            <p className="text-slate-500 text-xs md:text-sm">Control de stock y precios de productos</p>
          </div>
          
          <button
            onClick={() => { setShowForm(!showForm); setEditing(null); }}
            className={`flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl font-bold transition-all w-full sm:w-auto ${
              showForm || editing 
                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-100'
            }`}
          >
            {showForm || editing ? <span>Cerrar</span> : <><Plus size={20} /><span>Nuevo Producto</span></>}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre o código de barras..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            />
          </div>
          <CustomSelect
            options={categories.map(c => ({ id: c, name: c }))}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            placeholder="Todas las categorías"
            icon={Filter}
            className="md:col-span-1"
          />
        </div>
      </div>

      {(showForm || editing) && (
        <div className="bg-white p-6 rounded-2xl shadow-xl border-2 border-emerald-50 fade-in">
          <h3 className="text-lg font-bold text-slate-800 mb-4">{editing ? 'Editar Producto' : 'Registrar Nuevo Producto'}</h3>
          <ProductForm 
            initialData={editing} 
            onSave={editing ? handleEdit : handleAdd} 
            onCancel={() => { setShowForm(false); setEditing(null); }} 
          />
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-4 py-3 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">Producto</th>
                <th className="hidden md:table-cell px-4 py-3 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">Código</th>
                <th className="px-4 py-3 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Stock</th>
                <th className="px-4 py-3 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">Precio</th>
                <th className="px-4 py-3 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-4 py-2.5">
                    <div className="font-bold text-slate-800 text-sm md:text-base">{p.name}</div>
                    <div className="text-[10px] text-slate-400 font-medium md:hidden">{p.barcode}</div>
                    <div className="text-[10px] text-slate-400 font-medium">{p.category || 'Sin categoría'}</div>
                  </td>
                  <td className="hidden md:table-cell px-4 py-2.5 text-sm font-mono text-slate-500">{p.barcode}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex flex-col items-center">
                      <div className={`px-3 py-0.5 rounded-full text-xs font-black flex items-center space-x-1 ${
                        p.stock <= 0 ? 'bg-rose-100 text-rose-600' : 
                        p.stock <= p.minStock ? 'bg-amber-100 text-amber-600' : 
                        'bg-emerald-100 text-emerald-600'
                      }`}>
                        {p.stock <= p.minStock && <AlertCircle size={10} />}
                        <span>{p.stock} un.</span>
                      </div>
                      <span className="text-[9px] text-slate-400 font-bold mt-0.5">Mín: {p.minStock}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="text-sm font-black text-slate-800">${parseFloat(p.price).toFixed(2)}</div>
                    <div className="text-[10px] text-slate-400 font-bold">Costo: ${parseFloat(p.cost).toFixed(2)}</div>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex justify-end space-x-1 transition-opacity">
                      <button 
                        onClick={() => setEditing(p)} 
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                        title="Editar"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(p.id)} 
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-10 text-center text-slate-400 font-medium">
            No se encontraron productos que coincidan con la búsqueda.
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;
