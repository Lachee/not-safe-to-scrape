const express = require('express');

module.exports = function(options) {
    const router = express.Router();
    router.get('/', (req, res) => { res.send({ message: '👋 API V1'}); })

    //Add some API boys
    router.use('/scrape', require('./scrape')(options).router);
    return router;
}