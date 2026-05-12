import mongoose from 'mongoose';

const connectMongoDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connecté à MongoDB');
    } catch (err) {
        console.error('❌ Erreur connexion MongoDB:', err);
        process.exit(1);
    }
};

export default connectMongoDB;