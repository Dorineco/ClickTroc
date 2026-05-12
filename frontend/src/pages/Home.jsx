import { useState, useEffect } from 'react';
import { getAds, getCategories, searchAds, getTowns } from '../services/api';
import AdCard from '../components/AdCard';
import CityAutocomplete from '../components/CityAutocomplete';
import Fuse from 'fuse.js';

const Home = ({ onLoginClick }) => {
    const [ads, setAds] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categoryOpen, setCategoryOpen] = useState(false);
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

    useEffect(() => {
        Promise.all([searchAds({ page: 1, limit: 12 }), getCategories(), getTowns()])
            .then(([adsData, catsData, townsData]) => {
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

            // Coordonnées GPS ou nom de ville
            if (searchCity?.lat && searchCity?.lon) {
                params.searchLat = String(searchCity.lat);
                params.searchLng = String(searchCity.lon);
                if (distance) params.distance = distance;
            } else if (search.town_name) {
                params.town_name = search.town_name;
            }

            const data = await searchAds(params);

            if (data.ads.length === 0 && search.q) {
                // Recherche approximative avec Fuse.js
                const allData = await searchAds({ page: 1, limit: 9999 });
                const fuse = new Fuse(allData.ads, {
                    keys: ['title', 'description'],
                    threshold: 0.4,
                });
                const fuzzyResults = fuse.search(search.q).map(r => r.item);
                setAds(fuzzyResults);
                setTotalPages(1);
            } else {
                setAds(data.ads);
                setTotalPages(Math.ceil(data.total / 12));
            }
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

                    {/* Catégorie — select custom */}
                    <div className="relative flex-1">
                        <button
                            type="button"
                            onClick={() => { setCategoryOpen(!categoryOpen); }}
                            className="w-full border border-gray-200 rounded-full px-5 py-3 text-sm bg-white text-gray-500 text-left flex items-center justify-between focus:border-gray-700 focus:ring-2 focus:ring-gray-200 placeholder-gray-500"
                        >
                            {search.category_id
                                ? categories.find(c => c.id === Number(search.category_id))?.name
                                : 'choisir une rubrique'}
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {categoryOpen && (
                            <div className="absolute top-12 left-0 w-full bg-white rounded-2xl shadow-lg border border-gray-100 py-2 z-10 max-h-48 overflow-y-auto">
                                <div
                                    onClick={() => { setSearch({ ...search, category_id: '' }); setCategoryOpen(false); }}
                                    className="px-5 py-2 text-sm text-gray-500 hover:bg-gray-50 cursor-pointer"
                                >
                                    Toutes les rubriques
                                </div>
                                {categories.map((cat) => (
                                    <div
                                        key={cat.id}
                                        onClick={() => { setSearch({ ...search, category_id: cat.id }); setCategoryOpen(false); }}
                                        className="px-5 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer rounded-xl mx-2"
                                    >
                                        {cat.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Recherche texte */}
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Mots-clés"
                            value={search.q}
                            onChange={(e) => setSearch({ ...search, q: e.target.value })}
                            className="w-full border border-gray-200 rounded-full px-5 py-3 text-sm bg-white focus:border-gray-700 focus:ring-2 focus:ring-gray-200 placeholder-gray-500"
                        />
                    </div>

                    {/* Ville — champ texte avec autocomplete + code postal */}

                    <div className="flex-1">
                        <CityAutocomplete
                            value={search.town_name}
                            onChange={(city) => {
                                setSearch({ ...search, town_name: city.name, postal_code: city.postcode });
                                setSearchCity(city);
                            }}
                            placeholder="dans toute la France"
                            className="w-full border border-gray-200 rounded-full px-5 py-3 text-sm bg-white focus:border-gray-700 focus:ring-2 focus:ring-gray-200 placeholder-gray-500"
                            
                        />
                    </div>



                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        // className="border border-gray-200 rounded-full px-4 py-3 text-sm bg-white focus:outline-none text-gray-500"
                        className="border border-gray-200 rounded-full px-4 py-3 text-sm bg-white focus:outline-none text-gray-500  focus:border-gray-700 focus:ring-2 focus:ring-gray-200 placeholder-gray-500"
                    >
                        <option value="recent">Trier par</option>
                        <option value="recent">Plus récentes</option>
                        <option value="price_asc">Prix croissant</option>
                        <option value="price_desc">Prix décroissant</option>
                    </select>

                    {/* Bouton de recherche */}
                    <button type="submit" className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-3 rounded-full transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>


                </form >



                {/* Slider de distance */}

                {search.town_name && (
                    <div className="max-w-4xl mx-auto px-4 mt-2 flex items-center gap-3">
                        <span className="text-sm text-gray-500">📍 Dans un rayon de</span>
                        <input
                            type="range"
                            min="5"
                            max="100"
                            step="5"
                            value={distance}
                            onChange={(e) => setDistance(Number(e.target.value))}
                            className="flex-1"
                        />
                        <span className="text-sm font-medium text-gray-600 min-w-[50px]">
                            {distance} km
                        </span>
                        <button
                            type="button"
                            onClick={() => handleSearch(null)}
                            className="text-sm bg-gray-600 text-white px-4 py-2 rounded-full hover:bg-gray-700"
                        >
                            Chercher
                        </button>
                    </div>
                )
                }

                {/* Filtre prix */}
                <div className="max-w-4xl mx-auto px-4 mt-2 flex items-center gap-3">
                    <span className="text-sm text-gray-500"> Prix :</span>
                    <input
                        type="number"
                        placeholder="Min €"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                        min="0"
                        className="w-28 border border-gray-200 rounded-full px-4 py-2 text-sm focus:border-gray-700 focus:ring-2 focus:ring-gray-200 placeholder-gray-500"
                    />
                    <span className="text-sm text-gray-400">—</span>
                    <input
                        type="number"
                        placeholder="Max €"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                        min="0"
                        className="w-28 border border-gray-200 rounded-full px-4 py-2 text-sm focus:border-gray-700 focus:ring-2 focus:ring-gray-200 placeholder-gray-500"
                    />
                </div>


            </div >




            {/* Hero image */}
            < div className="w-full h-72 overflow-hidden rounded-xl" >
                <img
                    src="/hero.jpg"
                    alt="Click&Troc"
                    className="w-full h-full object-cover object-bottom"
                />
            </div >



            {/* Annonces récentes */}
            < div className="max-w-6xl mx-auto px-4 py-8 flex-1" >
                <h2 className="text-xl italic text-gray-600 mb-6">
                    {isSearching
                        ? `${ads.length} résultat${ads.length > 1 ? 's' : ''} trouvé${ads.length > 1 ? 's' : ''}`
                        : 'Petites annonces récentes'}
                </h2>

                {
                    isSearching && (
                        <button
                            onClick={loadAllAds}
                            className="text-sm text-gray-400 hover:text-gray-600 mb-4 flex items-center gap-1"
                        >
                            Voir toutes les annonces
                        </button>
                    )
                }

                {
                    loading ? (
                        <div className="text-center text-gray-400 py-12">Chargement...</div>
                    ) : ads.length === 0 ? (
                        <div className="text-center text-gray-400 py-12">Aucune annonce trouvée.</div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {ads.map((ad) => (
                                <AdCard key={ad.id} ad={ad} />
                            ))}
                        </div>
                    )
                }
            </div >

            {/* pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 rounded-full border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-30"
                    >
                        ←
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                        <button
                            key={p}
                            onClick={() => setCurrentPage(p)}
                            className={`w-9 h-9 rounded-full text-sm ${currentPage === p ? 'bg-gray-600 text-white' : 'border border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                        >
                            {p}
                        </button>
                    ))}
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 rounded-full border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-30"
                    >
                        →
                    </button>
                </div>
            )}



        </div >

    );
};

export default Home;
