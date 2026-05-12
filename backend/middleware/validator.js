import {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    updateProfileSchema,
    changePasswordSchema,
    reviewSchema
} from "../services/JoiSchema.js";

const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        const err = new Error(
            error.details.map((detail) => detail.message).join(", ")
        );
        err.status = 400;
        return next(err);
    }
    next();
};

export const validateRegister = validate(registerSchema);
export const validateLogin = validate(loginSchema);
export const validateForgotPassword = validate(forgotPasswordSchema);
export const validateResetPassword = validate(resetPasswordSchema);
export const validateUpdateProfile = validate(updateProfileSchema);
export const validateChangePassword = validate(changePasswordSchema);
export const validateReview = validate(reviewSchema);