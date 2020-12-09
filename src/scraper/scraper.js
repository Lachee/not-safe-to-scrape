module.exports = class Scraper {    

    /** List of available scrapers */
    static getScrapers() {
        return {
            nhentai:    { rule: /nhentai/,      file: "./nhentai.net"  },
            danbooru:   { rule: /danbooru/,     file: "./danbooru"     },
            xyz:        { rule: /xyzcomics/,    file: "./xyz"          },
            pixiv:      { rule: /pixiv/,        file: "./pixiv"        },
            deviantart: { rule: /deviantart/,   file: "./deviant"      },
            //svscomics:  { rule: /svscomics/,    file: "./svscomics.js" },
            rule34:     { rule: /rule34\.xxx/,  file: "./rule34.js" },
            image:      { rule: /\.((png)|(jpeg)|(jpg)|(gif)|(webm)|(mp4))/, file: "./image.js" },
            generic:    { rule: /.*/,           file: "./generic"      },
        }
    };

    /** Scrapes the URL */
    static async scrapeURL(url) {
        const scrapers = Scraper.getScrapers();
        for(let name in scrapers) {
            if (url.match(scrapers[name].rule)) {
                console.log("Scraping with", name);
                let data = await require(scrapers[name].file)(url);
                data.scraper = name;
                return data;
            }
        }
        return false;
    }
}