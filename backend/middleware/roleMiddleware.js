const authorize = (...roles) => {
    return (req, res, next) => {
        const userRole = req.user?.role?.toLowerCase()?.trim();
        const normalizedRoles = roles.map(r => r.toLowerCase().trim());

        // Handle common typos automatically
        if (userRole === 'inventory_managerr') {
            if (normalizedRoles.includes('inventory_manager')) {
                return next();
            }
        }

        if (!req.user || !normalizedRoles.includes(userRole)) {
            return res.status(403).json({
                message: `User role '${req.user.role}' is not authorized to access this route`
            });
        }
        next();
    };
};

module.exports = { authorize };
