require('dotenv').config();
const express       = require('express');
const express_err   = require('express-async-errors');
const morgan        = require('morgan');
const helmet        = require('helmet');
const cors          = require('cors');
//const S3            = require('aws-sdk/clients/s3');

//setup monk
//const monk = require('monk');
//const db = monk(process.env.DATABASE_URL);

//Setup express
const app = express();
app.use(express.json());
app.use(morgan());
app.use(helmet());
app.use(cors());

//Setup the auth
const authentication = require('./authorize');

//Setup the default router
const router = express.Router();

//Prepare the routes
const options = { 
    app,
    auth: authentication({  key: process.env.AUTH_KEY })
};

//Setup the default headers
router.use((req, res, next) => {
    res.setHeader('moonmin', 'always');
    next();
});

//Setup the API
router.use(require('./api/v1')(options));

//Use the middleware
const middlewares = require('./middlewares');
router.use(middlewares.notFound);
router.use(middlewares.errorHandler);

//setup the route
app.use(process.env.ROUTE || '/api', router);

//setup the port and listen
const port = process.env.PORT || 2525;
app.listen(port, () => {
    console.log(`API Listening at http://localhost:${port}`);
});