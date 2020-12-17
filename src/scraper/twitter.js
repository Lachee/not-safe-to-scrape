const fetch     = require('node-fetch');
const cheerio   = require('cheerio');
const md5       = require('md5');

const preferNitterURL = process.env.PREFER_NITTER || false;

//example: https://twitter.com/BNn05aOL9rm9SYs/status/1339104817516429313

module.exports = nitterScrape;
async function nitterScrape(url) {
    const regex     = /((tw)|n)itter\.((com)|(net))\/(\w*)\/status\/(\w*)/;
    const matches   = url.match(regex);
    let title       = matches[7];
    let artist      = matches[6];

    console.log(matches);
    const nitterURL     = `https://nitter.net/${artist}/status/${title}`;
    const twitterURL    = `https://twitter.com/${artist}/status/${title}`;
    
    const response = await fetch(nitterURL, { method: 'GET' });
    const page =  await response.text();
    const $ = cheerio.load(page);
    
    let images = [];
    let tags = [];

    //Sort out the images
    $('.main-tweet .attachment.image img').each((i, elm) => { 
        let relative = $(elm).attr('src');
        let index = relative.lastIndexOf('%3F');
        relative = relative.substr(0, index);
        console.log('img', relative);
        images.push('https://nitter.net' + relative);
    });

    //Sort out the tags
    $('.main-tweet .tweet-content').each((i, elm) => {
        title   = $(elm).clone().children().remove().end().text();
        tags    = [];
        $(elm).find('a').each((i, telm) => {
            if ($(telm).text().startsWith('#'))
                tags.push($(telm).text().substr(1).trim().toLowerCase());
        });
    });


    //Finally return
    return {
        id:             md5(twitterURL),
        type:           'artwork',
        title:          title.trim(),
        description:    null,
        artist:         [ artist ],
        tags:           [... new Set(tags)],
        url:            preferNitterURL ? nitterURL : twitterURL,
        images:         images,
        cover:          null,
        pages:          1
    };
}

/*
const puppeteer = require('puppeteer');
async function twitterScrape(url) {
    let index = 0;
    const regex     = /twitter\.com\/(\w*)\/status\/(\w*)/;
    const matches = url.match(regex);
    let images = [];
    let tags = [];
    let title = matches[2];
    let articles = [];
    let artist = matches[1];

    //Use puppeteer to scrape the page
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    console.log('loading page...');
    await page.goto(url);
    await page.waitForSelector('div[role=progressbar]', {hidden: true});

    //Click on the show button
    console.log('pressing view...');
    await page.evaluate(() => {
        const timeout = setInterval(() => {
            document.querySelectorAll('div[role=button] span').forEach(function(elm, i) { 
                if (elm.innerText == 'View') {
                    console.log('CLICK');
                    eventFire(elm, 'click');
                }
            
                function eventFire(el, etype){
                if (el.fireEvent) {
                    el.fireEvent('on' + etype);
                } else {
                    var evObj = document.createEvent('Events');
                    evObj.initEvent(etype, true, false);
                    el.dispatchEvent(evObj);
                }
                }
            });
        }, 300);
    });
    await page.waitForSelector('img[alt=Image]', {hidden: false});
    
    //Grab the images
    console.log('Evaluating shit...');
    images      = await page.$$eval("img[alt=Image]", imgs => imgs.map(img => img.getAttribute('src')));
    tags        = await page.$$eval("a[href^=\"/hashtag\"]", tags => tags.map(tag => tag.innerText.substr(1) ));
    articles    = await page.$$eval('article', articles => articles.map(art => art.innerText));

    //Close    
    console.log('closing and returning...');
    await browser.close();
    

    //Finally return
    return {
        id:             md5(url),
        type:           'artwork',
        title:          title,
        description:    articles[0] || null,
        artist:         [ artist ],
        tags:           [... new Set(tags)],
        url:            url,
        images:         images,
        cover:          null,
        pages:          1
    };
}
*/