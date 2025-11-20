import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ResetPasswordPage from '../page';

// Mock Supabase client from auth-helpers
const mockResetPasswordForEmail = vi.fn();

vi.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: () => ({
    auth: {
      resetPasswordForEmail: mockResetPasswordForEmail,
    },
  }),
}));

describe('ResetPasswordPage', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock window.location.origin
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { origin: 'http://localhost:3000' },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
  });

  it('renders form correctly', async () => {
    render(<ResetPasswordPage />);
    
    expect(screen.getByText('Recuperar Contraseña')).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enviar enlace/i })).toBeInTheDocument();
  });

  it('calls resetPasswordForEmail on submit', async () => {
    mockResetPasswordForEmail.mockResolvedValue({ error: null });

    render(<ResetPasswordPage />);
    
    const emailInput = screen.getByLabelText(/correo electrónico/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    fireEvent.click(screen.getByRole('button', { name: /enviar enlace/i }));

    await waitFor(() => {
      expect(mockResetPasswordForEmail).toHaveBeenCalledWith('test@example.com', {
        redirectTo: 'http://localhost:3000/auth/update-password',
      });
    });
  });

  it('displays success message', async () => {
    mockResetPasswordForEmail.mockResolvedValue({ error: null });

    render(<ResetPasswordPage />);
    
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /enviar enlace/i }));

    await waitFor(() => {
      expect(screen.getByText('¡Correo enviado!')).toBeInTheDocument();
    });
  });

  it('displays error message on failure', async () => {
    mockResetPasswordForEmail.mockResolvedValue({ error: { message: 'Network error' } });

    render(<ResetPasswordPage />);
    
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /enviar enlace/i }));

    await waitFor(() => {
      expect(screen.getByText(/error al enviar el correo/i)).toBeInTheDocument();
    });
  });
});
