import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginScreen from '../components/LoginScreen';
import apiClient from '../api/client';

jest.mock('../api/client');

describe('LoginScreen Component', () => {
  test('debe renderizar los campos de usuario y contraseña', () => {
    render(<LoginScreen onLogin={() => {}} />);
    
    expect(screen.getByLabelText(/Usuario/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ACCEDER AL PANEL/i })).toBeInTheDocument();
  });

  test('debe mostrar error con credenciales incorrectas', async () => {
    apiClient.post.mockRejectedValue({ response: { status: 401 } });

    render(<LoginScreen onLogin={() => {}} />);
    
    const userInput = screen.getByLabelText(/Usuario/i);
    const passInput = screen.getByLabelText(/Contraseña/i);
    const submitBtn = screen.getByRole('button', { name: /ACCEDER AL PANEL/i });

    fireEvent.change(userInput, { target: { value: 'wrong' } });
    fireEvent.change(passInput, { target: { value: '123' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Credenciales incorrectas/i)).toBeInTheDocument();
    });
  });

  test('debe llamar a onLogin con credenciales correctas', async () => {
    apiClient.post.mockResolvedValue({ data: { access: 'token123', refresh: 'refresh123' } });
    const mockOnLogin = jest.fn();

    render(<LoginScreen onLogin={mockOnLogin} />);
    
    const userInput = screen.getByLabelText(/Usuario/i);
    const passInput = screen.getByLabelText(/Contraseña/i);
    const submitBtn = screen.getByRole('button', { name: /ACCEDER AL PANEL/i });

    fireEvent.change(userInput, { target: { value: 'admin' } });
    fireEvent.change(passInput, { target: { value: '1234' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalledTimes(1);
    });
  });
});
