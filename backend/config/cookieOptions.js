const baseCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
};

export const accessCookieOptions = {
    ...baseCookieOptions,
    maxAge: 15 * 60 * 1000, // 15 minutes
};

export const refreshCookieOptions = {
    ...baseCookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
};


export const clearCookieOptions = baseCookieOptions;