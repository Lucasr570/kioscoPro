import React, { useState, useEffect } from 'react';
import { getSuppliers } from '../services/supplierService';

const ProductEditModal = ({ product, onClose, onSave }) => {
  const [editedProduct, setEditedProduct] = useState({ ...product });
  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const data = await getSuppliers();
        setSuppliers(data);
      } catch (err) {
        console.error("Error loading suppliers", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSuppliers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedProduct(prev => ({
      ...prev,
      [name]: name === 'cost' || name === 'price' || name === 'stock' || name === 'minStock' 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!editedProduct.supplierId) {
      alert('Por favor seleccione un proveedor');
      return;
    }

    const selectedSupplier = suppliers.find(s => s.id === editedProduct.supplierId);
    onSave({
      ...editedProduct,
      supplier: selectedSupplier.name
    });
  };

  return (
    <div className="fixed inset-0 bg-green-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Editar Producto</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                <input
                  type="text"
                  name="name"
                  value={editedProduct.name}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-600 focus:border-green-600"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Proveedor</label>
                <select
                  name="supplierId"
                  value={editedProduct.supplierId}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-600 focus:border-green-600"
                  required
                >
                  <option value="">Seleccionar proveedor</option>
                  {suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name} - {supplier.phone}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Costo</label>
                  <input
                    type="number"
                    name="cost"
                    value={editedProduct.cost}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-600 focus:border-green-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Precio</label>
                  <input
                    type="number"
                    name="price"
                    value={editedProduct.price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-600 focus:border-green-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Stock</label>
                  <input
                    type="number"
                    name="stock"
                    value={editedProduct.stock}
                    onChange={handleChange}
                    min="0"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-600 focus:border-green-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mínimo</label>
                  <input
                    type="number"
                    name="minStock"
                    value={editedProduct.minStock}
                    onChange={handleChange}
                    min="0"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-600 focus:border-green-600"
                    required
                  />
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-600">
                  Margen: ${(editedProduct.price - editedProduct.cost).toFixed(2)} ({editedProduct.cost > 0 ? ((editedProduct.price - editedProduct.cost) / editedProduct.cost * 100).toFixed(2) : '0'}%)
                </p>
                {editedProduct.stock < editedProduct.minStock && (
                  <p className="text-sm text-red-600 mt-1">
                    ¡Stock bajo! Necesitas reponer {editedProduct.minStock - editedProduct.stock} unidades
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductEditModal;
