import apiClient from '../api/client';

/**
 * Obtiene el listado completo de egresos registrados en el sistema, ordenados por fecha.
 * 
 * @returns {Promise<Array>} Promesa que resuelve a un arreglo de objetos de egreso.
 */
export const getExpenses = async () => {
  const response = await apiClient.get('/expenses/');
  return response.data;
};

/**
 * Crea un nuevo registro de egreso (gasto operativo).
 * 
 * @param {Object} expenseData - Objeto con los datos del egreso (amount, category, description).
 * @returns {Promise<Object>} Promesa que resuelve al objeto de egreso creado.
 */
export const createExpense = async (expenseData) => {
  const response = await apiClient.post('/expenses/', expenseData);
  return response.data;
};

/**
 * Elimina un registro de egreso específico por su ID.
 * 
 * @param {string|number} id - ID del egreso a eliminar.
 * @returns {Promise<void>} Promesa de resolución vacía.
 */
export const deleteExpense = async (id) => {
  const response = await apiClient.delete(`/expenses/${id}/`);
  return response.data;
};
