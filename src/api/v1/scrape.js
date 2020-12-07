const Joi           = require('joi');
const express       = require('express');
const { NotFoundError, ConflictError, BadRequestError} = require('../../http-errors');
const scrape        = require('../../scraper/index');

module.exports = function(options) {    
    this.options = options;
    this.router = express.Router();

    const { auth } = this.options;

    //Get the reason a user is on the blacklist
    this.router.get('/', auth, async (req, res, next) => {
        console.log(req.originalUrl);
        let data = await scrape(req.query.url);
        if (data === false)  throw new NotFoundError('Failed to find any suitable scraper');
        res.send(data);
    });

    //Just reutrn the router
    return this;
}