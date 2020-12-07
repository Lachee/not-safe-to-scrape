const ForbiddenError = require('./http-errors').ForbiddenError;
module.exports = function(options) {
    return (req, res, next) => {
        if (options.key != '') { 
            //Get the auth header
            const authHeader = req.headers.authorization;
            if (!authHeader) 
                throw new ForbiddenError('forbidden');

            //Make sure the header matches.
            if (authHeader != options.key)
                throw new ForbiddenError('forbidden');
        }
        
        //move to the next handler.
        next();
    };
}