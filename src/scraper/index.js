module.exports = async function(url) {
    const scrapers = {
        nhentai: new (require("./nhentai.net"))(),
        danbooru: new (require('./danbooru'))(),
        xyz: new (require("./xyz"))(),
        pixiv: new (require("./pixiv"))(),
        generic: new (require("./generic"))(),
    };

    //Find hte best scrapper
    for(let name in scrapers) {
        if (scrapers[name].validate(url)) {

            //Scrape with it
            console.log("Scraping with", name);
            let data = await scrapers[name].scrape(url);
            data.scraper = name;
            return data;
        }
    }

    return false;
}