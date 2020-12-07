const Scraper = require("./scraper");
const PixivApi = require('pixiv-api-client');

module.exports = class Pixiv extends Scraper {

    pixiv = null;

    constructor() {
        super();
        this.pixiv = new PixivApi();
    }

    validate(url) {
        return url.includes('pixiv');
    }

    async scrape(url) {
        const regex = /pixiv.net\/\w*\/(\w*)\/(\d*)/;
        const matches = url.match(regex);
        const type = matches[1];
        const id = matches[2];

        await this.pixiv.login(process.env.PIXIV_NAME, process.env.PIXIV_PASSWORD);
        const details = await this.pixiv.illustDetail(id);
        
        return {
            id:     id,
            type:   type == 'artwork' ? 'artwork' : 'comic',
            title:  details.illust.title,
            description: details.illust.caption,
            artist: details.illust.user.account,
            tags: [... new Set(details.illust.tags.map(t => (t.translated_name ?? t.name).toLowerCase()))],
            url: url,
            images: details.illust.meta_pages.map(p => p.image_urls.original),
            thumbnail: details.illust.image_urls.medium,
            special_access: 'referer'
        }
    }
}