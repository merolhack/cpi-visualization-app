import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import UpdatePricePage from '../page';
import { redirect } from 'next/navigation';

// Mock Navbar
vi.mock('@/app/_components/Navbar', () => ({
  default: () => <div data-testid="navbar">Navbar</div>,
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  revalidatePath: vi.fn(),
}));

// Mock Supabase client
const mockGetUser = vi.fn();
const mockFrom = vi.fn();
const mockRpc = vi.fn();

vi.mock('@/app/lib/supabase/server', () => ({
  createClient: () => ({
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
    rpc: mockRpc,
  }),
}));

describe('UpdatePricePage', () => {
  const mockParams = { trackingId: '123' };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to login if user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    try {
      await UpdatePricePage({ params: mockParams });
    } catch (e) {
      // Ignore redirect error
    }

    expect(redirect).toHaveBeenCalledWith('/auth/login?next=/dashboard');
  });

  it('renders update price form if tracking exists', async () => {
    mockGetUser.mockResolvedValue({ 
      data: { user: { id: 'user-123' } }, 
      error: null 
    });

    // Mock tracking data fetch
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ 
              data: {
                id: 123,
                product: { name: 'Test Product', image_url: 'http://example.com/img.jpg' },
                establishment: { name: 'Test Store' },
                location: { name: 'Test Location' }
              }, 
              error: null 
            }),
          }),
        }),
      }),
    });

    // Mock history fetch
    mockRpc.mockResolvedValue({ 
      data: [], 
      error: null 
    });

    const jsx = await UpdatePricePage({ params: mockParams });
    render(jsx);

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText(/Test Store/)).toBeInTheDocument();
    expect(screen.getByText('Actualizar Precio')).toBeInTheDocument();
    expect(screen.getByLabelText('Nuevo Precio ($)')).toBeInTheDocument();
  });

  it('renders error message if tracking does not exist', async () => {
    mockGetUser.mockResolvedValue({ 
      data: { user: { id: 'user-123' } }, 
      error: null 
    });

    // Mock tracking data fetch failure
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ 
              data: null, 
              error: { message: 'Not found' } 
            }),
          }),
        }),
      }),
    });

    const jsx = await UpdatePricePage({ params: mockParams });
    render(jsx);

    expect(screen.getByText('Producto no encontrado')).toBeInTheDocument();
  });
});
