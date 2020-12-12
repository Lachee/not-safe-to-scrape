const fetch     = require('node-fetch');
const cheerio   = require('cheerio');
const md5       = require('md5');

//example: https://rule34.xxx/index.php?page=post&s=view&id=4284118

module.exports = async function(url) {

    const regex = /id=(\w*)/;
    const match = url.match(regex);
    
    const response = await fetch(url, { method: 'GET' });
    const page =  await response.text();
    const $ = cheerio.load(page);

    let images = [];    
    $('#image').each((i, elm) => { images.push($(elm).attr('src')); });
    
    let tags = [];    
    $('.tag a').each((i, elm) => { tags.push($(elm).text().toLowerCase()); });
    
    let artist = [];
    $('.tag-type-artist.tag a').each((i, elm) => { artist.push($(elm).text().toLowerCase()); });

    return {
        id:             match[1],
        type:           tags.indexOf('comic') >= 0 ? 'comic' : 'artwork',
        title:          'Post ' + match[1],
        description:    null,
        artist:         [... new Set(artist)],
        tags:           [... new Set(tags.filter(t => artist.indexOf(t) == -1))],
        url:            url,
        images:         [... new Set(images)],
        cover:          null,
    }
}