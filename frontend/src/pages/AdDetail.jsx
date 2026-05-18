import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdCard from '../components/AdCard';
import { getAdById, getAds, getSellerReviews, addFavorite, createTransaction, deleteAd, getProfile } from '../services/api';
import EditAdModal from '../components/EditAdModal';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const StarRating = ({ rating }) => {
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}>
                    ★
                </span>
            ))}
        </div>
    );
};

const AdDetail = ({ onLoginClick }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [ad, setAd] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [similarAds, setSimilarAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [favorited, setFavorited] = useState(false);
    const [currentImage, setCurrentImage] = useState(0);
    const [showEditModal, setShowEditModal] = useState(false);

    const handleDelete = async () => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) return;
        try {
            await deleteAd(ad.id);
            navigate('/profile');
        } catch (err) {
            alert(err.message);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const adData = await getAdById(id);
                setAd(adData);
                setCurrentImage(0);

                const reviewsData = await getSellerReviews(adData.user_id);
                setReviews(reviewsData);

                const allAds = await getAds();
                setSimilarAds(allAds.filter((a) => a.id !== adData.id).slice(0, 4));

                //vérifier si l'annonce est en favoris
                if (user) {
                    const profile = await getProfile();
                    const isFav = profile.favorites.some(f => f.id === adData.id);
                    setFavorited(isFav);
                }

            } catch (err) {
                setError('Annonce introuvable.');

            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const averageRating = reviews.length > 0
        ? Math.round(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length)
        : 0;

    const handleContact = () => {
        if (!user) return onLoginClick();
        navigate(`/messages/${ad.user_id}`);
    };

    const handleBuy = async () => {
        if (!user) return onLoginClick();
        try {
            const result = await createTransaction({ ad_id: ad.id });
            navigate(`/payment/${result.transaction_id}`, {
                state: { clientSecret: result.client_secret, ad }
            });
        } catch (err) {
            alert(err.message);
        }
    };

    const handleFavorite = async () => {
        if (!user) return onLoginClick();
        try {
            await addFavorite(ad.id);
            setFavorited(true);
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="text-center py-20 text-gray-400">Chargement...</div>;
    if (error) return <div className="text-center py-20 text-red-400">{error}</div>;

    return (
        <div className="min-h-screen bg-gray-50">

            {showEditModal && (
                <EditAdModal
                    ad={ad}
                    onClose={() => setShowEditModal(false)}
                    onUpdated={(updated) => setAd({ ...ad, ...updated })}
                />
            )}

            <div className="max-w-6xl mx-auto px-4 py-8">

                {/* Bloc principal */}
                <div className="flex gap-6 mb-8">

                    {/* Image / Carousel */}
                    <div className="flex-1 rounded-2xl overflow-hidden bg-gray-100 max-h-96 relative">
                        {ad.images && ad.images.length > 0 ? (
                            <>
                                <img
                                    src={`http://localhost:3000${ad.images[currentImage]}`}
                                    alt={ad.title}
                                    className="w-full h-full object-cover"
                                />
                                {ad.images.length > 1 && (
                                    <>
                                        <button
                                            onClick={() => setCurrentImage((currentImage - 1 + ad.images.length) % ad.images.length)}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                                        >

                                        </button>
                                        <button
                                            onClick={() => setCurrentImage((currentImage + 1) % ad.images.length)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                                        >
                                            ›
                                        </button>
                                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                                            {ad.images.map((_, i) => (
                                                <div key={i} onClick={() => setCurrentImage(i)}
                                                    className={`w-2 h-2 rounded-full cursor-pointer transition-colors ${i === currentImage ? 'bg-white' : 'bg-white/50'}`}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </>
                        ) : (
                            <div className="w-full h-96 flex items-center justify-center bg-gray-200">
                                <svg className="w-20 h-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        )}
                    </div>

                    {/* Colonne droite */}
                    <div className="w-72 flex flex-col gap-4">
                        <div className="bg-gray-100 rounded-2xl p-6 flex flex-col gap-4">
                            <div>
                                <p className="font-semibold text-gray-700">
                                    {ad.firstname ? `${ad.firstname} ${ad.lastname}` : 'Vendeur'}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xl text-gray-500">avis</span>
                                    <StarRating rating={averageRating} />
                                </div>
                            </div>

                            {user && user.id === ad.user_id ? (
                                <>
                                    <button onClick={() => setShowEditModal(true)}
                                        className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 rounded-full transition-colors">
                                        Modifier l'annonce
                                    </button>
                                    <button onClick={handleDelete}
                                        className="w-full bg-red-400 hover:bg-red-500 text-white font-medium py-3 rounded-full transition-colors">
                                        Supprimer l'annonce
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button onClick={handleFavorite}
                                        className={`text-xl ${favorited ? 'text-red-500' : 'text-gray-400 hover:text-red-400'} transition-colors`}>
                                        {favorited ? '♥ Ajouté aux favoris' : '♡ Ajouter aux favoris'}
                                    </button>
                                    <button onClick={handleContact}
                                        className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 rounded-full transition-colors">
                                        Contacter
                                    </button>
                                    <button onClick={handleBuy}
                                        className="w-full bg-orange-400 hover:bg-orange-500 text-white font-medium py-3 rounded-full transition-colors">
                                        Réserver et payer
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="bg-gray-100 rounded-2xl p-6 mb-8">
                    <h2 className="font-bold text-gray-700 mb-3">{ad.title}</h2>
                    <p className="text-gray-600 text-xl leading-relaxed mb-4">
                        {ad.description || 'Aucune description.'}
                    </p>
                    <div className="flex gap-6 text-xl text-gray-600">
                        <p><span className="font-semibold">prix</span> — {Number(ad.price).toLocaleString('fr-FR')} €</p>
                        <p><span className="font-semibold">publiée le</span> — {new Date(ad.created_at).toLocaleDateString('fr-FR')}</p>
                        {ad.town_name && <p><span className="font-semibold">ville</span> — {ad.town_name}</p>}
                    </div>
                </div>

                {/* Carte Leaflet — uniquement si coordonnées disponibles */}
                {ad.latitude && ad.longitude && (
                    <div className="mb-8">
                        <h3 className="text-xl italic text-gray-600 mb-4">📍 Localisation</h3>
                        <div className="rounded-2xl overflow-hidden border border-gray-200" style={{ height: '300px' }}>
                            <MapContainer
                                center={[ad.latitude, ad.longitude]}
                                zoom={13}
                                style={{ height: '100%', width: '100%' }}
                                scrollWheelZoom={false}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; OpenStreetMap contributors'
                                />
                                <Marker position={[ad.latitude, ad.longitude]} />
                            </MapContainer>
                        </div>
                    </div>
                )}

                {/* Annonces similaires */}
                {similarAds.length > 0 && (
                    <div>
                        <h3 className="text-xl italic text-gray-600 mb-4">Petites annonces similaires</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {similarAds.map((a) => (
                                <AdCard key={a.id} ad={a} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            
        </div>
    );
};

export default AdDetail;
