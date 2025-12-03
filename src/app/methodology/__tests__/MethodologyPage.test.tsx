import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MetodologiaPage from '../page';

// Mock Navbar
vi.mock('@/app/_components/Navbar', () => ({
  default: () => <div data-testid="navbar">Navbar</div>,
}));

describe('MetodologiaPage', () => {
  it('renders the page title', () => {
    render(<MetodologiaPage />);
    expect(screen.getByText('Metodología del IRPC')).toBeInTheDocument();
  });

  it('renders the Navbar', () => {
    render(<MetodologiaPage />);
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
  });

  it('renders introduction section', () => {
    render(<MetodologiaPage />);
    expect(screen.getByText('¿Qué es el IRPC?')).toBeInTheDocument();
  });

  it('renders data collection section', () => {
    render(<MetodologiaPage />);
    expect(screen.getByText('1. Recopilación de Datos')).toBeInTheDocument();
  });

  it('renders calculation section', () => {
    render(<MetodologiaPage />);
    expect(screen.getByText('2. Cálculo de la Inflación Anualizada')).toBeInTheDocument();
  });

  it('renders evaluation criteria section', () => {
    render(<MetodologiaPage />);
    expect(screen.getByText('3. Criterios de Evaluación')).toBeInTheDocument();
  });

  it('renders transparency section', () => {
    render(<MetodologiaPage />);
    expect(screen.getByText('4. Transparencia y Validación')).toBeInTheDocument();
  });

  it('renders limitations section', () => {
    render(<MetodologiaPage />);
    expect(screen.getByText('5. Limitaciones')).toBeInTheDocument();
  });
});
