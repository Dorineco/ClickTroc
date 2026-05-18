import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getConversations, getUserById } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Messages = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [conversations, setConversations] = useState([]);
    const [interlocutors, setInterlocutors] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
            getConversations()
                .then(async (convs) => {
                    setConversations(convs);
                    // Charger le prénom de chaque interlocuteur
                    const names = {};
                    await Promise.all(
                        convs.map(async (conv) => {
                            try {
                                const u = await getUserById(conv._id);
                                names[conv._id] = `${u.firstname} ${u.lastname}`;
                            } catch {
                                names[conv._id] = `Utilisateur #${conv._id}`;
                            }
                        })
                    );
                    setInterlocutors(names);
                })
                .catch(console.error)
                .finally(() => setLoading(false));
        }, []);
    
        if (loading) return <div className="text-center py-20 text-gray-400">Chargement...</div>;
    
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-2xl mx-auto px-4 py-8">
                    <h1 className="text-xl italic text-gray-600 mb-6">Mes messages</h1>
    
                    {conversations.length === 0 ? (
                        <p className="text-gray-400 text-xl text-center py-12">
                            Vous n'avez pas encore de messages.
                        </p>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {conversations.map((conv) => {
                                const interlocutorId = conv._id;
                                const lastMessage = conv.last_message;
                                const isMe = lastMessage.sender_id === user.id;
    
                                return (
                                    <div
                                        key={interlocutorId}
                                        onClick={() => navigate(`/messages/${interlocutorId}`)}
                                        className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:shadow-sm transition-shadow"
                                    >
                                        {/* Avatar */}
                                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                            <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                                            </svg>
                                        </div>
    
                                        {/* Contenu */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xl font-semibold text-gray-700">
                                                {interlocutors[interlocutorId] || `Utilisateur #${interlocutorId}`}
                                            </p>
                                            <p className="text-xl text-gray-400 truncate">
                                                {isMe ? 'Vous : ' : ''}{lastMessage.content}
                                            </p>
                                        </div>
    
                                        {/* Date */}
                                        <p className="text-xs text-gray-300 flex-shrink-0">
                                            {new Date(lastMessage.created_at).toLocaleDateString('fr-FR')}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        );
    };
    
    export default Messages;
