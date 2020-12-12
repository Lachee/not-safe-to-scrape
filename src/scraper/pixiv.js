const PixivApi = require('pixiv-api-client');

//example: https://www.pixiv.net/en/artworks/86149949

module.exports = async function(url) {
    const pixiv = new PixivApi();

    const regex = /pixiv.net\/\w*\/(\w*)\/(\d*)/;
    const matches = url.match(regex);
    const urlType = matches[1];
    const id = matches[2];

    await pixiv.login(process.env.PIXIV_NAME, process.env.PIXIV_PASSWORD);
    const details = await pixiv.illustDetail(id);
    const tags = details.illust.tags.map(t => (t.translated_name || t.name).toLowerCase());
    
    let type = 'artwork';
    if (urlType != 'artworks' || tags.indexOf('comic') >= 0 || tags.indexOf('manga') >= 0)
        type = 'comic';

    return {
        id:             id,
        type:           type,
        title:          details.illust.title,
        description:    details.illust.caption,
        artist:         [details.illust.user.account],
        tags:           [... new Set(tags)],
        url:            url,
        images:         details.illust.meta_pages.map(p => p.image_urls.original),
        cover:          details.illust.image_urls.medium,
        special_access: 'referer'
    }
}