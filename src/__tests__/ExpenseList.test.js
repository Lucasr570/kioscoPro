import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import ExpenseList from '../components/ExpenseList';
import * as expenseService from '../services/expenseService';
import dayjs from 'dayjs';

// Mock de los servicios de egresos del sistema
jest.mock('../services/expenseService');

const mockExpenses = [
  {
    id: 1,
    amount: '150.00',
    category: 'Servicios',
    description: 'Boleta de Luz',
    date: dayjs().toISOString() // Hoy
  },
  {
    id: 2,
    amount: '450.00',
    category: 'Proveedores',
    description: 'Mercadería',
    date: dayjs().subtract(4, 'day').toISOString() // Esta semana
  },
  {
    id: 3,
    amount: '1200.00',
    category: 'Alquiler',
    description: 'Alquiler Local',
    date: dayjs().subtract(15, 'day').toISOString() // Este mes
  }
];

describe('ExpenseList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state initially and then shows expenses list', async () => {
    expenseService.getExpenses.mockResolvedValueOnce(mockExpenses);
    
    render(<ExpenseList />);
    
    expect(screen.getByText(/Cargando Egresos.../i)).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText(/Gestión de Egresos y Gastos/i)).toBeInTheDocument();
      expect(screen.getByText('Boleta de Luz')).toBeInTheDocument();
      expect(screen.getByText('Mercadería')).toBeInTheDocument();
      expect(screen.getByText('Alquiler Local')).toBeInTheDocument();
    });

    // Sumatoria total de egresos mockeados: $150 + $450 + $1200 = $1800
    expect(screen.getByText('$1.800,00')).toBeInTheDocument();
  });

  test('filters expenses by timeframe today, 1 week, 1 month, and all', async () => {
    expenseService.getExpenses.mockResolvedValueOnce(mockExpenses);
    
    render(<ExpenseList />);
    
    await waitFor(() => {
      expect(screen.getByText('Boleta de Luz')).toBeInTheDocument();
    });

    // Filtro Hoy: Solo debe mostrar el gasto de servicios
    const filterTodayButton = screen.getByRole('button', { name: /Hoy/i });
    userEvent.click(filterTodayButton);

    await waitFor(() => {
      expect(screen.getByText('Boleta de Luz')).toBeInTheDocument();
      expect(screen.queryByText('Mercadería')).not.toBeInTheDocument();
      expect(screen.queryByText('Alquiler Local')).not.toBeInTheDocument();
      expect(screen.getByText('$150,00')).toBeInTheDocument();
    });

    // Filtro 1 Semana: Debe mostrar el gasto de servicios y proveedores
    const filterWeekButton = screen.getByRole('button', { name: /1 Semana/i });
    userEvent.click(filterWeekButton);

    await waitFor(() => {
      expect(screen.getByText('Boleta de Luz')).toBeInTheDocument();
      expect(screen.getByText('Mercadería')).toBeInTheDocument();
      expect(screen.queryByText('Alquiler Local')).not.toBeInTheDocument();
      // Sumatoria filtrada: $150 + $450 = $600
      expect(screen.getByText('$600,00')).toBeInTheDocument();
    });

    // Filtro Por Mes: Debe mostrar todos en este caso
    const filterMonthButton = screen.getByRole('button', { name: /Por Mes/i });
    userEvent.click(filterMonthButton);

    await waitFor(() => {
      expect(screen.getByText('Boleta de Luz')).toBeInTheDocument();
      expect(screen.getByText('Mercadería')).toBeInTheDocument();
      expect(screen.getByText('Alquiler Local')).toBeInTheDocument();
      expect(screen.getByText('$1.800,00')).toBeInTheDocument();
    });
  });

  test('can create a new operational expense', async () => {
    expenseService.getExpenses.mockResolvedValue(mockExpenses);
    expenseService.createExpense.mockResolvedValueOnce({
      id: 4,
      amount: 250.00,
      category: 'Varios',
      description: 'Lápices y hojas',
      date: new Date().toISOString()
    });

    render(<ExpenseList />);

    await waitFor(() => {
      expect(screen.getByText('Registrar Gasto')).toBeInTheDocument();
    });

    // Completar el formulario de alta de egreso
    const amountInput = screen.getByPlaceholderText('0.00');
    const descTextarea = screen.getByPlaceholderText(/Ej. Pago de boleta de luz/i);
    const submitButton = screen.getByRole('button', { name: /Registrar Gasto/i });

    fireEvent.change(amountInput, { target: { value: '250.00' } });
    fireEvent.change(descTextarea, { target: { value: 'Lápices y hojas' } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(expenseService.createExpense).toHaveBeenCalledWith({
        amount: 250,
        category: 'Varios',
        description: 'Lápices y hojas'
      });
    });
  });
});
