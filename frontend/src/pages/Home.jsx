import { useState, useEffect } from 'react';
import { getAds, getCategories, searchAds, getTowns } from '../services/api';
import AdCard from '../components/AdCard';
import CityAutocomplete from '../components/CityAutocomplete';
import CategoryDropdown from '../components/CategoryDropdown';

const Home = ({ onLoginClick }) => {
    const [ads, setAds] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [distance, setDistance] = useState(20);
    const [searchCity, setSearchCity] = useState(null);
    const [sortBy, setSortBy] = useState('recent');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState({
        q: '',
        category_id: '',
        town_name: '',
        postal_code: '',
    });
    const [isSearching, setIsSearching] = useState(false);

    const searchBarStyle1 = "flex-[2] w-full border px-5 py-2 border-gray-500 rounded-full text-xl bg-white focus:border-gray-700 focus:ring-2 focus:outline-none focus:ring-gray-500 placeholder-gray-500";
    const PriceSortStyle = "w-28 border border-gray-500 rounded-full px-4 py-2 text-xl focus:border-gray-700 focus:ring-2 focus:ring-gray-200 placeholder-gray-500";

    useEffect(() => {
        Promise.all([searchAds({ page: 1, limit: 12 }), getCategories(), getTowns()])
            .then(([adsData, catsData]) => {
                setAds(adsData.ads);
                setTotalPages(Math.ceil(adsData.total / 12));
                setCategories(catsData);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        handleSearch(null);
    }, [currentPage]);

    const handleSearch = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        setIsSearching(true);

        try {
            const params = {};
            if (search.q) params.q = search.q;
            if (search.category_id) params.category_id = search.category_id;
            if (sortBy) params.sortBy = sortBy;
            if (priceRange.min) params.min_price = priceRange.min;
            if (priceRange.max) params.max_price = priceRange.max;
            params.page = currentPage;

            if (searchCity?.lat && searchCity?.lon) {
                params.searchLat = String(searchCity.lat);
                params.searchLng = String(searchCity.lon);
                if (distance) params.distance = distance;
            } else if (search.town_name) {
                params.town_name = search.town_name;
            }

            
            const data = await searchAds(params);
            setAds(data.ads);
            setTotalPages(Math.ceil(data.total / 12));

        } catch (err) {
            console.error(err);
        }
    };

    const loadAllAds = async () => {
        const data = await searchAds({ page: 1, limit: 12 });
        setAds(data.ads);
        setTotalPages(Math.ceil(data.total / 12));
        setCurrentPage(1);
        setIsSearching(false);
        setSearch({ q: '', category_id: '', town_name: '', postal_code: '' });
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">

            {/* Barre de recherche */}
            <div className="bg-gray-50 py-4">
                <form onSubmit={handleSearch} className="max-w-4xl mx-auto px-4 flex gap-3 items-center">

                    <div className="relative flex-1">
                        <CategoryDropdown
                            categories={categories}
                            value={search.category_id}
                            onChange={(id) => setSearch({ ...search, category_id: id })}
                        />
                    </div>

                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Mots-clés"
                            value={search.q}
                            onChange={(e) => setSearch({ ...search, q: e.target.value })}
                            className={searchBarStyle1}
                        />
                    </div>

                    <div className="flex-1">
                        <CityAutocomplete
                            value={search.town_name}
                            onChange={(city) => {
                                setSearch({ ...search, town_name: city.name, postal_code: city.postcode });
                                setSearchCity(city);
                            }}
                            placeholder="France"
                            className={searchBarStyle1}
                        />
                    </div>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className={searchBarStyle1}
                    >
                        <option value="recent">Trier par</option>
                        <option value="recent">Plus récentes</option>
                        <option value="price_asc">Prix croissant</option>
                        <option value="price_desc">Prix décroissant</option>
                    </select>

                    <button type="submit" className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-3 rounded-full transition-colors">
                        <svg className="w-8 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>
                </form>

                {/* Slider de distance */}
                {search.town_name && (
                    <div className="max-w-4xl mx-auto px-4 mt-2 flex items-center gap-3">
                        <span className="text-xl text-gray-500">📍 Dans un rayon de</span>
                        <input
                            type="range"
                            min="5"
                            max="100"
                            step="5"
                            value={distance}
                            onChange={(e) => setDistance(Number(e.target.value))}
                            className="flex-1"
                        />
                        <span className="text-xl font-medium text-gray-600 min-w-[50px]">
                            {distance} km
                        </span>
                        <button
                            type="button"
                            onClick={() => handleSearch(null)}
                            className="text-xl bg-gray-600 text-white px-4 py-2 rounded-full hover:bg-gray-700"
                        >
                            Chercher
                        </button>
                    </div>
                )}

                {/* Filtre prix */}
                <div className="max-w-4xl mx-auto px-4 mt-2 flex items-center gap-3">
                    <span className="text-xl text-gray-500">Prix :</span>
                    <input
                        type="number"
                        placeholder="Min €"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                        min="0"
                        className={PriceSortStyle}
                    />
                    <span className="text-xl text-gray-400">—</span>
                    <input
                        type="number"
                        placeholder="Max €"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                        min="0"
                        className={PriceSortStyle}
                    />
                </div>
            </div>

            {/* Hero image */}
            <div className="w-full h-72 overflow-hidden rounded-xl">
                <img
                    src="/hero.jpg"
                    alt="Click&Troc"
                    className="w-full h-full object-cover object-bottom"
                />
            </div>

            {/* Annonces */}
            <div className="max-w-6xl mx-auto px-4 py-8 flex-1">
                <h2 className="text-xl italic text-gray-600 mb-6">
                    {isSearching
                        ? `${ads.length} résultat${ads.length > 1 ? 's' : ''} trouvé${ads.length > 1 ? 's' : ''}`
                        : 'Petites annonces récentes'}
                </h2>

                {isSearching && (
                    <button
                        onClick={loadAllAds}
                        className="text-xl text-gray-400 hover:text-gray-600 mb-4 flex items-center gap-1"
                    >
                        Voir toutes les annonces
                    </button>
                )}

                {loading ? (
                    <div className="text-center text-gray-400 py-12">Chargement...</div>
                ) : ads.length === 0 ? (
                    <div className="text-center text-gray-400 py-12">Aucune annonce trouvée.</div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {ads.map((ad) => (
                            <AdCard key={ad.id} ad={ad} />
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 rounded-full border border-gray-200 text-xl text-gray-500 hover:bg-gray-50 disabled:opacity-30"
                    >
                        ←
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                        <button
                            key={p}
                            onClick={() => setCurrentPage(p)}
                            className={`w-9 h-9 rounded-full text-xl ${currentPage === p ? 'bg-gray-600 text-white' : 'border border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                        >
                            {p}
                        </button>
                    ))}

                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 rounded-full border border-gray-200 text-xl text-gray-500 hover:bg-gray-50 disabled:opacity-30"
                    >
                        →
                    </button>
                </div>
            )}

        </div>
    );
};

export default Home;
