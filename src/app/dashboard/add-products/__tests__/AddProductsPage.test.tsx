import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AddProductsPage from '../page';
import { redirect } from 'next/navigation';

// Mock Navbar
vi.mock('@/app/_components/Navbar', () => ({
  default: () => <div data-testid="navbar">Navbar</div>,
}));

// Mock AddTrackingClient
vi.mock('../AddTrackingClient', () => ({
  default: () => <div data-testid="add-tracking-client">Add Tracking Client</div>,
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

// Mock Supabase client
const mockGetUser = vi.fn();

vi.mock('@/app/lib/supabase/server', () => ({
  createClient: () => ({
    auth: {
      getUser: mockGetUser,
    },
  }),
}));

describe('AddProductsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to login if user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    try {
      await AddProductsPage();
    } catch (e) {
      // Ignore redirect error
    }

    expect(redirect).toHaveBeenCalledWith('/auth/login?next=/dashboard/add-products');
  });

  it('renders page content if user is authenticated', async () => {
    mockGetUser.mockResolvedValue({ 
      data: { user: { id: 'user-123' } }, 
      error: null 
    });

    const jsx = await AddProductsPage();
    render(jsx);

    expect(screen.getByText('Agregar Productos')).toBeInTheDocument();
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('add-tracking-client')).toBeInTheDocument();
  });
});
