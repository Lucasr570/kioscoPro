import apiClient from '../api/client';

export const getSuppliers = async () => {
  const response = await apiClient.get('/suppliers/');
  return response.data;
};

export const getSupplierById = async (id) => {
  const response = await apiClient.get(`/suppliers/${id}/`);
  return response.data;
};

export const createSupplier = async (supplierData) => {
  const response = await apiClient.post('/suppliers/', supplierData);
  return response.data;
};

export const updateSupplier = async (id, supplierData) => {
  const response = await apiClient.put(`/suppliers/${id}/`, supplierData);
  return response.data;
};

export const deleteSupplier = async (id) => {
  const response = await apiClient.delete(`/suppliers/${id}/`);
  return response.data;
};
