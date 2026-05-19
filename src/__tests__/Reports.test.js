import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Reports from '../components/Reports';
import * as saleService from '../services/saleService';
import * as expenseService from '../services/expenseService';

jest.mock('../services/saleService');
jest.mock('../services/expenseService');

const mockSales = [
  {
    id: 1,
    date: new Date().toISOString(),
    total: '1500.00',
    paymentMethod: 'efectivo',
    items: [
      { product_name: 'Alfajor', quantity: 2, price_at_sale: '500', product_cost: '300' },
      { product_name: 'Coca Cola', quantity: 1, price_at_sale: '500', product_cost: '200' }
    ]
  },
  {
    id: 2,
    date: new Date().toISOString(),
    total: '2500.00',
    paymentMethod: 'transferencia',
    items: [
      { product_name: 'Cerveza', quantity: 1, price_at_sale: '2500', product_cost: '1500' }
    ]
  }
];

const mockExpenses = [
  {
    id: 1,
    amount: '300.00',
    category: 'Servicios',
    description: 'Pago Luz',
    date: new Date().toISOString()
  }
];

describe('Reports Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state initially and then shows analytics and metrics', async () => {
    saleService.getSales.mockResolvedValueOnce(mockSales);
    expenseService.getExpenses.mockResolvedValueOnce(mockExpenses);
    
    render(<Reports />);
    
    expect(screen.getByText(/Cargando Análisis.../i)).toBeInTheDocument();
    
    await waitFor(() => {
      // Verifica el título principal
      expect(screen.getByText(/Estadísticas y Reportes/i)).toBeInTheDocument();
      
      // Verifica los indicadores globales de valor
      expect(screen.getByText(/Recaudación Total/i)).toBeInTheDocument();
      expect(screen.getByText(/Ganancia Bruta/i)).toBeInTheDocument();
      expect(screen.getByText(/Gastos \/ Egresos/i)).toBeInTheDocument();
      expect(screen.getByText(/Ganancia Neta Real/i)).toBeInTheDocument();
      expect(screen.getByText(/Ticket Promedio/i)).toBeInTheDocument();
      
      // Verifica valores numéricos calculados ($1500 + $2500 = $4000)
      expect(screen.getAllByText('$4.000,00').length).toBeGreaterThan(0);
      // Verifica gastos ($300)
      expect(screen.getAllByText('-$300,00').length).toBeGreaterThan(0);
      // Verifica ganancia bruta ($1.700,00)
      expect(screen.getAllByText('$1.700,00').length).toBeGreaterThan(0);
      // Verifica ganancia neta ($1.400,00)
      expect(screen.getAllByText('$1.400,00').length).toBeGreaterThan(0);
      
      // Verifica títulos de secciones de gráficos
      expect(screen.getByText(/Métodos de Pago Utilizados/i)).toBeInTheDocument();
      expect(screen.getByText(/Top 5 Productos más Vendidos/i)).toBeInTheDocument();
      expect(screen.getByText(/Picos de Venta por Horario/i)).toBeInTheDocument();
    });
  });

  test('can switch time range filter', async () => {
    saleService.getSales.mockResolvedValueOnce(mockSales);
    expenseService.getExpenses.mockResolvedValueOnce(mockExpenses);
    
    render(<Reports />);
    
    await waitFor(() => {
      expect(screen.getByText(/Estadísticas y Reportes/i)).toBeInTheDocument();
    });

    const filter30DaysButton = screen.getByRole('button', { name: /Por Mes/i });
    userEvent.click(filter30DaysButton);
    
    await waitFor(() => {
      expect(screen.getAllByText('$4.000,00').length).toBeGreaterThan(0);
    });
  });

  test('toggles details table visibility on button click', async () => {
    saleService.getSales.mockResolvedValueOnce(mockSales);
    expenseService.getExpenses.mockResolvedValueOnce(mockExpenses);
    
    render(<Reports />);
    
    await waitFor(() => {
      expect(screen.getByText(/Estadísticas y Reportes/i)).toBeInTheDocument();
    });

    // La tabla de detalles debe estar oculta inicialmente
    expect(screen.queryByText('Fecha / Día')).not.toBeInTheDocument();
    
    // Buscar el botón para abrir el acordeón de detalles diarios
    const toggleButton = screen.getByRole('button', { name: /Ver Detalle de Montos/i });
    expect(toggleButton).toBeInTheDocument();
    
    // Hacer click en el botón para mostrar los detalles
    userEvent.click(toggleButton);
    
    // Ahora la tabla y sus cabeceras correspondientes deben estar renderizadas
    await waitFor(() => {
      expect(screen.getByText(/Fecha \/ Día/i)).toBeInTheDocument();
      expect(screen.getByText('Ocultar Detalle de Montos')).toBeInTheDocument();
    });
    
    // Hacer click nuevamente para replegar / ocultar los detalles
    userEvent.click(toggleButton);
    
    // La tabla debe desmontarse del DOM liberando recursos de renderizado
    await waitFor(() => {
      expect(screen.queryByText(/Fecha \/ Día/i)).not.toBeInTheDocument();
    });
  });
});
