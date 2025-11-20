import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AdminSidebar from '../AdminSidebar';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/admin',
}));

describe('AdminSidebar', () => {
  it('renders admin panel title', () => {
    render(<AdminSidebar />);
    expect(screen.getByText(/panel de administración/i)).toBeInTheDocument();
    expect(screen.getByText(/irpc webmaster/i)).toBeInTheDocument();
  });

  it('renders all navigation menu items', () => {
    render(<AdminSidebar />);
    
    expect(screen.getByText(/panel principal/i)).toBeInTheDocument();
    expect(screen.getByText(/voluntarios/i)).toBeInTheDocument();
    expect(screen.getByText(/productos/i)).toBeInTheDocument();
    expect(screen.getByText(/categorías/i)).toBeInTheDocument();
    expect(screen.getByText(/comercios/i)).toBeInTheDocument();
    expect(screen.getByText(/retiros/i)).toBeInTheDocument();
    expect(screen.getByText(/criterios/i)).toBeInTheDocument();
  });

  it('renders correct number of navigation links', () => {
    render(<AdminSidebar />);
    
    const links = screen.getAllByRole('link');
    // 7 menu items + 1 "Volver al sitio" link
    expect(links).toHaveLength(8);
  });

  it('renders return to site link', () => {
    render(<AdminSidebar />);
    expect(screen.getByText(/volver al sitio/i)).toBeInTheDocument();
  });

  it('has correct href for each menu item', () => {
    render(<AdminSidebar />);
    
    expect(screen.getByText(/panel principal/i).closest('a')).toHaveAttribute('href', '/admin');
    expect(screen.getByText(/voluntarios/i).closest('a')).toHaveAttribute('href', '/admin/volunteers');
    expect(screen.getByText(/productos/i).closest('a')).toHaveAttribute('href', '/admin/products');
    expect(screen.getByText(/categorías/i).closest('a')).toHaveAttribute('href', '/admin/categories');
    expect(screen.getByText(/comercios/i).closest('a')).toHaveAttribute('href', '/admin/establishments');
    expect(screen.getByText(/retiros/i).closest('a')).toHaveAttribute('href', '/admin/withdrawals');
    expect(screen.getByText(/criterios/i).closest('a')).toHaveAttribute('href', '/admin/criteria');
  });

  it('highlights active menu item', () => {
    render(<AdminSidebar />);
    
    const activeLink = screen.getByText(/panel principal/i).closest('a');
    expect(activeLink).toHaveClass('bg-blue-600');
  });

  it('applies correct styling to sidebar', () => {
    const { container } = render(<AdminSidebar />);
    
    const aside = container.querySelector('aside');
    expect(aside).toHaveClass('w-64', 'bg-gray-900', 'text-white', 'min-h-screen');
  });
});
