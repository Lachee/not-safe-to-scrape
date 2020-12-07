const Joi           = require('joi');
const express       = require('express');
const { NotFoundError, ConflictError, BadRequestError} = require('../../http-errors');
const Scraper        = require('../../scraper/scraper');

module.exports = function(options) {    
    this.options = options;
    this.router = express.Router();

    const { auth } = this.options;

    //Get the reason a user is on the blacklist
    this.router.get('/', auth, async (req, res, next) => {
        console.log(req.originalUrl);
        let data = await Scraper.scrapeURL(req.query.url);
        if (data === false)  throw new NotFoundError('Failed to find any suitable scraper');
        res.send(data);
    });

     //Get the reason a user is on the blacklist
     this.router.get('/available', auth, async (req, res, next) => {
        res.send(Object.keys(Scraper.getScrapers()));
    });

    //Just reutrn the router
    return this;
}