import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../services/api';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState({ password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (form.password !== form.confirmPassword) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }

        setLoading(true);
        try {
            await resetPassword(token, {
                password: form.password,
                confirmPassword: form.confirmPassword,
            });
            setSuccess(true);
            setTimeout(() => navigate('/'), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-md w-full max-w-md mx-4 p-10">

                <h2 className="text-2xl font-semibold text-gray-700 mb-2 text-center">
                    Nouveau mot de passe
                </h2>
                <p className="text-xl text-gray-400 text-center mb-8">
                    Choisissez un nouveau mot de passe sécurisé.
                </p>

                {success ? (
                    <div className="text-center">
                        <div className="text-green-500 text-5xl mb-4">✓</div>
                        <p className="text-green-600 font-medium">
                            Mot de passe réinitialisé avec succès !
                        </p>
                        <p className="text-xl text-gray-400 mt-2">
                            Vous allez être redirigé vers l'accueil...
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {error && (
                            <p className="text-red-500 text-xl text-center">{error}</p>
                        )}

                        <input
                            type="password"
                            name="password"
                            placeholder="Nouveau mot de passe"
                            value={form.password}
                            onChange={handleChange}
                            required
                            className="border border-gray-200 rounded-full px-5 py-3 text-xl bg-gray-50 focus:outline-none focus:border-gray-400"
                        />
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirmer le mot de passe"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            required
                            className="border border-gray-200 rounded-full px-5 py-3 text-xl bg-gray-50 focus:outline-none focus:border-gray-400"
                        />

                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 rounded-full transition-colors disabled:opacity-50 mt-2"
                        >
                            {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
