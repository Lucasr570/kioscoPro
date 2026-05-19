import React, { useState, useEffect } from 'react';
import { ChevronDown, Truck, Tag } from 'lucide-react';
import { getSuppliers } from '../services/supplierService';
import CustomSelect from './CustomSelect';

const ProductForm = ({ initialData = null, onSave, onCancel }) => {
  const [product, setProduct] = useState(initialData || {
    barcode: '',
    name: '',
    cost: 0,
    price: 0,
    stock: 0,
    minStock: 0,
    supplierId: '',
    category: 'kiosco'
  });

  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const categories = ['kiosco', 'despensa', 'cigarrillos', 'bebidas'];

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const data = await getSuppliers();
        setSuppliers(data);
      } catch (error) {
        console.error("Error fetching suppliers:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSuppliers();
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setProduct(prev => ({
      ...prev,
      [name]: ['cost','price','stock','minStock'].includes(name)
        ? parseFloat(String(value).replace(',', '.')) || 0
        : value
    }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!product.supplierId) { alert('Selecciona un proveedor'); return; }
    onSave(product);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-md mb-4">
      <h2 className="text-lg font-bold mb-3">{initialData ? 'Editar Producto' : 'Agregar Producto'}</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Código de Barras</label>
          <input
            name="barcode"
            value={product.barcode}
            onChange={handleChange}
            placeholder="Ej: 123456789"
            required
            className="mt-1 w-full border border-gray-300 rounded-md py-1 px-2 focus:outline-none focus:ring-green-600 focus:border-green-600 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Nombre</label>
          <input
            name="name"
            value={product.name}
            onChange={handleChange}
            placeholder="Ej: Alfajor Jorgito"
            required
            className="mt-1 w-full border border-gray-300 rounded-md py-1 px-2 focus:outline-none focus:ring-green-600 focus:border-green-600 text-sm"
          />
        </div>
        <CustomSelect
          label="Proveedor"
          icon={Truck}
          options={suppliers}
          value={product.supplierId}
          onChange={(e) => handleChange({ target: { name: 'supplierId', value: e.target.value } })}
          placeholder="Seleccionar Proveedor..."
        />
        <CustomSelect
          label="Rubro (Categoría)"
          icon={Tag}
          options={categories.map(c => ({ id: c, name: c }))}
          value={product.category}
          onChange={(e) => handleChange({ target: { name: 'category', value: e.target.value } })}
          placeholder="Seleccionar Categoría..."
        />
        <div>
          <label className="block text-sm font-medium text-gray-700">Costo ($)</label>
          <input
            name="cost"
            type="number"
            value={product.cost}
            onChange={handleChange}
            placeholder="Costo"
            required
            step="any"
            className="mt-1 w-full border border-gray-300 rounded-md py-1 px-2 focus:outline-none focus:ring-green-600 focus:border-green-600 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Precio de Venta ($)</label>
          <input
            name="price"
            type="number"
            value={product.price}
            onChange={handleChange}
            placeholder="Precio"
            required
            step="any"
            className="mt-1 w-full border border-gray-300 rounded-md py-1 px-2 focus:outline-none focus:ring-green-600 focus:border-green-600 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Stock Actual</label>
          <input
            name="stock"
            type="number"
            value={product.stock}
            onChange={handleChange}
            placeholder="Stock actual"
            required
            step="any"
            className={`mt-1 w-full border rounded-md py-1 px-2 focus:outline-none focus:ring-green-600 focus:border-green-600 text-sm ${product.stock < product.minStock ? 'border-red-600' : 'border-gray-300'}`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Stock Mínimo</label>
          <input
            name="minStock"
            type="number"
            value={product.minStock}
            onChange={handleChange}
            placeholder="Stock Mínimo"
            required
            step="any"
            className="mt-1 w-full border border-gray-300 rounded-md py-1 px-2 focus:outline-none focus:ring-green-600 focus:border-green-600 text-sm"
          />
        </div>
      </div>
      <div className="mt-3 flex space-x-2">
        <button type="submit" className="bg-green-600 text-white px-4 py-1.5 rounded-md hover:bg-green-700 text-sm">Guardar</button>
        <button type="button" onClick={onCancel} className="bg-gray-200 px-4 py-1.5 rounded-md hover:bg-gray-300 text-sm">Cancelar</button>
      </div>
    </form>
  );
};

export default ProductForm;
