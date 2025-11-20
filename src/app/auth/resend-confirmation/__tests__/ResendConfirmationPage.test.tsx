import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ResendConfirmationPage from '../page';

// Mock Supabase client
const mockResend = vi.fn();

vi.mock('@/app/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      resend: mockResend,
    },
  }),
}));

describe('ResendConfirmationPage', () => {
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
    render(<ResendConfirmationPage />);
    
    expect(screen.getByText('Reenviar Confirmación')).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enviar enlace/i })).toBeInTheDocument();
  });

  it('calls resend on submit', async () => {
    mockResend.mockResolvedValue({ error: null });

    render(<ResendConfirmationPage />);
    
    const emailInput = screen.getByLabelText(/correo electrónico/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    fireEvent.click(screen.getByRole('button', { name: /enviar enlace/i }));

    await waitFor(() => {
      expect(mockResend).toHaveBeenCalledWith({
        type: 'signup',
        email: 'test@example.com',
        options: {
          emailRedirectTo: 'http://localhost:3000/auth/login',
        },
      });
    });
  });

  it('displays success message', async () => {
    mockResend.mockResolvedValue({ error: null });

    render(<ResendConfirmationPage />);
    
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /enviar enlace/i }));

    await waitFor(() => {
      expect(screen.getByText(/si el correo está registrado/i)).toBeInTheDocument();
    });
  });

  it('displays error message on failure', async () => {
    mockResend.mockResolvedValue({ error: { message: 'Network error' } });

    render(<ResendConfirmationPage />);
    
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /enviar enlace/i }));

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });
});
