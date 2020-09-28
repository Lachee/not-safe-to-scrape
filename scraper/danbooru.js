const Scraper = require("./scraper");        
const fetch     = require('node-fetch');
const cheerio   = require('cheerio');

module.exports = class Danbooru extends Scraper {
    validate(url) {
        return url.includes('danbooru');
    }

    async scrape(url) {
    
        const regex = /\/posts\/([0-9]+)\/?/;
        const match = url.match(regex);

        // Get the metadata
        let scrapeResult = {
            id:             match[1], 
            title:          match[1],
            description:    '',
            tags:           [],
            languages:      [],
            url:            url,
            images:         []
        };

        const response = await fetch(url, { method: 'GET' });
        const page =  await response.text();
        const $ = cheerio.load(page);


        scrapeResult.title = $("meta[property='og:title']").attr("content");
        scrapeResult.images = [];
        $('#image').each((i, elm) => { scrapeResult.images.push($(elm).attr('src')); });
        $('.search-tag').each((i, elm) => { scrapeResult.tags.push($(elm).text().toLowerCase()); });

        return scrapeResult; //scrapeResult;
    }
}