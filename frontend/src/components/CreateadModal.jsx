import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories, getTowns } from '../services/api';

const CreateAdModal = ({ onClose }) => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [towns, setTowns] = useState([]);
    const [townOpen, setTownOpen] = useState(false);
    const [townSearch, setTownSearch] = useState('');
    const [previews, setPreviews] = useState(Array(6).fill(null));
    const [files, setFiles] = useState(Array(6).fill(null));
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const TypeRef = useRef(null);
    const [form, setForm] = useState({
        type: '',
        title: '',
        category_id: '',
        town_name: '',
        postal_code: '', // ← ajoute
        description: '',
        price: '',
    });

    const [location, setLocation] = useState(null);

    useEffect(() => {
        Promise.all([getCategories(), getTowns()])
            .then(([cats, ts]) => { setCategories(cats); setTowns(ts); })
            .catch(console.error);

        // Géolocalisation automatique
        if (navigator.geolocation) {
            console.log('Géolocalisation disponible');
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setLocation({
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude,
                    });
                },
                () => console.log('Géolocalisation refusée')
            );
        }
    }, []);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleEscape);

        return () => {
            window.removeEventListener('keydown', handleEscape);
        };
    }, [onClose]);


    useEffect(() => {
    if (!TypeRef.current) return;

    const timer = setTimeout(() => {
        TypeRef.current.focus();
    }, 100);

    return () => clearTimeout(timer);
}, []);


    

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handlePhoto = (index, e) => {
        const file = e.target.files[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        const newPreviews = [...previews];
        const newFiles = [...files];
        newPreviews[index] = url;
        newFiles[index] = file;
        setPreviews(newPreviews);
        setFiles(newFiles);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('title', form.title);
            formData.append('description', form.description);
            formData.append('price', form.price);
            formData.append('category_id', form.category_id);
            if (form.town_name) formData.append('town_name', form.town_name);
            if (form.postal_code) formData.append('postal_code', form.postal_code);
            files.filter(f => f !== null).forEach(file => {
                formData.append('images', file);
                if (location) {
                    formData.append('latitude', location.lat);
                    formData.append('longitude', location.lng);
                }
            });

            const response = await fetch('http://localhost:3000/ads', {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Erreur serveur');

            onClose();
            navigate(`/ads/${data.id}`);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 overflow-y-auto py-8"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative flex items-center justify-center p-6 border-b border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-700">Déposer une annonce</h2>
                    <button onClick={onClose} className="absolute right-6 text-gray-400 hover:text-gray-600">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    {/* Type */}
                    <select name="type" value={form.type} onChange={handleChange}
                        className="w-full border border-gray-200 rounded-full px-5 py-3 text-sm bg-gray-50 focus:ring-2 focus:ring-gray-400 focus:border-gray-400">

                        <option value="">type d'annonce</option>
                        <option value="vente">Vente</option>
                        <option value="don">Don</option>
                        <option value="location">Location</option>
                        <option value="service">Service</option>
                    </select>


                    {/* Titre */}
                    <input type="text" name="title" placeholder="titre de l'annonce"
                        value={form.title} onChange={handleChange} required
                        className="border border-gray-200 rounded-full px-5 py-3 text-sm bg-gray-50 focus:ring-2 focus:ring-gray-400 focus:border-gray-400" />

                    {/* Catégorie */}
                    <select name="category_id" value={form.category_id} onChange={handleChange} required
                        className="bborder border-gray-200 rounded-full px-5 py-3 text-sm bg-gray-50 focus:ring-2 focus:ring-gray-400 focus:border-gray-400">
                        <option value="">catégories de l'annonce</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>

                    {/* Ville — champ texte avec suggestions */}
                    <div className="relative">
                        <input
                            type="text"
                            name="town_name"
                            placeholder="ville de l'annonce"
                            value={form.town_name}
                            onChange={(e) => {
                                setForm({ ...form, town_name: e.target.value });
                                setTownOpen(e.target.value.length > 0);
                            }}
                            className="w-full border border-gray-200 rounded-full px-5 py-3 text-sm bg-gray-50 focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                        />
                        {townOpen && form.town_name.length > 0 &&
                            towns.filter(t => t.name.toLowerCase().includes(form.town_name.toLowerCase())).length > 0 && (
                                <div className="absolute top-12 left-0 w-full bg-white rounded-2xl shadow-lg border border-gray-100 py-2 z-10 max-h-40 overflow-y-auto">
                                    {towns
                                        .filter(t => t.name.toLowerCase().includes(form.town_name.toLowerCase()))
                                        .map((town) => (
                                            <div key={town.id}
                                                onClick={() => { setForm({ ...form, town_name: town.name }); setTownOpen(false); }}
                                                className="px-5 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer rounded-xl mx-2">
                                                {town.name}
                                            </div>
                                        ))
                                    }
                                </div>
                            )}


                    </div>

                    <input
                        type="text"
                        name="postal_code"
                        placeholder="code postal"
                        value={form.postal_code}
                        onChange={handleChange}
                        maxLength={5}
                        className="border-gray-200 rounded-full px-5 py-3 text-sm bg-gray-50 focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                    />

                    {/* Description */}
                    <textarea name="description" placeholder="description" value={form.description}
                        onChange={handleChange} rows={5}
                        className="border border-gray-200 rounded-2xl px-5 py-3 text-sm bg-gray-50 focus:outline-none resize-none" />

                    {/* Prix */}
                    <input type="number" name="price" placeholder="prix en €" value={form.price}
                        onChange={handleChange} min="0"
                        className="border border-gray-200 rounded-full px-5 py-3 text-sm bg-gray-50 focus:outline-none" />

                    {/* Photos */}
                    <div>
                        <p className="text-sm text-gray-500 mb-2">Ajouter des photos (6 max)</p>
                        <div className="grid grid-cols-3 gap-2">
                            {previews.map((preview, index) => (
                                <label key={index} className="cursor-pointer">
                                    <div className="aspect-square rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 hover:border-gray-400 transition-colors">
                                        {preview ? (
                                            <img src={preview} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        )}
                                    </div>
                                    <input type="file" accept="image/*" className="hidden"
                                        onChange={(e) => handlePhoto(index, e)} />
                                </label>
                            ))}
                        </div>
                    </div>

                    <button type="submit" disabled={loading}
                        className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 rounded-full transition-colors disabled:opacity-50 mt-2">
                        {loading ? 'Publication...' : "Déposer l'annonce"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateAdModal;
