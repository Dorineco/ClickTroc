import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { register as registerApi, getProfile, getCategories } from '../services/api';
import { Eye, EyeOff } from "lucide-react";

const RegisterModal = ({ onClose, onSwitchToLogin }) => {
    const { login } = useAuth();
    const [form, setForm] = useState({
        firstname: '',
        lastname: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const firstnameRef = useRef(null);

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
            await registerApi({
                firstname: form.firstname,
                lastname: form.lastname,
                email: form.email,
                password: form.password,
                confirmPassword: form.confirmPassword
            });
            const profile = await getProfile();
            login(profile);
            onClose();
        } catch (err) {
            setError(err.message);
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
        firstnameRef.current?.focus();
    }, []);

    return (
        <div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="register-title"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl w-full max-w-3xl mx-4 flex overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Colonne gauche — formulaire */}
                <div className="flex-1 p-10 flex flex-col justify-center">
                    
                    <h2 className="text-2xl font-semibold text-gray-700 mb-8 text-center">
                        Créer son compte
                    </h2>
                    <button onClick={onClose} className="absolute right-6 text-gray-400 hover:text-gray-600">✕</button>
                    

                    {error && (
                        <p className="text-red-500 text-sm text-center mb-4">{error}</p>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        
                        <input
                            type="text"
                            name="firstname"
                            placeholder="Prénom"
                            value={form.firstname}
                            onChange={handleChange}
                            required
                            ref={firstnameRef}
                            className="w-full border border-gray-200 rounded-full px-5 py-3 text-sm bg-gray-50
                focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                        />
                        <input
                            type="text"
                            name="lastname"
                            placeholder="Nom"
                            value={form.lastname}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-200 rounded-full px-5 py-3 text-sm bg-gray-50
                focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                        />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-200 rounded-full px-5 py-3 text-sm bg-gray-50
                focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                        />
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Mot de passe"
                                value={form.password}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-200 rounded-full px-5 py-3 text-sm bg-gray-50
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
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                placeholder="Confirmation du mot de passe"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-200 rounded-full px-5 py-3 text-sm bg-gray-50
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


                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 rounded-full transition-colors disabled:opacity-50 mt-2"
                        >
                            {loading ? 'Création...' : 'Créer le compte'}
                        </button>
                    </form>

                    <p className="text-sm text-center mt-6 text-gray-500">
                        Vous avez un compte ?{' '}
                        <button
                            onClick={onSwitchToLogin}
                            className="font-semibold underline text-gray-700 hover:text-gray-900"
                        >
                            Connectez-vous.
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

export default RegisterModal;
