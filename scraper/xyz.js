const Scraper = require("./scraper");       
const cheerio   = require('cheerio');
const fetch     = require('node-fetch');
const md5       = require('md5');

module.exports = class NHentaiScrapper extends Scraper {
    validate(url) {
        return url.includes('xyzcomics');
    }

    async scrape(url) {

        // Get the metadata
        let scrapeResult = {
            id: md5(url), 
            title: url,
            description: '',
            tags: [],
            languages: [],
            url: url,
            images: []
        };

        const response = await fetch(url, { method: 'GET' });
        const page =  await response.text();
        const $ = cheerio.load(page);

        scrapeResult.title = $('.entry-title').text();
        $('figure a').each((i, elm) => { 
            scrapeResult.images.push($(elm).attr('href')); 
        });
        $('a[rel="tag"]').each((i, elm) => { 
            scrapeResult.tags.push($(elm).text().toLocaleLowerCase()); 
        });
    
        //Prepare the images
        return scrapeResult;
    }
}