// file: src/app/_components/CountrySelector.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';

type Country = {
  country_id: number;
  country_name: string;
};

interface CountrySelectorProps {
  countries: Country[];
  selectedCountryId: string;
}

export default function CountrySelector({ countries, selectedCountryId }: CountrySelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleCountryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newCountryId = event.target.value;
    const currentParams = new URLSearchParams(searchParams.toString());
    currentParams.set('countryId', newCountryId);
    router.push(`/?${currentParams.toString()}`);
  };

  return (
    <div className="mb-4">
      <label htmlFor="country-select" className="mr-2 font-medium text-gray-700">
        Ver información de:
      </label>
      <select
        id="country-select"
        value={selectedCountryId}
        onChange={handleCountryChange}
        className="p-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
      >
        {countries.map((country) => (
          <option key={country.country_id} value={country.country_id}>
            {country.country_name}
          </option>
        ))}
      </select>
    </div>
  );
}