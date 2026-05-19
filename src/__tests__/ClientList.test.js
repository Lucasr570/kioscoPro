import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ClientList from '../components/ClientList';
import * as clientService from '../services/clientService';
import * as saleService from '../services/saleService';

jest.mock('../services/clientService');
jest.mock('../services/saleService');

const mockClients = [
  { id: 1, name: 'Lucas Rossi', debt: 500, address: 'Calle 123', phone: '112233' }
];

describe('ClientList Component - Business Logic', () => {
  beforeEach(() => {
    clientService.getClients.mockResolvedValue(mockClients);
    saleService.getSales.mockResolvedValue([]);
    window.alert = jest.fn(); // Mock de alert
  });

  test('debe mostrar la lista de clientes correctamente', async () => {
    render(<ClientList />);
    await waitFor(() => {
      expect(screen.getByText('Lucas Rossi')).toBeInTheDocument();
      expect(screen.getByText(/\$500[.,]00/)).toBeInTheDocument();
    });
  });

  test('no debe permitir cobrar más de lo que el cliente debe', async () => {
    render(<ClientList />);
    
    await waitFor(() => screen.getByTestId('pay-button'));
    
    const payBtn = screen.getByTestId('pay-button');
    fireEvent.click(payBtn);

    const amountInput = screen.getByPlaceholderText(/Monto a cobrar/i);
    const confirmBtn = screen.getByText('Confirmar');

    // Intentamos cobrar 600 cuando debe 500
    fireEvent.change(amountInput, { target: { value: '600' } });
    fireEvent.click(confirmBtn);

    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('No puedes cobrar más de la deuda actual'));
    expect(saleService.createSale).not.toHaveBeenCalled();
  });

  test('debe permitir cobrar un monto válido', async () => {
    render(<ClientList />);
    
    await waitFor(() => screen.getByTestId('pay-button'));
    
    fireEvent.click(screen.getByTestId('pay-button'));
    fireEvent.change(screen.getByPlaceholderText(/Monto a cobrar/i), { target: { value: '200' } });
    fireEvent.click(screen.getByText('Confirmar'));

    await waitFor(() => {
      expect(saleService.createSale).toHaveBeenCalledWith(expect.objectContaining({
        total: 200,
        paymentMethod: 'abono',
        client: 1
      }));
    });
  });
});
