module.exports = async function(url) {
    const scrapers = {
        nhentai: new (require("./nhentai.net"))(),
        danbooru: new (require('./danbooru'))(),
        generic: new (require("./generic"))(),
    };

    //Find hte best scrapper
    for(let name in scrapers) {
        if (scrapers[name].validate(url)) {

            //Scrape with it
            console.log("Scraping with", name);
            const data = await scrapers[name].scrape(url);
            return { scraper: name, data: data };
        }
    }

    return false;
}