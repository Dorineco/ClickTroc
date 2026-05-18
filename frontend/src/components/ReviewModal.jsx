import { useState, useEffect, useRef } from 'react';
import { addReview } from '../services/api';

const ratingLabels = {
    1: 'Très mauvais',
    2: 'Mauvais',
    3: 'Correct',
    4: 'Bien',
    5: 'Excellent !',
};

const ReviewModal = ({ transaction, onClose, onReviewed }) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const firstStarRef = useRef(null);

    // Focus sur la première étoile à l'ouverture
    useEffect(() => {
        const timer = setTimeout(() => {
            firstStarRef.current?.focus();
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    // Fermeture avec Escape
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            setError('Veuillez sélectionner une note.');
            return;
        }
        setError('');
        setLoading(true);
        try {
            await addReview({
                seller_id: transaction.seller_id,
                transaction_id: transaction.id,
                rating,
                comment,
            });
            onReviewed(transaction.id);
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
            onClick={onClose}
            
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="review-modal-title"
                aria-describedby="review-modal-description"
                className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl p-8"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative flex items-center justify-center mb-6">
                    <h2 id="review-modal-title" className="text-xl font-semibold text-gray-700">
                        Laisser un avis
                    </h2>
                    <button
                        onClick={onClose}
                        aria-label="Fermer la modale"
                        className="absolute right-0 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-700 rounded"
                    >
                        ✕
                    </button>
                </div>

                <p className="text-xl text-gray-500 text-center mb-6">
                    Votre avis sur l'achat de{' '}
                    <span className="font-medium text-gray-700">{transaction.ad_title}</span>
                </p>

                {error && (
                    <p role="alert" className="text-red-500 text-xl text-center mb-4">
                        {error}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {/* Étoiles */}
                    <fieldset>
                        <legend className="sr-only">Note de 1 à 5 étoiles</legend>
                        <div
                            role="radiogroup"
                            aria-label="Note"
                            className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    ref={star === 1 ? firstStarRef : null}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHover(star)}
                                    onMouseLeave={() => setHover(0)}
                                    role="radio"
                                    aria-label={`${star} étoile${star > 1 ? 's' : ''} — ${ratingLabels[star]}`}
                                    aria-pressed={rating === star}
                                    className="text-3xl transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded"
                                >
                                    <span className={(hover || rating) >= star ? 'text-yellow-400' : 'text-gray-300'}>
                                        ★
                                    </span>
                                </button>
                            ))}
                        </div>
                    </fieldset>

                    {/* Label de la note */}
                    <p className="text-center text-xl text-gray-400 h-4" aria-live="polite">
                        {ratingLabels[rating] || ''}
                    </p>

                    {/* Commentaire */}
                    <div className="flex flex-col gap-1">
                        <label htmlFor="review-comment" className="text-xl text-gray-500">
                            Commentaire <span className="text-gray-400">(optionnel)</span>
                        </label>
                        <textarea
                            id="review-comment"
                            placeholder="Partagez votre expérience"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={4}
                            className="border border-gray-200 rounded-2xl px-5 py-3 text-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:border-gray-700 resize-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-gray-600 hover:bg-gray-700 text-white text-xl font-medium py-3 rounded-full transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2"
                    >
                        {loading ? 'Envoi...' : 'Publier mon avis'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ReviewModal;
