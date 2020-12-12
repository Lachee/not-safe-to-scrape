const fetch     = require('node-fetch');
const cheerio   = require('cheerio');

//example: https://danbooru.donmai.us/posts/4237731

module.exports = async function(url) {
    
    const regex = /\/posts\/([0-9]+)\/?/;
    const match = url.match(regex);

    const response = await fetch(url, { method: 'GET' });
    const page =  await response.text();
    const $ = cheerio.load(page);

    let images = [];
    $('#image').each((i, elm) => { images.push($(elm).attr('src')); });
    
    //TODO: Account for children
    //images = [... new Set(images.filter(i => i != null))];

    let tags = [];
    $('.search-tag').each((i, elm) => { tags.push($(elm).text().toLowerCase()); });

    let artist = [];
    $('.artist-tag-list .search-tag').each((i, elm) => { artist.push($(elm).text().toLowerCase()) });
    
    let title = $("meta[property='og:title']").attr("content");
    title = title.substr(0, title.lastIndexOf('|'));

    //set the thumbnail
    return {
        id:             match[1],
        type:           tags.indexOf('comic') >= 0 ? 'comic' : 'artwork',
        title:          title,
        description:    null,
        artist:         artist,
        tags:           [... new Set(tags.filter(t => artist.indexOf(t) == -1))],
        url:            `https://danbooru.donmai.us/posts/${match[1]}`,
        images:         images,
        cover:          null,
        pages:          images.length
    };


    async function getPostImage(post) {
        
        const response = await fetch(url, { method: 'GET' });
        const page =  await response.text();
        const $ = cheerio.load(page);

        let images = [];
        $('#image').each((i, elm) => { images.push($(elm).attr('src')); });
        
    }
}