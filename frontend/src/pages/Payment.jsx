import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ clientSecret, ad, transactionId }) => {
    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setLoading(true);
        setError('');

        const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
            clientSecret,
            {
                payment_method: {
                    card: elements.getElement(CardElement),
                },
            }
        );

        if (stripeError) {
            setError(stripeError.message);
            setLoading(false);
            return;
        }

        if (paymentIntent.status === 'succeeded') {
            navigate('/profile', { state: { paymentSuccess: true } });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-md w-full max-w-md mx-4 p-8">
                <h2 className="text-xl font-semibold text-gray-700 mb-2 text-center">
                    Paiement sécurisé
                </h2>

                {ad && (
                    <div className="bg-gray-50 rounded-xl p-4 mb-6">
                        <p className="text-sm text-gray-600 font-medium">{ad.title}</p>
                        <p className="text-lg font-bold text-gray-800 mt-1">{ad.price} €</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {error && (
                        <p className="text-red-500 text-sm text-center">{error}</p>
                    )}

                    <div className="border border-gray-200 rounded-xl px-4 py-3 bg-gray-50">
                        <CardElement options={{
                            style: {
                                base: {
                                    fontSize: '16px',
                                    color: '#374151',
                                    '::placeholder': { color: '#9ca3af' },
                                },
                            },
                            hidePostalCode: true,
                        }} />
                    </div>

                    <p className="text-xs text-gray-400 text-center">
                        🔒 Paiement sécurisé par Stripe. Vos données bancaires ne transitent pas par nos serveurs.
                    </p>

                    <button
                        type="submit"
                        disabled={loading || !stripe}
                        className="bg-orange-400 hover:bg-orange-500 text-white font-medium py-3 rounded-full transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Traitement...' : `Payer ${ad?.price} €`}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="text-sm text-gray-400 hover:text-gray-600 text-center"
                    >
                        Annuler
                    </button>
                </form>
            </div>
        </div>
    );
};

const Payment = () => {
    const { transactionId } = useParams();
    const { state } = useLocation();

    if (!state?.clientSecret) {
        return (
            <div className="text-center py-20 text-gray-400">
                Informations de paiement manquantes.
            </div>
        );
    }

    return (
        <Elements stripe={stripePromise} options={{ clientSecret: state.clientSecret }}>
            <CheckoutForm
                clientSecret={state.clientSecret}
                ad={state.ad}
                transactionId={transactionId}
            />
        </Elements>
    );
};

export default Payment;
