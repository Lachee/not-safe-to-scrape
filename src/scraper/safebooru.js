const fetch     = require('node-fetch');
const cheerio   = require('cheerio');

//example: https://danbooru.donmai.us/posts/4237731

module.exports = async function(url) {
    
    const regex = /id=([0-9]+)/;
    const match = url.match(regex);
    const domain = url.indexOf('gelbooru') != -1 ? 'gelbooru.com' : 'safebooru.org';

    const opts = {
        method: 'GET',
        headers: {
            cookie: 'resize-original=1; resize-notification=1'
        }
    }

    const response = await fetch(url, opts);
    const page =  await response.text();
    const $ = cheerio.load(page);

    let images = [];
    $('#image').each((i, elm) => { images.push($(elm).attr('src')); });
    
    let thumbnail = images[0];
    let image = title = $("meta[property='og:image']").attr("content");
    images = [ image ];

    let tags = [];
    $('.tag-type-general a').each((i, elm) => { tags.push($(elm).text().toLowerCase()); });

    let artist = [];
    $('.tag-type-artist a').each((i, elm) => { tags.push($(elm).text().toLowerCase()); });

    //set the thumbnail
    return {
        id:             match[1],
        type:           tags.indexOf('comic') >= 0 ? 'comic' : 'artwork',
        title:          `Post ${match[1]}`,
        description:    null,
        artist:         [],
        tags:           [... new Set(tags.filter(t => artist.indexOf(t) == -1))],
        url:            `https://${domain}/index.php?page=post&s=view&id=${match[1]}`,
        images:         images,
        cover:          thumbnail,
        pages:          images.length
    };
}