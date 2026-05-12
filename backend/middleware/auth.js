import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
    
    const token = req.cookies.accessToken;
    

    if (!token) {
        const err = new Error("Accès refusé, vous devez être connecté.");
        err.status = 401;
        return next(err);
    }

    try {
        const decoded = jwt.verify(token, process.env.SESSION_SECRET);
        req.user = decoded;
        next();
        
    } catch {
        const err = new Error("Token invalide ou expiré.");
        err.status = 401;
        return next(err);
    }
};

const logout = async (req, res) => {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.status(200).json({ message: 'Déconnecté.' });
};

export default verifyToken;