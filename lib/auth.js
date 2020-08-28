module.exports = {
    checkAuth: (req, res, next) => {
        if (!req.isAuthenticated()) {
            console.log('You\'re not authorized to access this resource.');
            return res.redirect('/login');
        }

        return next();
    }
}