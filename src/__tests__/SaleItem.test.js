import { render, screen, fireEvent } from '@testing-library/react';
import SaleItem from '../components/SaleItem';

const mockItem = {
  id: 1,
  name: 'Producto de Prueba',
  price: 150.50,
  quantity: 2
};

describe('SaleItem Component', () => {
  test('debe mostrar el nombre, precio unitario y subtotal correctamente', () => {
    render(<SaleItem item={mockItem} onRemove={() => {}} onUpdateQuantity={() => {}} />);
    
    expect(screen.getByText('Producto de Prueba')).toBeInTheDocument();
    expect(screen.getByText(/\$150\.50/)).toBeInTheDocument();
    expect(screen.getByText(/un\./)).toBeInTheDocument();
    expect(screen.getByText('$301.00')).toBeInTheDocument(); // 150.50 * 2
  });

  test('debe llamar a onUpdateQuantity al incrementar', () => {
    const mockUpdate = jest.fn();
    render(<SaleItem item={mockItem} onRemove={() => {}} onUpdateQuantity={mockUpdate} />);
    
    const plusBtn = screen.getByLabelText(/Aumentar cantidad/i);
    fireEvent.click(plusBtn);

    expect(mockUpdate).toHaveBeenCalledWith(1, 3);
  });

  test('debe llamar a onRemove al hacer clic en el botón eliminar', () => {
    const mockRemove = jest.fn();
    render(<SaleItem item={mockItem} onRemove={mockRemove} onUpdateQuantity={() => {}} />);
    
    // El botón eliminar tiene un SVG, podemos buscarlo por el contenedor o el botón
    const removeBtn = screen.getByLabelText(/Eliminar item/i);
    fireEvent.click(removeBtn);

    expect(mockRemove).toHaveBeenCalledWith(1);
  });
});
