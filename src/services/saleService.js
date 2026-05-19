import apiClient from '../api/client';

/**
 * Obtiene el listado completo de ventas registradas en el sistema.
 * 
 * @returns {Promise<Array>} Promesa que resuelve a un arreglo de objetos de venta.
 */
export const getSales = async () => {
  const response = await apiClient.get('/sales/');
  return response.data;
};

/**
 * Obtiene los detalles de una venta específica mediante su identificador.
 * 
 * @param {string|number} id - Identificador único de la venta.
 * @returns {Promise<Object>} Promesa que resuelve a los datos detallados de la venta.
 */
export const getSaleById = async (id) => {
  const response = await apiClient.get(`/sales/${id}/`);
  return response.data;
};

/**
 * Crea un nuevo registro de venta procesando los productos y ajustando el stock.
 * 
 * @param {Object} saleData - Objeto que contiene los datos de la venta (items, total, método de pago).
 * @returns {Promise<Object>} Promesa que resuelve a los datos de la venta creada.
 */
export const createSale = async (saleData) => {
  const response = await apiClient.post('/sales/', saleData);
  return response.data;
};
