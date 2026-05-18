import { useState, useEffect, useRef } from 'react';

const DEBOUNCE_MS = 350;

const CityAutocomplete = ({ value, onChange, placeholder = 'ville' }) => {
    const [query, setQuery] = useState(value || '');
    const [suggestions, setSuggestions] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const debounceRef = useRef(null);

    useEffect(() => {
        setQuery(value || '');
    }, [value]);

    // Nettoyage du timeout si le composant est démonté
    useEffect(() => {
        return () => clearTimeout(debounceRef.current);
    }, []);

    const fetchSuggestions = async (search) => {
        if (search.length < 3) {
            setSuggestions([]);
            setOpen(false);
            return;
        }

        setLoading(true);
        try {
            const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(search)}&type=municipality&limit=5`;
            const response = await fetch(url);
            const data = await response.json();

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

        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            fetchSuggestions(val);
        }, DEBOUNCE_MS);
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
                className="w-full border px-5 py-2 border-gray-500 rounded-full text-xl bg-white focus:border-gray-700 focus:ring-2 focus:outline-none focus:ring-gray-500 placeholder-gray-500"
            />
            {loading && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-700 text-xs">...</span>
            )}
            {open && suggestions.length > 0 && (
                <div className="absolute top-12 left-0 w-full bg-white rounded-2xl shadow-lg border border-gray-100 py-2 z-20 max-h-48 overflow-y-auto">
                    {suggestions.map((city, i) => (
                        <div
                            key={i}
                            onClick={() => handleSelect(city)}
                            className="px-5 py-2 text-xl text-gray-700 hover:bg-gray-50 cursor-pointer"
                        >
                            <span className="font-medium">{city.name}</span>
                            {city.postcode && <span className="text-gray-700 ml-2">{city.postcode}</span>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CityAutocomplete;
