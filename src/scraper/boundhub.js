const fetch = require('node-fetch');
const md5 = require('md5');
const cheerio   = require('cheerio');

const WAYMARK_CDATA = '/* <![CDATA[ */';
const WAYMARK_FLASHVARS = 'var flashvars = ';
const WAYMARK_PARAMS = 'var params = ';
const WAYMARK_BOUNDHUB = 'BoundHub - ';
const USE_EVAL_PARSE = false;

module.exports = async function (url) {


    const isAlbum = url.indexOf('/album') > 0;
    if (isAlbum)
        return await scrapeAlbum(url);
    return await scrapeVideo(url);
}

/** scrapes an album project */
async function scrapeAlbum(url) {
    // Get the metadata
    let scrapeResult = {
        id: md5(url),
        type: 'artwork',
        title: null,
        description: null,
        artist: [],
        tags: [],
        url: url,
        images: [],
        cover: null,
    };

    const response = await fetch(url, { method: 'GET' });
    const page = await response.text();
    const $ = cheerio.load(page);

    // Pull the title out
    scrapeResult.title = $('title').text();
    if (scrapeResult.title.indexOf(WAYMARK_BOUNDHUB) == 0)
        scrapeResult.title = scrapeResult.title.substr(WAYMARK_BOUNDHUB.length);

    scrapeResult.description = $("meta[property='description']").attr("content");
    scrapeResult.artist = [ $('#tab_album_info .username a').text().trim() ];
    
    let tags = [];
    $('#tab_album_info a').each((i, element) => {
        const href = $(element).attr('href');
        if (href.indexOf('/tags/') > 0)
            tags.push($(element).text());
    });
    scrapeResult.tags = [ ... new Set(tags) ];

    let images = [];
    $('.album-holder a').each((i, element) => {
        images.push($(element).attr('href'));
    });
    scrapeResult.images = [ ... new Set(images) ];
    scrapeResult.cover = scrapeResult.images[0];

    return scrapeResult;
}

/** Scrapes a URL project */
async function scrapeVideo(url) {
    // Get the metadata
    let scrapeResult = {
        id: md5(url),
        type: 'video',
        title: null,
        description: null,
        artist: [],
        tags: [],
        url: url,
        images: [],
        cover: null,
        videos: [],
    };

    const response = await fetch(url, { method: 'GET' });
    const page = await response.text();
    const $ = cheerio.load(page);

    // Pull the FlashData out
    const msp = page.indexOf(WAYMARK_CDATA);
    const mep = page.indexOf('/* ]]> */');
    const metadata = page.substr(msp, mep - msp).trim();
    const fsp = metadata.indexOf(WAYMARK_FLASHVARS) + WAYMARK_FLASHVARS.length;
    const fep = metadata.indexOf(WAYMARK_PARAMS, fsp);
    let flashvarStr = metadata.substr(fsp, fep - fsp).trim();
    flashvarStr = flashvarStr.substr(0, flashvarStr.length - 1).trim();
    const flashvars = jsobj(flashvarStr);

    // Pull the title out
    scrapeResult.title = $('title').text();
    if (scrapeResult.title.indexOf(WAYMARK_BOUNDHUB) == 0)
        scrapeResult.title = scrapeResult.title.substr(WAYMARK_BOUNDHUB.length);

    scrapeResult.description = $("meta[property='description']").attr("content");
    scrapeResult.artist = [ $('#tab_video_info .username a').text().trim() ];
    scrapeResult.tags = [ ... new Set(flashvars.video_tags.split(',').map(tag => tag.trim())) ];
    
    let images = [];
    $('#tab_screenshots a').each((i, element) => {
        images.push($(element).attr('href'));
    });
    scrapeResult.images = [ ... new Set(images) ];
    scrapeResult.cover = flashvars.preview_url;
    scrapeResult.videos = [ flashvars.video_url ];


    return scrapeResult;
}

/**
 * Parses the JavaScript Object string using either EVAL (if allowed) or CSV
 * @param {String} str the JavaScript Object as a string. This is NOT JSON.
 * @returns 
 */
function jsobj(str) {
    if (USE_EVAL_PARSE) {
        if (str[0] === '{') {
            return eval(`(${str})`);
        }
    }

    const clean = str
        .replace(/\t/g, '')
        .replace(/\n/g, '');

    const rawCSV = parseCSV(clean, "'");
    const obj = {};
    rawCSV[0].forEach(column => {
        column = column.trim();
        if (column[0] == '{')
            column = column.substr(1, column.length - 1);
        if (column[column.length - 1] == '}')
            column = column.substr(0, column.length - 1);
        
        const ioc = column.indexOf(':');
        const key = column.substr(0, ioc);
        const value = column.substr(ioc+1);
        obj[key.trim()] = value.trim();
    });

    return obj;
} 

/**
 * Parses a CSV, making sure commas are not split within quotes
 * @param {String} str 
 * @param {String} quoteMark 
 * @author https://stackoverflow.com/a/14991797/5010271
 * @returns 
 */
function parseCSV(str, quoteMark = '"') {
    const Q = quoteMark;
    const arr = [];
    let quote = false;  // 'true' means we're inside a quoted field

    // Iterate over each character, keep track of current row and column (of the returned array)
    for (let row = 0, col = 0, c = 0; c < str.length; c++) {
        let cc = str[c], nc = str[c+1];        // Current character, next character
        arr[row] = arr[row] || [];             // Create a new row if necessary
        arr[row][col] = arr[row][col] || '';   // Create a new column (start with empty string) if necessary

        // If the current character is a quotation mark, and we're inside a
        // quoted field, and the next character is also a quotation mark,
        // add a quotation mark to the current column and skip the next character
        if (cc == Q && quote && nc == Q) { arr[row][col] += cc; ++c; continue; }

        // If it's just one quotation mark, begin/end quoted field
        if (cc == Q) { quote = !quote; continue; }

        // If it's a comma and we're not in a quoted field, move on to the next column
        if (cc == ',' && !quote) { ++col; continue; }

        // If it's a newline (CRLF) and we're not in a quoted field, skip the next character
        // and move on to the next row and move to column 0 of that new row
        if (cc == '\r' && nc == '\n' && !quote) { ++row; col = 0; ++c; continue; }

        // If it's a newline (LF or CR) and we're not in a quoted field,
        // move on to the next row and move to column 0 of that new row
        if (cc == '\n' && !quote) { ++row; col = 0; continue; }
        if (cc == '\r' && !quote) { ++row; col = 0; continue; }

        // Otherwise, append the current character to the current column
        arr[row][col] += cc;
    }
    return arr;
}