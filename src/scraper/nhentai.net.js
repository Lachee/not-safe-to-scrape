const Scraper = require("./scraper");        
const scrapeIt  = require('scrape-it');
const fetch     = require('node-fetch');

module.exports = class NHentaiScraper extends Scraper {
    validate(url) {
        return url.includes('nhentai');
    }

    async scrape(url) {
        const regex = /nhentai.net\/g\/([0-9]+)\//;
        const found = url.match(regex);
        if (found.length == 0 || found.length < 2) { 
            console.error("Failed to match anything");
            return false;
        }

        const base = `https://nhentai.net/g/${found[1]}/`;

        // Get the metadata
        let scrapeResult = {
            id: found[1], 
            title: found[1],
            description: '',
            tags: [],
            languages: [],
            url: base,
            images: []
        };

        const { data } = await scrapeIt(base, {
            title:  { selector: "#info .title", eq: 0 },
            tags: { listItem: '.tags .tag[href^="/tag"] .name' },
            pages: {
                selector: '.tags .tag[href^="/search/?q=pages"] .name',
                convert: parseInt
            },
            cover: {
                selector: '#cover img',
                attr: 'data-src',
            },
        });

        //Assign the data
        Object.assign(scrapeResult, data);

        //Load up the images
        const galleryID = data.cover.match(/\/galleries\/([0-9]+)\//)[1];
        for(let page = 1; page < scrapeResult.pages+1; page++) {
            scrapeResult.images.push(`https://i.nhentai.net/galleries/${galleryID}/${page}.jpg`);
        }

        //Prepare the images
        return scrapeResult;

        // Scan the pages
        let page = 0;
        let totalPages = 1;
        do {
            const { data } = await scrapeIt(base + (page + 1).toString(), {
                pages: { 
                    selector: ".page-number span.num-pages", 
                    eq: 0, 
                    convert: parseInt
                },
                image: {
                    selector: "#image-container > a > img",
                    attr: "src"
                }
            });

            console.log('nhentai page: ', data);
            scrapeResult.images.push(data.image);
            totalPages = data.pages;
            page += 1;

        }while(page < totalPages);

        // Finally return the data
        return scrapeResult;
    }
}