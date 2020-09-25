const Scraper   = require("./scraper");        
const scrapeIt  = require('scrape-it');
const fetch     = require('node-fetch');
const cheerio   = require('cheerio');
const md5       = require('md5');
const levenshtein = require('fast-levenshtein'); 

const levenshteinFilter = (source, maximum = 5) => {
    let _source, matches, x, y;
    _source = source.slice();
    matches = [];
    for (x = _source.length - 1; x >= 0; x--) {
      let output = _source.splice(x, 1);
      for (y = _source.length - 1; y >= 0; y--) {
        if (levenshtein.get(output[0], _source[y]) <= maximum) {
          output.push(_source[y]);
          _source.splice(y, 1);
          x--;
        }
      }
      matches.push(output);
    }
    return matches;
  }

module.exports = class NHentaiScrapper extends Scraper {
      
    validate(url) {
        return true;
    }

    async scrape(url) {
    
        // Get the metadata
        let scrapeResult = {
            id: md5(url), 
            title:          '',
            description:    '',
            tags:           [],
            languages:      [],
            url:            url,
            images:         []
        };

        const response = await fetch(url, { method: 'GET' });
        const page =  await response.text();
        const $ = cheerio.load(page);

        let pageImages = [];
        $('img').each((i, element) => {
            pageImages.push($(element).attr('src') || $(element).attr('srcset') || $(element).attr('data-src'));
        });

        scrapeResult.title = $("meta[property='og:title']").attr("content");
        scrapeResult.description =  $("meta[property='og:description']").attr("content");

        const levenshteined = levenshteinFilter(pageImages);
        const images = levenshteined.filter(g => g.length > 3).flat();
        scrapeResult.images = images
                                .map(url => url.startsWith('//') ? 'https:' + url : url)
                                .filter(url => { 
                                    const s = url.split('?')[0];
                                    return s.endsWith('.jpg') || s.endsWith('.jpeg')
                                });

        console.log('generic', scrapeResult);
        return scrapeResult; //scrapeResult;
    }

    hasSomeParentTheClass($, element, className) {
        if ($(element).hasClass(className)) return true;
        return element.parentNode && this.hasSomeParentTheClass($, element.parentNode, className);
    }
}