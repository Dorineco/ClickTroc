import { Link } from 'react-router-dom';

const AdCard = ({ ad }) => {
    const imageUrl = ad.image ? `http://localhost:3000${ad.image}` : null;

    return (
        <Link
            to={`/ads/${ad.id}`}
            className="block rounded-xl overflow-hidden bg-white hover:shadow-md transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
            aria-label={`${ad.title} — ${Number(ad.price).toLocaleString('fr-FR')} € — ${ad.city}`}
        >
            {/* Image */}
            <div className="aspect-square bg-gray-100 overflow-hidden">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt=""
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200" aria-hidden="true">
                        <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}
            </div>

            {/* Infos */}
            <div className="p-3">
                {/* Prix */}
                <p className="text-xl font-semibold text-gray-900" aria-hidden="true">
                    {Number(ad.price).toLocaleString('fr-FR')} €
                </p>

                {/* Titre */}
                <p className="text-xl text-gray-800 line-clamp-2" aria-hidden="true">
                    {ad.title}
                </p>

                {/* Ville */}
                <p className="text-xl text-gray-800 mt-1" aria-hidden="true">
                    {ad.town_name}
                </p>
            </div>
        </Link>
    );
};

export default AdCard;
