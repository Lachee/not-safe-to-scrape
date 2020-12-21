const Scraper   = require("./scraper");        
const scrapeIt  = require('scrape-it');
const fetch     = require('node-fetch');
const cheerio   = require('cheerio');
const md5       = require('md5');
const levenshtein = require('fast-levenshtein'); 

//https://aster-effect.com/2020/02/18/lupusregina-and-shalltears-bondage/

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
        artist:         [],
        tags:           [],
        url:            url,
        images:         [],
        cover:          null,
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

    //Find appropriate images
    const levenshteined = levenshteinFilter(pageImages, 10);
    const images = levenshteined.filter(g => g.length > 3).flat();
    scrapeResult.images = images
                            .map(url => url.startsWith('//') ? 'https:' + url : url)
                            .filter(url => { 
                                const s = url.split('?')[0];
                                console.log(s);
                                return s.endsWith('.jpg') || s.endsWith('.jpeg') || s.endsWith('.png') || s.endsWith('.gif');
                            });

    if (scrapeResult.images.length > 1) { 
        scrapeResult.type = 'comic';
        scrapeResult.cover= scrapeResult.images[0];
      }


    //Find appropriate tags
    $('.tags-links a').each((i, element) => {
        scrapeResult.tags.push($(element).text());
    });

    return scrapeResult;
}

function hasSomeParentTheClass($, element, className) {
    if ($(element).hasClass(className)) return true;
    return element.parentNode && this.hasSomeParentTheClass($, element.parentNode, className);
}