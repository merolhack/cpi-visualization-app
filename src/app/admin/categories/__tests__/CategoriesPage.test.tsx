import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminCategoriesPage from '../page';

// Mock CategoryListClient
vi.mock('../CategoryListClient', () => ({
  default: () => <div data-testid="category-list-client">Category List Client</div>,
}));

// Mock Supabase client
const mockRpc = vi.fn();

vi.mock('@/app/lib/supabase/server', () => ({
  createClient: () => ({
    rpc: mockRpc,
  }),
}));

describe('AdminCategoriesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders categories page with title and client component', async () => {
    mockRpc.mockResolvedValue({ 
      data: [{ id: 1, name: 'Category 1' }], 
      error: null 
    });

    const jsx = await AdminCategoriesPage();
    render(jsx);

    expect(screen.getByText('Categorías')).toBeInTheDocument();
    expect(screen.getByTestId('category-list-client')).toBeInTheDocument();
  });
});
