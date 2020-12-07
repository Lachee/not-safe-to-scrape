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

module.exports = async function(url) {

    // Get the metadata
    let scrapeResult = {
        id:             md5(url),
        type:           'artwork',
        title:          null,
        description:    null,
        artist:         null,
        tags:           [],
        url:            url,
        images:         [],
        thumbnail:      null,
    };

    const response = await fetch(url, { method: 'GET' });
    const page =  await response.text();
    const $ = cheerio.load(page);

    let pageImages = [];
    $('img').each((i, element) => {
        pageImages.push($(element).attr('src') || $(element).attr('srcset') || $(element).attr('data-src'));
    });

    console.log('all images', pageImages);
    scrapeResult.title = $("meta[property='og:title']").attr("content");
    scrapeResult.description =  $("meta[property='og:description']").attr("content");

    const levenshteined = levenshteinFilter(pageImages, 10);
    const images = levenshteined.filter(g => g.length > 3).flat();

    scrapeResult.images = images
                            .map(url => url.startsWith('//') ? 'https:' + url : url)
                            .filter(url => { 
                                const s = url.split('?')[0];
                                console.log(s);
                                return s.endsWith('.jpg') || s.endsWith('.jpeg');
                            });

    console.log('actual images', scrapeResult.images);
    
    if (scrapeResult.images.length > 0) 
        scrapeResult.thumbnail = scrapeResult.images[0];

    if (scrapeResult.images.length > 1) 
        scrapeResult.type = 'comic';

    return scrapeResult;
}

hasSomeParentTheClass($, element, className) {
    if ($(element).hasClass(className)) return true;
    return element.parentNode && this.hasSomeParentTheClass($, element.parentNode, className);
}