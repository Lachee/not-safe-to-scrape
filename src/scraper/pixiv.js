const fetch = require('node-fetch');

//example: https://www.pixiv.net/en/artworks/86149949

module.exports = async function(url) {

    const regex = /pixiv.net\/?\w*\/(\w*)\/(\d*)/;
    const matches = url.match(regex);
    const urlType = matches[1];
    const id = matches[2];

    const response = await fetch(`https://www.pixiv.net/ajax/illust/${id}`, {});
    const data =  await response.json();
    if (data.error) {
        console.error('Failed ', data.message);
        return null;
    }

    const tags = data.body.tags.tags.map(t => t.tag);
    const pages = data.body.pageCount;

    let images = [];
    for(let i = 0; i < pages; i++) {
        const imageUrl = data.body.urls.original.replace("_p0", `_p${i}`);
        images.push(imageUrl);
    }

    return {
        id:             id,
        type:           "artwork",
        title:          data.body.title,
        description:    data.body.description,
        artist:         [ data.body.userName ],
        tags:           [ ...new Set(tags) ],
        url:            url,
        images:         images,
        cover:          null,
        special_access: 'referer'
    };
}
