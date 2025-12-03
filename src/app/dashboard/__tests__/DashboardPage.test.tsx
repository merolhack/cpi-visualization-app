import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PanelVoluntarioPage from '../page';
import { redirect } from 'next/navigation';

// Mock Navbar
vi.mock('@/app/_components/Navbar', () => ({
  default: () => <div data-testid="navbar">Navbar</div>,
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

// Mock Supabase client
const mockGetUser = vi.fn();
const mockRpc = vi.fn();

vi.mock('@/app/lib/supabase/server', () => ({
  createClient: () => ({
    auth: {
      getUser: mockGetUser,
    },
    rpc: mockRpc,
  }),
}));

describe('PanelVoluntarioPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to login if user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    try {
      await PanelVoluntarioPage();
    } catch (e) {
      // Ignore redirect error
    }

    expect(redirect).toHaveBeenCalledWith('/auth/login?next=/dashboard');
  });

  it('renders dashboard with stats and products needing update', async () => {
    mockGetUser.mockResolvedValue({ 
      data: { 
        user: { 
          id: 'user-123',
          user_metadata: { full_name: 'Test User' }
        } 
      }, 
      error: null 
    });

    mockRpc.mockImplementation((rpcName) => {
      if (rpcName === 'get_volunteer_dashboard_stats') {
        return Promise.resolve({ 
          data: [{ current_points: 100, pending_updates_count: 5 }], 
          error: null 
        });
      }
      if (rpcName === 'get_products_needing_update_by_volunteer') {
        return Promise.resolve({ 
          data: [
            { 
              tracking_id: 1, 
              product_name: 'Product 1', 
              establishment_name: 'Store 1', 
              location_name: 'Loc 1', 
              days_since_update: 35 
            }
          ], 
          error: null 
        });
      }
      return Promise.resolve({ data: null, error: null });
    });

    const jsx = await PanelVoluntarioPage();
    render(jsx);

    expect(screen.getByText('Hola, Test User')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument(); // Points
    expect(screen.getByText('Productos que necesitan actualización')).toBeInTheDocument();
    expect(screen.getByText('Product 1')).toBeInTheDocument();
  });

  it('renders success message when all products are updated', async () => {
    mockGetUser.mockResolvedValue({ 
      data: { 
        user: { 
          id: 'user-123',
          user_metadata: { full_name: 'Test User' }
        } 
      }, 
      error: null 
    });

    mockRpc.mockImplementation((rpcName) => {
      if (rpcName === 'get_volunteer_dashboard_stats') {
        return Promise.resolve({ 
          data: [{ current_points: 100, pending_updates_count: 0 }], 
          error: null 
        });
      }
      if (rpcName === 'get_products_needing_update_by_volunteer') {
        return Promise.resolve({ 
          data: [], 
          error: null 
        });
      }
      return Promise.resolve({ data: null, error: null });
    });

    const jsx = await PanelVoluntarioPage();
    render(jsx);

    expect(screen.getByText('¡Felicidades!')).toBeInTheDocument();
    expect(screen.getByText('Todos los productos que decidiste llevar seguimiento están actualizados.')).toBeInTheDocument();
  });
});
