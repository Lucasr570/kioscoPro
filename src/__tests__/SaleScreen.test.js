import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import SaleScreen from '../components/SaleScreen';
import * as productService from '../services/productService';
import * as clientService from '../services/clientService';
import * as saleService from '../services/saleService';

jest.mock('../services/productService');
jest.mock('../services/clientService');
jest.mock('../services/saleService');

const mockProducts = [
  { id: 1, name: 'Coca Cola', price: 1500, stock: 10, barcode: '7791' },
  { id: 2, name: 'Pepsi', price: 1400, stock: 5, barcode: '7792' }
];

const mockClients = [
  { id: 1, name: 'Cliente A', debt: 100 }
];

describe('SaleScreen Integration Tests', () => {
  beforeEach(() => {
    productService.getProducts.mockResolvedValue(mockProducts);
    clientService.getClients.mockResolvedValue(mockClients);
    window.alert = jest.fn();
  });

  test('debe cargar productos y clientes al montar', async () => {
    await act(async () => {
      render(<SaleScreen />);
    });
    expect(productService.getProducts).toHaveBeenCalled();
    expect(clientService.getClients).toHaveBeenCalled();
  });

  test('debe agregar producto al carrito usando el código de barras', async () => {
    await act(async () => {
      render(<SaleScreen />);
    });

    const barcodeInput = screen.getByPlaceholderText(/Escanear código/i);
    
    await act(async () => {
      fireEvent.change(barcodeInput, { target: { value: '7791' } });
      fireEvent.submit(barcodeInput.closest('form'));
    });

    expect(screen.getByText('Coca Cola')).toBeInTheDocument();
    expect(screen.getAllByText('$1500.00').length).toBeGreaterThanOrEqual(1);
  });

  test('no debe permitir agregar productos sin stock', async () => {
    const outOfStockProduct = { id: 3, name: 'Sin Stock', price: 100, stock: 0, barcode: '000' };
    productService.getProducts.mockResolvedValue([...mockProducts, outOfStockProduct]);

    await act(async () => {
      render(<SaleScreen />);
    });

    const searchInput = screen.getByPlaceholderText(/Buscar por nombre/i);
    
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'Sin' } });
    });

    const productItem = await screen.findByText('Sin Stock');
    fireEvent.click(productItem);

    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Stock insuficiente'));
  });

  test('debe completar una venta satisfactoriamente', async () => {
    saleService.createSale.mockResolvedValue({ id: 100 });
    
    await act(async () => {
      render(<SaleScreen />);
    });

    // Agregar producto
    const barcodeInput = screen.getByPlaceholderText(/Escanear código/i);
    await act(async () => {
      fireEvent.change(barcodeInput, { target: { value: '7791' } });
      fireEvent.submit(barcodeInput.closest('form'));
    });

    // Finalizar venta
    const finishBtn = screen.getByText(/COBRAR/i);
    await act(async () => {
      fireEvent.click(finishBtn);
    });

    await waitFor(() => {
      expect(saleService.createSale).toHaveBeenCalled();
      expect(screen.getByText(/Venta Registrada/i)).toBeInTheDocument();
    });
  });
});
