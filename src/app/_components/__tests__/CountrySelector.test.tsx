import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CountrySelector from '../CountrySelector';

// Mock Next.js navigation
const mockPush = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams,
}));

describe('CountrySelector', () => {
  const mockCountries = [
    { country_id: 1, country_name: 'México' },
    { country_id: 2, country_name: 'Argentina' },
    { country_id: 3, country_name: 'Colombia' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.delete('countryId');
  });

  it('renders loading state when no countries provided', () => {
    render(<CountrySelector />);
    expect(screen.getByText(/cargando países/i)).toBeInTheDocument();
  });

  it('renders loading state when empty countries array', () => {
    render(<CountrySelector countries={[]} />);
    expect(screen.getByText(/cargando países/i)).toBeInTheDocument();
  });

  it('renders select with countries', () => {
    render(<CountrySelector countries={mockCountries} selectedCountryId="1" />);
    
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(3);
    expect(options[0]).toHaveTextContent('México');
    expect(options[1]).toHaveTextContent('Argentina');
    expect(options[2]).toHaveTextContent('Colombia');
  });

  it('displays correct selected country', () => {
    render(<CountrySelector countries={mockCountries} selectedCountryId="2" />);
    
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('2');
  });

  it('renders label text', () => {
    render(<CountrySelector countries={mockCountries} selectedCountryId="1" />);
    expect(screen.getByText(/ver información de:/i)).toBeInTheDocument();
  });

  it('calls router.push with correct params when country changes', () => {
    render(<CountrySelector countries={mockCountries} selectedCountryId="1" />);
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '3' } });
    
    expect(mockPush).toHaveBeenCalledWith('/?countryId=3');
  });

  it('preserves existing search params when changing country', () => {
    mockSearchParams.set('someParam', 'value');
    
    render(<CountrySelector countries={mockCountries} selectedCountryId="1" />);
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '2' } });
    
    expect(mockPush).toHaveBeenCalledWith('/?someParam=value&countryId=2');
  });

  it('has accessible label', () => {
    render(<CountrySelector countries={mockCountries} selectedCountryId="1" />);
    
    const select = screen.getByRole('combobox');
    const label = screen.getByLabelText(/ver información de:/i);
    
    expect(label).toBe(select);
  });

  it('applies correct CSS classes', () => {
    render(<CountrySelector countries={mockCountries} selectedCountryId="1" />);
    
    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('p-2', 'border', 'rounded-md');
  });
});
