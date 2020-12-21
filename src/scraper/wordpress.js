const fetch     = require('node-fetch');
const cheerio   = require('cheerio');
const md5       = require('md5');
const levenshtein = require('fast-levenshtein'); 

//https://aster-effect.com/2020/02/18/lupusregina-and-shalltears-bondage/
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

    //Validate its a wordpress page
    let generator = $("meta[name='generator']").attr("content");
    if (generator == null || generator.toLowerCase() != "wordpress.com")
        return false;

    //Get it's title and shit
    scrapeResult.title = $("meta[property='og:title']").attr("content");
    scrapeResult.description =  $("meta[property='og:description']").attr("content");

    //Find images
    let images = [];
    $('article.post .wp-block-image img').each((i, element) => {
        images.push($(element).attr('data-orig-file'));
    });
    scrapeResult.images = [ ... new Set(images) ];

    //Find appropriate tags
    let tags = [];
    $('.tags-links a').each((i, element) => {
        tags.push($(element).text());
    });
    scrapeResult.tags = [ ... new Set(tags) ];

    //Return the results
    return scrapeResult;
}
