const scrapeIt  = require('scrape-it');

module.exports = async function(url) {
    const regex = /nhentai.net\/g\/([0-9]+)\//;
    const found = url.match(regex);
    if (found.length == 0 || found.length < 2) { 
        console.error("Failed to match anything");
        return false;
    }

    const base = `https://nhentai.net/g/${found[1]}/`;
    const { data } = await scrapeIt(base, {
        title:  { selector: "#info .title", eq: 0 },
        tags: { listItem: '.tags .tag[href^="/tag"] .name' },
        languages: { listItem: '.tags .tag[href^="/language"] .name' },
        artist: { listItem: '.tags .tag[href^="/artist"] .name' },
        pages: {
            selector: '.tags .tag[href^="/search/?q=pages"] .name',
            convert: parseInt
        },
        cover: {
            selector: '#cover img',
            attr: 'data-src',
        },
    });


    //Load up the images
    let images = [];
    const galleryID = data.cover.match(/\/galleries\/([0-9]+)\//)[1];
    for(let page = 1; page < data.pages+1; page++) {
        images.push(`https://i.nhentai.net/galleries/${galleryID}/${page}.jpg`);
    }

    //set the thumbnail
    return {
        id:             found[1],
        type:           'comic',
        title:          data.title,
        description:    null,
        artist:         data.artist[0] ?? null,
        tags:           [... new Set(data.tags.map(t => t.toLowerCase()))],
        languages:      [... new Set(data.languages.map(t => t.toLowerCase()))],
        url:            base,
        images:         images,
        thumbnail:      data.cover,
        pages:          data.pages
    };

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