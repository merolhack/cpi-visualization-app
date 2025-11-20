import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Navbar from '../Navbar';

// Mock usePathname
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

// Mock Supabase
vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(() => ({
    auth: {
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      signOut: vi.fn(),
    },
  })),
}));

describe('Navbar', () => {
  it('renders the logo/title', () => {
    render(<Navbar />);
    expect(screen.getByText(/IRPC/i)).toBeInTheDocument();
  });

  it('renders navigation links', async () => {
    render(<Navbar />);
    await waitFor(() => {
      expect(screen.getByText(/Índice Real de Precios/i)).toBeInTheDocument();
    });
  });
});
