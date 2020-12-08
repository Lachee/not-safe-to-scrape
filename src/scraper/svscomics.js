const fetch     = require('node-fetch');
const cheerio   = require('cheerio');
const md5       = require('md5');

//example: https://svscomics.com/download/483017/win4699-tomb-failure

module.exports = async function(url) {

    const response = await fetch(url, { method: 'GET' });
    const page =  await response.text();
    const $ = cheerio.load(page);

    let images = [];    
    $('.preview-row a').each((i, elm) => { images.push($(elm).attr('href')); });
    
    let tags = [];    
    $('.tagzfull a').each((i, elm) => { tags.push($(elm).text().toLowerCase()); });
    
    return {
        id:             md5(url),
        type:           'comic',
        title:          $('.headerh1full').text(),
        description:    null,
        artist:         null,
        tags:           [... new Set(tags)],
        url:            url,
        images:         [... new Set(images)],
        thumbnail:      images[0],
    }
}