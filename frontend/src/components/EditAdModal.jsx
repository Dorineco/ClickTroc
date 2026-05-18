import { useState, useEffect, useRef } from 'react';
import { getCategories, updateAd, deleteAdImage, addAdImages } from '../services/api';

const EditAdModal = ({ ad, onClose, onUpdated }) => {
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState(ad.images || []);
    const [newFiles, setNewFiles] = useState([]);
    const [newPreviews, setNewPreviews] = useState([]);
    const titleRef = useRef(null);
    const [form, setForm] = useState({
        title: ad.title || '',
        category_id: ad.category_id || '',
        description: ad.description || '',
        price: ad.price || '',
    });
    const EditAdStyle = "appearance-none border border-gray-500 rounded-full px-5 py-3 text-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400";

    useEffect(() => {
        getCategories().then(setCategories).catch(console.error);
    }, []);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };

        window.addEventListener('keydown', handleEscape);
        return () => {
            window.removeEventListener('keydown', handleEscape);
        };
    }, [onClose]);

    useEffect(() => {
        titleRef.current?.focus();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleDeleteImage = async (image_url) => {
        try {
            await deleteAdImage(ad.id, image_url);
            setImages(images.filter(img => img !== image_url));
        } catch (err) {
            setError(err.message);
        }
    };

    const handleNewPhoto = (e) => {
        const files = Array.from(e.target.files);
        const previews = files.map(f => URL.createObjectURL(f));
        setNewFiles([...newFiles, ...files]);
        setNewPreviews([...newPreviews, ...previews]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            // Mettre à jour les infos
            const updated = await updateAd(ad.id, {
                title: form.title,
                description: form.description,
                price: Number(form.price),
                category_id: Number(form.category_id),
            });

            // Ajouter les nouvelles photos
            if (newFiles.length > 0) {
                await addAdImages(ad.id, newFiles);
            }

            onUpdated(updated);
            onClose();
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
                {/* Header */}
                <div className="relative flex items-center justify-center p-6 border-b border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-700">
                        Modifier l'annonce
                    </h2>
                    <button onClick={onClose} className="absolute right-6 text-gray-400 hover:text-gray-600">
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
                    {error && <p className="text-red-500 text-xl text-center">{error}</p>}

                    {/* Titre */}
                    <label htmlFor="title" className="sr-only">Titre de l'annonce</label>
                    <input id="tile" ref={titleRef} type="text" name="title" placeholder="titre de l'annonce"
                        value={form.title} onChange={handleChange} required
                        className={EditAdStyle} />

                    {/* Catégorie */}
                    <select name="category_id" value={form.category_id} onChange={handleChange} required aria-required="true"
                        className={EditAdStyle}>
                        <label htmlFor="category_id">Catégorie de l'annonce</label>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>

                    {/* Description */}
                    <div className="flex flex-col gap-1">
                        <label
                            htmlFor="description"
                            className="text-xl font-medium text-gray-700"
                        >
                            Description de l’annonce
                        </label>

                        <textarea
                            id="description"
                            name="description"
                            placeholder="Décrivez votre annonce"
                            value={form.description}
                            onChange={handleChange}
                            rows={5}
                            aria-describedby="description-help"
                            className="
                            border border-gray-300
                            rounded-2xl
                            px-5 py-3
                            text-xl
                        bg-gray-100
                        text-gray-700
                        focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus:border-gray-400"
                        />

                        <p
                            id="description-help"
                            className="text-xl text-gray-500"
                        >
                            Décrivez précisément l’état, les caractéristiques ou les détails utiles.
                        </p>
                    </div>

                    {/* Prix */}
                    <label htmlFor="price" className="sr-only">Prix de l'annonce</label>
                    <input id="price" type="number" name="price" placeholder="prix en €" value={form.price}
                        onChange={handleChange} min="0"
                        className={EditAdStyle} />

                    {/* Photos existantes */}
                    {images.length > 0 && (
                        <div>
                            <p className="text-xl text-gray-500 mb-2">Photos actuelles</p>

                            <div className="grid grid-cols-3 gap-2">
                                {images.map((img, i) => (
                                    <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200">
                                        <img
                                            src={`http://localhost:3000${img}`}
                                            alt={`Photo ${i + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteImage(img)}
                                            aria-label={`Supprimer la photo ${i + 1}`}
                                            className="
            absolute top-1 right-1
            w-8 h-8
            bg-red-500 hover:bg-red-600
            text-white rounded-full text-xl
            flex items-center justify-center
            opacity-0 group-hover:opacity-100 focus:opacity-100
            transition-opacity
            focus:outline-none focus-visible:ring-2
            focus-visible:ring-red-700 focus-visible:ring-offset-2
        "
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Ajouter de nouvelles photos */}
                    <div>
                        <p className="text-xl text-gray-500 mb-2">Ajouter des photos</p>
                        <div className="grid grid-cols-3 gap-2">
                            {newPreviews.map((preview, i) => (
                                <div key={i} className="aspect-square rounded-xl overflow-hidden border border-gray-200">
                                    <img src={preview} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                                </div>
                            ))}
                            <label
                                tabIndex="0"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        e.currentTarget.querySelector('input').click();
                                    }
                                }}
                                className="aspect-square rounded-xl bg-gray-100 border border-gray-200
                                hover:border-gray-400 flex items-center justify-center
                                cursor-pointer transition-colors
                                focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
                            >
                                <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                <input type="file" accept="image/*" multiple className="sr-only" onChange={handleNewPhoto} />
                            </label>
                        </div>
                    </div>

                    <button type="submit" disabled={loading}
                        className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 rounded-full transition-colors disabled:opacity-50 mt-2">
                        {loading ? 'Modification...' : 'Enregistrer les modifications'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditAdModal;
