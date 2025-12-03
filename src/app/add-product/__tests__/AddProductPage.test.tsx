import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AgregarProductoPage from '../page';
import { redirect } from 'next/navigation';

// Mock Navbar
vi.mock('@/app/_components/Navbar', () => ({
  default: () => <div data-testid="navbar">Navbar</div>,
}));

// Mock AddProductForm
vi.mock('@/app/_components/AddProductForm', () => ({
  default: () => <div data-testid="add-product-form">Add Product Form</div>,
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

// Mock Supabase client
const mockGetUser = vi.fn();
const mockFrom = vi.fn();

vi.mock('@/app/lib/supabase/server', () => ({
  createClient: () => ({
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
  }),
}));

describe('AgregarProductoPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to login if user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    try {
      await AgregarProductoPage();
    } catch (e) {
      // Ignore redirect error
    }

    expect(redirect).toHaveBeenCalledWith('/auth/login?next=/add-product');
  });

  it('renders the page content if user is authenticated', async () => {
    mockGetUser.mockResolvedValue({ 
      data: { user: { id: 'user-123' } }, 
      error: null 
    });

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ 
            data: { name: 'Test Volunteer', email: 'test@example.com' } 
          }),
        }),
      }),
    });

    const jsx = await AgregarProductoPage();
    render(jsx);

    expect(screen.getByText('Agregar Nuevo Producto')).toBeInTheDocument();
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('add-product-form')).toBeInTheDocument();
    expect(screen.getByText('Test Volunteer')).toBeInTheDocument();
  });

  it('renders without volunteer name if volunteer data fetch fails', async () => {
    mockGetUser.mockResolvedValue({ 
      data: { user: { id: 'user-123' } }, 
      error: null 
    });

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ 
            data: null 
          }),
        }),
      }),
    });

    const jsx = await AgregarProductoPage();
    render(jsx);

    expect(screen.getByText('Agregar Nuevo Producto')).toBeInTheDocument();
    expect(screen.queryByText('Conectado como:')).not.toBeInTheDocument();
  });
});
