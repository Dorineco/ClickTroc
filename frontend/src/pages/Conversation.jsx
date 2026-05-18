import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getConversation, sendMessage, deleteMessage, getUserById } from '../services/api';

const Conversation = () => {
    const { userId } = useParams();
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const bottomRef = useRef(null);

    useEffect(() => {
        getConversation(userId)
            .then(setMessages)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [userId]);

//afficher le prénom de l'utilisateur
    const [interlocutor, setInterlocutor] = useState(null);

    useEffect(() => {
        getUserById(userId)
            .then(setInterlocutor)
            .catch(console.error);
    }, [userId]);

    
    <h1 className="text-xl italic text-gray-600 mb-6">
        Conversation avec {interlocutor ? `${interlocutor.firstname} ${interlocutor.lastname}` : `Utilisateur #${userId}`}
    </h1>

    // Scroll automatique vers le bas
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;
        try {
            const newMessage = await sendMessage({
                receiver_id: Number(userId),
                content,
            });
            setMessages([...messages, newMessage]);
            setContent('');
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (messageId) => {
        try {
            await deleteMessage(messageId);
            setMessages(messages.filter((m) => m._id !== messageId));
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="text-center py-20 text-gray-400">Chargement...</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col flex-1 w-full">

                <h1 className="text-xl italic text-gray-600 mb-6">
    Conversation avec {interlocutor ? `${interlocutor.firstname} ${interlocutor.lastname}` : `Utilisateur #${userId}`}
</h1>

                {/* Messages */}
                <div className="flex-1 flex flex-col gap-3 mb-6 overflow-y-auto max-h-[60vh]">
                    {messages.length === 0 ? (
                        <p className="text-gray-400 text-xl text-center py-12">
                            Commencez la conversation !
                        </p>
                    ) : (
                        messages.map((msg) => {
                            const isMe = msg.sender_id === user.id;
                            return (
                                <div
                                    key={msg._id}
                                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`relative group max-w-xs lg:max-w-md px-4 py-3 rounded-2xl text-xl ${isMe
                                        ? 'bg-gray-600 text-white rounded-br-none'
                                        : 'bg-white border border-gray-200 text-gray-700 rounded-bl-none'
                                        }`}>
                                        <p>{msg.content}</p>
                                        <p className={`text-xs mt-1 ${isMe ? 'text-gray-300' : 'text-gray-400'}`}>
                                            {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                        </p>

                                        {/* Bouton supprimer — visible au survol */}
                                        {isMe && (
                                            <button
                                                onClick={() => handleDelete(msg._id)}
                                                className="absolute -top-2 -right-2 w-5 h-5 bg-red-400 text-white rounded-full text-xs hidden group-hover:flex items-center justify-center"
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* Zone de saisie */}
                <form onSubmit={handleSend} className="flex gap-3 items-center">
                    <input
                        type="text"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Écrire un message..."
                        className="flex-1 border border-gray-200 rounded-full px-5 py-3 text-xl bg-white focus:outline-none focus:border-gray-400"
                    />
                    <button
                        type="submit"
                        disabled={!content.trim()}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-full text-xl transition-colors disabled:opacity-50"
                    >
                        Envoyer
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Conversation;

