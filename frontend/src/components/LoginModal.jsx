import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { login as loginApi, getProfile } from '../services/api';
import { Eye, EyeOff } from "lucide-react";

const LoginModal = ({ onClose, onSwitchToRegister }) => {
    const { login } = useAuth();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const emailRef = useRef(null);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await loginApi(form);
            const profile = await getProfile();
            login(profile);
            onClose();
        } catch (err) {
            setError("Email ou mot de passe incorrect.");
        } finally {
            setLoading(false);
        }
    };


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
        emailRef.current?.focus();
    }, []);

    return (
        // Overlay
        <div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
            onClick={onClose}
        >
            {/* Modale */}
            <div
                className="bg-white rounded-2xl w-full max-w-3xl mx-4 flex overflow-hidden shadow-2xl"
                role="dialog"
                aria-modal="true"
                aria-labelledby="login-title"

                onClick={(e) => e.stopPropagation()}
            >
                <h2 id="login-title"></h2>
                {/* Colonne gauche — formulaire */}
                <div className="flex-1 p-10 flex flex-col justify-center">
                    <button onClick={onClose} className=" text-red-700 hover:text-red-600">✕</button>
                    <h2 className="text-2xl font-semibold text-gray-700 mb-8 text-center">
                        Se connecter
                    </h2>

                    {error && (
                        <p className="text-red-500 text-sm text-center mb-4">{error}</p>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                        <div>
                            <label htmlFor="email" className="sr-only">
                                Email
                            </label>

                            <input
                                id="email"
                                type="email"
                                name="email"
                                autoComplete="email"
                                inputMode="email"
                                placeholder="Email"
                                value={form.email}
                                onChange={handleChange}
                                required
                                ref={emailRef}
                                className="w-full border border-gray-200 rounded-full px-5 py-3 text-sm bg-gray-50
                focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                            />
                        </div>

                        <div className="relative">

                            <label htmlFor="password" className="sr-only">
                                Mot de passe
                            </label>

                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                name="password"
                                autoComplete="current-password"
                                placeholder="Mot de passe"
                                value={form.password}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-200 rounded-full px-5 py-3 pr-12 text-sm bg-gray-50
                focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                            />

                            <button
                                type="button"
                                aria-label="Afficher le mot de passe"
                                onMouseDown={() => setShowPassword(true)}
                                onMouseUp={() => setShowPassword(false)}
                                onMouseLeave={() => setShowPassword(false)}
                                onTouchStart={() => setShowPassword(true)}
                                onTouchEnd={() => setShowPassword(false)}
                                onContextMenu={(e) => e.preventDefault()}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        <a
                            href="/forgot-password"
                            className="text-sm text-gray-500 text-right hover:text-red-600"
                        >
                            Mot de passe oublié ?
                        </a>

                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 rounded-full
                transition-colors disabled:opacity-50 mt-2"
                        >
                            {loading ? "Connexion..." : "Connectez-vous"}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Fermer la fenêtre"
                            className="absolute top-4 right-4"
                        >
                            ✕
                        </button>
                    </form>

                    <p className="text-sm text-center mt-6 text-gray-500">
                        Vous n'avez pas de compte ?{' '}
                        <button
                            onClick={onSwitchToRegister}
                            className="font-semibold underline text-gray-700 hover:text-gray-900"
                        >
                            Créer un compte
                        </button>
                    </p>
                </div>

                {/* Colonne droite — image */}
                <div className="hidden md:flex w-72 relative items-center justify-center bg-gray-100 p-6">
                    <div className="rounded-2xl overflow-hidden w-full h-80 relative">
                        <img
                            src="/hero.jpg"
                            alt="Click&Troc"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center text-white">
                            <span className="text-3xl font-bold">Click&amp;Troc</span>
                            <span className="text-sm italic mt-1">le site des petites annonces locales</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;
