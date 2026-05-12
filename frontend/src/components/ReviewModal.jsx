import { useState } from 'react';
import { addReview } from '../services/api';

const ReviewModal = ({ transaction, onClose, onReviewed }) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

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
                className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl p-8"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative flex items-center justify-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-700">Laisser un avis</h2>
                    <button onClick={onClose} className="absolute right-0 text-gray-400 hover:text-gray-600">✕</button>
                </div>

                <p className="text-sm text-gray-500 text-center mb-6">
                    Votre avis sur l'achat de <span className="font-medium text-gray-700">{transaction.ad_title}</span>
                </p>

                {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {/* Étoiles */}
                    <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHover(star)}
                                onMouseLeave={() => setHover(0)}
                                className="text-3xl transition-colors"
                            >
                                <span className={(hover || rating) >= star ? 'text-yellow-400' : 'text-gray-300'}>
                                    ★
                                </span>
                            </button>
                        ))}
                    </div>

                    <p className="text-center text-sm text-gray-400">
                        {rating === 1 && 'Très mauvais'}
                        {rating === 2 && 'Mauvais'}
                        {rating === 3 && 'Correct'}
                        {rating === 4 && 'Bien'}
                        {rating === 5 && 'Excellent !'}
                    </p>

                    {/* Commentaire */}
                    <textarea
                        placeholder="Partagez votre expérience (optionnel)"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={4}
                        className="border border-gray-200 rounded-2xl px-5 py-3 text-sm bg-gray-50 focus:outline-none focus:border-gray-400 resize-none"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 rounded-full transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Envoi...' : 'Publier mon avis'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ReviewModal;
