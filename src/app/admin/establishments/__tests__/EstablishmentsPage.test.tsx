import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminEstablishmentsPage from '../page';

// Mock EstablishmentListClient
vi.mock('../EstablishmentListClient', () => ({
  default: () => <div data-testid="establishment-list-client">Establishment List Client</div>,
}));

// Mock Supabase client
const mockRpc = vi.fn();

vi.mock('@/app/lib/supabase/server', () => ({
  createClient: () => ({
    rpc: mockRpc,
  }),
}));

describe('AdminEstablishmentsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders establishments page with title and client component', async () => {
    mockRpc.mockResolvedValue({ 
      data: [{ id: 1, name: 'Store 1' }], 
      error: null 
    });

    const jsx = await AdminEstablishmentsPage();
    render(jsx);

    expect(screen.getByText('Comercios')).toBeInTheDocument();
    expect(screen.getByTestId('establishment-list-client')).toBeInTheDocument();
  });
});
