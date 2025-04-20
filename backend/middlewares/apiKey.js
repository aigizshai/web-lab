export const apiKeyMiddleware = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
        return res.status(401).json({ message: 'Требуется Api ключ' });
    }
    if (apiKey !== process.env.API_KEY) {
        return res.status(401).json({ message: 'Неправильный ключ' });
    }
    next();
}