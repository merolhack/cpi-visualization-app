import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AyudaPage from '../page';

// Mock Navbar
vi.mock('@/app/_components/Navbar', () => ({
  default: () => <div data-testid="navbar">Navbar</div>,
}));

describe('AyudaPage', () => {
  it('renders the page title', () => {
    render(<AyudaPage />);
    expect(screen.getByText('Cómo Puedes Ayudar')).toBeInTheDocument();
  });

  it('renders the Navbar', () => {
    render(<AyudaPage />);
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
  });

  it('renders volunteer section', () => {
    render(<AyudaPage />);
    expect(screen.getByText('Conviértete en Voluntario')).toBeInTheDocument();
  });

  it('renders donation section', () => {
    render(<AyudaPage />);
    expect(screen.getByText('Apoya con una Donación')).toBeInTheDocument();
  });

  it('renders other ways to contribute section', () => {
    render(<AyudaPage />);
    expect(screen.getByText('Otras Formas de Contribuir')).toBeInTheDocument();
  });

  it('renders FAQ section', () => {
    render(<AyudaPage />);
    expect(screen.getByText('Preguntas Frecuentes')).toBeInTheDocument();
  });
});
