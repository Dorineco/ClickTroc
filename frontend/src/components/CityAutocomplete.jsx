import { useState, useEffect, useRef } from 'react';

const CityAutocomplete = ({ value, onChange, placeholder = 'ville' }) => {
    const [query, setQuery] = useState(value || '');
    const [suggestions, setSuggestions] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const debounceRef = useRef(null);

    useEffect(() => {
        setQuery(value || '');
    }, [value]);

    const fetchSuggestions = async (search) => {
    if (search.length < 3) {
        setSuggestions([]);
        setOpen(false);
        return;
    }

    setLoading(true);
    try {
        const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(search)}&type=municipality&limit=5`;
        console.log('Fetching:', url);
        const response = await fetch(url);
        const text = await response.text();
        console.log('Raw response:', text);
        const data = JSON.parse(text);
        console.log('Parsed data:', data);

        const cities = (data.features || []).map(f => ({
            name: f.properties.city || f.properties.name,
            postcode: f.properties.postcode,
            lat: f.geometry.coordinates[1],
            lon: f.geometry.coordinates[0],
            display: `${f.properties.city || f.properties.name} ${f.properties.postcode}`,
        }));

        setSuggestions(cities);
        setOpen(cities.length > 0);
    } catch (err) {
        console.error('Erreur API adresse:', err);
    } finally {
        setLoading(false);
    }
};

    const handleChange = (e) => {
        const val = e.target.value;
        setQuery(val);
        onChange({ name: val, postcode: '', lat: null, lon: null });

        // Debounce 400ms
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            fetchSuggestions(val);
        }, 200);
    };

    const handleSelect = (city) => {
        setQuery(city.display);
        setSuggestions([]);
        setOpen(false);
        onChange(city);
    };

    return (
        <div className="relative w-full">
            <input
                type="text"
                value={query}
                onChange={handleChange}
                placeholder={placeholder}
                className="w-full border border-gray-200 rounded-full px-5 py-3 text-sm bg-white focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 text-gray-500 placeholder-gray-500"
            />
            {loading && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 text-xs">...</span>
            )}
            {open && suggestions.length > 0 && (
                <div className="absolute top-12 left-0 w-full bg-white rounded-2xl shadow-lg border border-gray-100 py-2 z-20 max-h-48 overflow-y-auto">
                    {suggestions.map((city, i) => (
                        <div
                            key={i}
                            onClick={() => handleSelect(city)}
                            className="px-5 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                        >
                            <span className="font-medium">{city.name}</span>
                            {city.postcode && <span className="text-gray-400 ml-2">{city.postcode}</span>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CityAutocomplete;
