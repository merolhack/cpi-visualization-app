import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LogoutButton from '../LogoutButton';

// Mock Next.js navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock Supabase client
const mockSignOut = vi.fn();
vi.mock('@/app/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signOut: mockSignOut,
    },
  }),
}));

// Mock window.location
delete (window as any).location;
window.location = { href: '' } as any;

describe('LogoutButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.location.href = '';
  });

  it('renders logout button with correct text', () => {
    render(<LogoutButton />);
    expect(screen.getByRole('button', { name: /cerrar sesión/i })).toBeInTheDocument();
  });

  it('shows loading state when clicked', async () => {
    mockSignOut.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(<LogoutButton />);
    const button = screen.getByRole('button', { name: /cerrar sesión/i });
    
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/cerrando sesión/i)).toBeInTheDocument();
    });
  });

  it('calls signOut when clicked', async () => {
    mockSignOut.mockResolvedValue({ error: null });
    
    render(<LogoutButton />);
    const button = screen.getByRole('button', { name: /cerrar sesión/i });
    
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledTimes(1);
    });
  });

  it('redirects to login page after successful logout', async () => {
    mockSignOut.mockResolvedValue({ error: null });
    
    render(<LogoutButton />);
    const button = screen.getByRole('button', { name: /cerrar sesión/i });
    
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(window.location.href).toBe('/auth/login');
    });
  });

  it('handles logout error gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockSignOut.mockRejectedValue(new Error('Logout failed'));
    
    render(<LogoutButton />);
    const button = screen.getByRole('button', { name: /cerrar sesión/i });
    
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(screen.getByRole('button', { name: /cerrar sesión/i })).toBeInTheDocument();
    });
    
    consoleErrorSpy.mockRestore();
  });

  it('disables button while loading', async () => {
    mockSignOut.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(<LogoutButton />);
    const button = screen.getByRole('button', { name: /cerrar sesión/i });
    
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(button).toBeDisabled();
    });
  });
});
