import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, deleteAccount, updateProfile, changePassword, removeFavorite } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AdCard from '../components/AdCard';
import ReviewModal from '../components/ReviewModal';

const Profile = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [pwdMode, setPwdMode] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [reviewModal, setReviewModal] = useState(null);
    const [reviewedTransactions, setReviewedTransactions] = useState([]);
    const [form, setForm] = useState({ firstname: '', lastname: '', email: '' });
    const [pwdForm, setPwdForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });

    useEffect(() => {
        getProfile()
            .then((data) => {
                setProfile(data);
                setForm({ firstname: data.firstname, lastname: data.lastname, email: data.email });
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const updated = await updateProfile(form);
            setProfile({ ...profile, ...updated });
            setEditMode(false);
            setSuccess('Profil mis à jour !');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setError('');
        if (pwdForm.newPassword !== pwdForm.confirmPassword) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }
        try {
            await changePassword(pwdForm);
            setPwdMode(false);
            setSuccess('Mot de passe modifié !');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) return;
        try {
            await deleteAccount();
            await logout();
            navigate('/');
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <div className="text-center py-20 text-gray-400">Chargement...</div>;
    if (!profile) return null;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">

            {/* Modale avis */}
            {reviewModal && (
                <ReviewModal
                    transaction={reviewModal}
                    onClose={() => setReviewModal(null)}
                    onReviewed={(id) => setReviewedTransactions([...reviewedTransactions, id])}
                />
            )}

            <div className="max-w-6xl mx-auto px-4 py-8 flex-1">

                {success && (
                    <div className="bg-green-50 text-green-600 text-sm text-center py-2 px-4 rounded-full mb-6">
                        {success}
                    </div>
                )}
                {error && (
                    <div className="bg-red-50 text-red-500 text-sm text-center py-2 px-4 rounded-full mb-6">
                        {error}
                    </div>
                )}

                {/* Bloc infos utilisateur */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
                    {!editMode ? (
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-semibold text-gray-700">{profile.firstname} {profile.lastname}</p>
                                <p className="text-sm text-gray-400 mt-1">
                                    membre depuis {new Date(profile.created_at).toLocaleDateString('fr-FR')}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">{profile.email}</p>
                            </div>
                            <div className="flex gap-3 flex-wrap">
                                <button onClick={() => setEditMode(true)}
                                    className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 px-4 py-2 rounded-full">
                                    Modifier le profil
                                </button>
                                <button onClick={() => setPwdMode(!pwdMode)}
                                    className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 px-4 py-2 rounded-full">
                                    Changer le mot de passe
                                </button>
                                <button onClick={handleDelete}
                                    className="text-sm text-red-400 hover:text-red-600 border border-red-200 px-4 py-2 rounded-full">
                                    Supprimer le compte
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleUpdate} className="flex flex-col gap-3 max-w-md">
                            <input type="text" value={form.firstname}
                                onChange={(e) => setForm({ ...form, firstname: e.target.value })}
                                placeholder="Prénom"
                                className="border border-gray-200 rounded-full px-5 py-2 text-sm bg-gray-50 focus:outline-none" />
                            <input type="text" value={form.lastname}
                                onChange={(e) => setForm({ ...form, lastname: e.target.value })}
                                placeholder="Nom"
                                className="border border-gray-200 rounded-full px-5 py-2 text-sm bg-gray-50 focus:outline-none" />
                            <input type="email" value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                placeholder="Email"
                                className="border border-gray-200 rounded-full px-5 py-2 text-sm bg-gray-50 focus:outline-none" />
                            <div className="flex gap-3">
                                <button type="submit" className="bg-gray-600 text-white px-6 py-2 rounded-full text-sm hover:bg-gray-700">
                                    Sauvegarder
                                </button>
                                <button type="button" onClick={() => setEditMode(false)}
                                    className="text-gray-400 px-6 py-2 rounded-full text-sm border border-gray-200 hover:bg-gray-50">
                                    Annuler
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Changement de mot de passe */}
                    {pwdMode && (
                        <form onSubmit={handleChangePassword} className="flex flex-col gap-3 max-w-md mt-4 pt-4 border-t border-gray-100">
                            <input type="password" placeholder="Ancien mot de passe" value={pwdForm.oldPassword}
                                onChange={(e) => setPwdForm({ ...pwdForm, oldPassword: e.target.value })}
                                className="border border-gray-200 rounded-full px-5 py-2 text-sm bg-gray-50 focus:outline-none" />
                            <input type="password" placeholder="Nouveau mot de passe" value={pwdForm.newPassword}
                                onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                                className="border border-gray-200 rounded-full px-5 py-2 text-sm bg-gray-50 focus:outline-none" />
                            <input type="password" placeholder="Confirmer le nouveau mot de passe" value={pwdForm.confirmPassword}
                                onChange={(e) => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })}
                                className="border border-gray-200 rounded-full px-5 py-2 text-sm bg-gray-50 focus:outline-none" />
                            <div className="flex gap-3">
                                <button type="submit" className="bg-gray-600 text-white px-6 py-2 rounded-full text-sm hover:bg-gray-700">
                                    Modifier
                                </button>
                                <button type="button" onClick={() => setPwdMode(false)}
                                    className="text-gray-400 px-6 py-2 rounded-full text-sm border border-gray-200 hover:bg-gray-50">
                                    Annuler
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Mes annonces */}
                <h2 className="text-xl italic text-gray-600 mb-4">Mes annonces</h2>
                {profile.ads && profile.ads.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {profile.ads.map((ad) => (
                            <AdCard key={ad.id} ad={ad} />
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400 text-sm mb-8">Vous n'avez pas encore d'annonces.</p>
                )}

                {/* Mes favoris */}
                <h2 className="text-xl italic text-gray-600 mb-4">Mes favoris</h2>
                {profile.favorites && profile.favorites.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {profile.favorites.map((ad) => (
                            <div key={ad.id} className="relative group">
                                <AdCard ad={ad} />
                                <button
                                    onClick={async () => {
                                        try {
                                            await removeFavorite(ad.id);
                                            setProfile({ ...profile, favorites: profile.favorites.filter((f) => f.id !== ad.id) });
                                        } catch (err) {
                                            console.error(err);
                                        }
                                    }}
                                    className="absolute top-2 right-2 w-7 h-7 bg-red-400 hover:bg-red-500 text-white rounded-full text-xs hidden group-hover:flex items-center justify-center transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400 text-sm mb-8">Vous n'avez pas encore de favoris.</p>
                )}

                {/* Mes achats */}
                <h2 className="text-xl italic text-gray-600 mb-4">Mes achats</h2>
                {profile.transactions && profile.transactions.length > 0 ? (
                    <div className="flex flex-col gap-3 mb-8">
                        {profile.transactions.map((t) => (
                            <div key={t.id} className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-4">
                                {/* Image */}
                                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                                    {t.ad_image ? (
                                        <img src={`http://localhost:3000${t.ad_image}`} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gray-200" />
                                    )}
                                </div>

                                {/* Infos */}
                                <div className="flex-1">
                                    <p className="font-medium text-gray-700">{t.ad_title}</p>
                                    <p className="text-sm text-gray-400">{new Date(t.created_at).toLocaleDateString('fr-FR')}</p>
                                </div>

                                {/* Statut + prix + avis */}
                                <div className="flex flex-col items-end gap-2">
                                    <span className={`text-xs px-3 py-1 rounded-full ${t.status === 'completed' ? 'bg-green-100 text-green-600' :
                                            t.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                                                'bg-red-100 text-red-500'
                                        }`}>
                                        {t.status === 'completed' ? 'Payé' : t.status === 'pending' ? 'En attente' : 'Annulé'}
                                    </span>
                                    <p className="font-semibold text-gray-700">{t.ad_price} €</p>
                                    {t.status === 'completed' && !reviewedTransactions.includes(t.id) && (
                                        <button
                                            onClick={() => setReviewModal(t)}
                                            className="text-xs text-indigo-500 hover:text-indigo-700 border border-indigo-200 px-3 py-1 rounded-full"
                                        >
                                            Laisser un avis
                                        </button>
                                    )}
                                    {reviewedTransactions.includes(t.id) && (
                                        <span className="text-xs text-green-500">✓ Avis publié</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400 text-sm mb-8">Vous n'avez pas encore d'achats.</p>
                )}
            </div>

            {/* Footer */}
            
        </div>
    );
};

export default Profile;
