import apiClient from '../../api/client';
import { getProducts, createProduct } from '../productService';

jest.mock('../../api/client');

describe('productService', () => {
  test('getProducts debe llamar al endpoint correcto', async () => {
    apiClient.get.mockResolvedValue({ data: [{ id: 1, name: 'Test' }] });
    
    const result = await getProducts();
    
    expect(apiClient.get).toHaveBeenCalledWith('/products/');
    expect(result[0].name).toBe('Test');
  });

  test('createProduct debe enviar los datos correctamente', async () => {
    const newProduct = { name: 'Nuevo', price: 100 };
    apiClient.post.mockResolvedValue({ data: { id: 2, ...newProduct } });
    
    const result = await createProduct(newProduct);
    
    expect(apiClient.post).toHaveBeenCalledWith('/products/', newProduct);
    expect(result.id).toBe(2);
  });
});
