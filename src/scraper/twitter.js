const fetch     = require('node-fetch');
const puppeteer = require('puppeteer');
const md5       = require('md5');

//example: https://danbooru.donmai.us/posts/4237731

module.exports = async function(url) {
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
    page.goto(url);
    await page.waitForSelector('div[role=progressbar]', {hidden: true});

    //Click on the show button
    await page.evaluate(() => {
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
    });
    console.log('Point', index++);
    await page.waitForSelector('img[alt=Image]', {hidden: false});
    
    //Grab the images
    console.log('Point', index++);
    images      = await page.$$eval("img[alt=Image]", imgs => imgs.map(img => img.getAttribute('src')));
    console.log('Point', index++);
    tags        = await page.$$eval("a[href^=\"/hashtag\"]", tags => tags.map(tag => tag.innerText.substr(1) ));
    console.log('Point', index++);
    articles    = await page.$$eval('article', articles => articles.map(art => art.innerText));
    //Close
    console.log('Point', index++);
    await browser.close();
    console.log('Point', index++);

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
