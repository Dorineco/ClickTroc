import Joi from "joi";

//register
export const registerSchema = Joi.object({
    firstname: Joi.string()
        .trim()
        .pattern(/^[A-Za-zÀ-ÿ -]+$/)
        .min(3)
        .max(30)
        .required()
        .messages({ "string.empty": "Le prénom est requis" }),

    lastname: Joi.string()
        .trim()
        .pattern(/^[A-Za-zÀ-ÿ -]+$/)
        .min(3)
        .max(30)
        .required()
        .messages({ "string.empty": "Le nom est requis" }),

    email: Joi.string()
        .email()
        .required()
        .messages({ "string.empty": "L'email est requis" }),

    password: Joi.string()
        .min(8)
        .max(128)
        .required()
        .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$"))
        .messages({
            "string.pattern.base": "Le mot de passe doit contenir majuscule, minuscule et chiffre"
        }),

    confirmPassword: Joi.string()
        .valid(Joi.ref("password"))
        .required()
        .strip()
        .messages({
            "any.only": "Les mots de passe ne correspondent pas",
            "any.required": "La confirmation du mot de passe est requise"
        }),

    town_id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({ "any.required": "La ville est requise." })
        .optional()
});

//login

export const loginSchema = Joi.object({

    email: Joi.string()
        .email()
        .required()
        .messages({ "string.empty": "L'email est requis" }),

    password: Joi.string()
        .min(8)
        .max(128)
        .required()
        .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$"))
        .messages({
            "string.pattern.base": "Le mot de passe doit contenir majuscule, minuscule et chiffre"
        }),
});

// --- Forgot password ---
export const forgotPasswordSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({ "string.empty": "L'email est requis" }),
});

// --- Reset password ---
export const resetPasswordSchema = Joi.object({
    password: Joi.string()
        .min(8)
        .max(128)
        .required()
        .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$"))
        .messages({
            "string.pattern.base":
                "Le mot de passe doit contenir majuscule, minuscule et chiffre",
        }),

    confirmPassword: Joi.string()
        .valid(Joi.ref("password"))
        .required()
        .strip()
        .messages({
            "any.only": "Les mots de passe ne correspondent pas",
            "any.required": "La confirmation du mot de passe est requise",
        }),
});

// --- Update profile ---
export const updateProfileSchema = Joi.object({
    email: Joi.string().email().messages({
        'string.email': "L'email n'est pas valide.",
    }),
    firstname: Joi.string()
        .trim()
        .pattern(/^[A-Za-zÀ-ÿ -]+$/)
        .min(3)
        .max(30)
        .messages({ 'string.empty': 'Le prénom est requis' }),
    lastname: Joi.string()
        .trim()
        .pattern(/^[A-Za-zÀ-ÿ -]+$/)
        .min(3)
        .max(30)
        .messages({ 'string.empty': 'Le nom est requis' }),
    town_id: Joi.number().integer().positive().optional,
}).min(1); // Au moins un champ requis


// ***********************************Profile*******************************************


// --- Change password ---
export const changePasswordSchema = Joi.object({
    oldPassword: Joi.string().required().messages({
        'any.required': "L'ancien mot de passe est requis.",
    }),
    newPassword: Joi.string()
        .min(8)
        .max(128)
        .required()
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$'))
        .messages({
            'string.pattern.base':
                'Le mot de passe doit contenir majuscule, minuscule et chiffre',
        }),
    confirmPassword: Joi.string()
        .valid(Joi.ref('newPassword'))
        .required()
        .strip()
        .messages({
            'any.only': 'Les mots de passe ne correspondent pas',
            'any.required': 'La confirmation du mot de passe est requise',
        }),
});

// --- Review ---
export const reviewSchema = Joi.object({
    seller_id: Joi.number().integer().positive().required().messages({
        'any.required': 'Le vendeur est requis.',
    }),
    transaction_id: Joi.number().integer().positive().required().messages({
        'any.required': 'La transaction est requise.',
    }),
    rating: Joi.number().integer().min(1).max(5).required().messages({
        'any.required': 'La note est requise.',
        'number.min': 'La note doit être entre 1 et 5.',
        'number.max': 'La note doit être entre 1 et 5.',
    }),
    comment: Joi.string().max(500).optional(),
});