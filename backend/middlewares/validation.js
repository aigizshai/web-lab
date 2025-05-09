export const validateRequest = (requiredFields) => {
    return (req, res, next) => {
        const missingFields = [];
        const invalidFields = [];

        requiredFields.forEach((field) => {
            if (!req.body[field]) {
                missingFields.push(field);
            }
        });

        if (missingFields.length > 0 || invalidFields.length > 0) {
            const errors = {};

            if (missingFields.length) errors.missingFields = missingFields;
            if (invalidFields.length) errors.invalidFields = invalidFields; 

            return res.status(400).json({

                error: "Некорректные данные",
                errors: errors,
            });
        }
        
        next();

            };

    };

export const valid = (err,req,res,next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ 
            error: 'Некорректный JSON',
        details: "Проверьте тело запроса" });
    }
    next();
}