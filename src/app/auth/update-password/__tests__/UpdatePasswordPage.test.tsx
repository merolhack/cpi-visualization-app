import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import UpdatePasswordPage from '../page';

// Mock Supabase client
const mockUpdateUser = vi.fn();

vi.mock('@/app/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      updateUser: mockUpdateUser,
    },
  }),
}));

// Mock Next.js navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('UpdatePasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form correctly', async () => {
    render(<UpdatePasswordPage />);
    
    expect(screen.getByRole('heading', { name: 'Actualizar Contraseña' })).toBeInTheDocument();
    expect(screen.getByLabelText(/nueva contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /actualizar contraseña/i })).toBeInTheDocument();
  });

  it('validates password length', async () => {
    const { container } = render(<UpdatePasswordPage />);
    
    const passwordInput = screen.getByLabelText(/nueva contraseña/i);
    fireEvent.change(passwordInput, { target: { value: '12345' } });
    
    const form = container.querySelector('form');
    if (form) {
      form.setAttribute('novalidate', 'true');
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(screen.getByText('La contraseña debe tener al menos 6 caracteres.')).toBeInTheDocument();
    });
  });

  it('calls updateUser on submit', async () => {
    mockUpdateUser.mockResolvedValue({ error: null });

    render(<UpdatePasswordPage />);
    
    const passwordInput = screen.getByLabelText(/nueva contraseña/i);
    fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
    
    fireEvent.click(screen.getByRole('button', { name: /actualizar contraseña/i }));

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({
        password: 'newpassword123',
      });
    });
  });

  it('redirects to login on success', async () => {
    mockUpdateUser.mockResolvedValue({ error: null });

    render(<UpdatePasswordPage />);
    
    const passwordInput = screen.getByLabelText(/nueva contraseña/i);
    fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
    
    fireEvent.click(screen.getByRole('button', { name: /actualizar contraseña/i }));

    await waitFor(() => {
      expect(screen.getByText('¡Contraseña actualizada!')).toBeInTheDocument();
    });

    // Check redirect after timeout
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/auth/login'));
    }, { timeout: 3500 });
  });

  it('displays error message on failure', async () => {
    mockUpdateUser.mockResolvedValue({ error: { message: 'Token expired' } });

    render(<UpdatePasswordPage />);
    
    const passwordInput = screen.getByLabelText(/nueva contraseña/i);
    fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
    
    fireEvent.click(screen.getByRole('button', { name: /actualizar contraseña/i }));

    await waitFor(() => {
      expect(screen.getByText(/error al actualizar la contraseña/i)).toBeInTheDocument();
    });
  });
});
