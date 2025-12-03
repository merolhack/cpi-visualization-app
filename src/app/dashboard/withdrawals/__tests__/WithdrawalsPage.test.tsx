import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RetirosPage from '../page';
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

describe('RetirosPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to login if user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    try {
      await RetirosPage();
    } catch (e) {
      // Ignore redirect error
    }

    expect(redirect).toHaveBeenCalledWith('/auth/login?next=/dashboard/withdrawals');
  });

  it('renders withdrawals page with balance and history', async () => {
    mockGetUser.mockResolvedValue({ 
      data: { user: { id: 'user-123' } }, 
      error: null 
    });

    // Mock balance fetch
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ 
                data: { current_balance: 500 }, 
                error: null 
              }),
            }),
          }),
        }),
      }),
    });

    // Mock history fetch
    mockRpc.mockResolvedValue({ 
      data: [
        { id: 1, created_at: '2023-01-01', amount_points: 100, status: 'pending' }
      ], 
      error: null 
    });

    const jsx = await RetirosPage();
    render(jsx);

    expect(screen.getByText('Retiros')).toBeInTheDocument();
    expect(screen.getByText('500')).toBeInTheDocument(); // Balance
    expect(screen.getAllByText('Solicitar Retiro')).toHaveLength(2); // Header and button
    expect(screen.getByText('100 pts')).toBeInTheDocument(); // History item
    expect(screen.getByText('Pendiente')).toBeInTheDocument(); // Status
  });
});
