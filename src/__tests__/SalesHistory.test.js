import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SalesHistory from '../components/SalesHistory';
import * as saleService from '../services/saleService';
import dayjs from 'dayjs';

jest.mock('../services/saleService');

const mockSales = [
  {
    id: 1,
    date: dayjs().format('YYYY-MM-DD') + 'T12:00:00Z',
    total: '1500.00',
    paymentMethod: 'efectivo',
    items: [
      { product_name: 'Alfajor', quantity: 2, price_at_sale: '500', product_cost: '300' },
      { product_name: 'Coca Cola', quantity: 1, price_at_sale: '500', product_cost: '200' }
    ]
  },
  {
    id: 2,
    date: dayjs().format('YYYY-MM-DD') + 'T14:30:00Z',
    total: '2500.00',
    paymentMethod: 'transferencia',
    items: [
      { product_name: 'Cerveza', quantity: 1, price_at_sale: '2500', product_cost: '1500' }
    ]
  }
];

describe('SalesHistory Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state initially and then shows sales', async () => {
    saleService.getSales.mockResolvedValueOnce(mockSales);
    
    render(<SalesHistory />);
    
    expect(saleService.getSales).toHaveBeenCalledTimes(1);
    
    await waitFor(() => {
      // Verifica el título
      expect(screen.getByText(/Caja e Historial/i)).toBeInTheDocument();
      // Verifica valores numéricos (1500 + 2500 = 4000)
      expect(screen.getAllByText('$4.000,00').length).toBeGreaterThan(0);
    });
  });

  test('can switch filter types', async () => {
    saleService.getSales.mockResolvedValueOnce(mockSales);
    
    render(<SalesHistory />);
    
    await waitFor(() => {
      expect(screen.getByText(/Caja e Historial/i)).toBeInTheDocument();
    });

    const monthButton = screen.getByRole('button', { name: /Mes/i });
    userEvent.click(monthButton);
    
    await waitFor(() => {
      // Como las mock sales son de hoy, en el filtro del mes también deberían estar
      expect(screen.getAllByText('$4.000,00').length).toBeGreaterThan(0);
    });
  });
});
