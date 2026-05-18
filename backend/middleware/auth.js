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

export default verifyToken;