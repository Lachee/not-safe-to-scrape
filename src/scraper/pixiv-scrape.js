/**
 * Scapes PIXIV using the https://github.com/Nandaka/PixivUtil2 docker image
 */
const fs = require('fs');
const child_process = require('child_process');
const glob = require('glob');

module.exports = async function(url) {
    const regex = /pixiv.net\/?\w*\/(\w*)\/(\d*)/;
    const matches = url.match(regex);
    const urlType = matches[1];
    const id = matches[2];

    //Process the file
    const downloadsh = process.env.PIXIV2UTIL_DIR + "/download.sh";
    child_process.execFileSync(downloadsh, [ id ], { cwd: process.env.PIXIV2UTIL_DIR, stdio: 'inherit' });

    //Fetch the file
    const filename = process.env.PIXIV2UTIL_DIR + `/dmp/${id}.json`;
    const json = fs.readFileSync(filename);
    const data = JSON.parse(json);
    
    //Store images
    const images = [];
    glob(`${process.env.PIXIV2UTIL_DIR}/dmp/${id}_*.*`, options, function (er, files) {
        console.log('files', er, files);
        for(let k in files) {
            const filename = files[k];
            const pos = filename.lastIndexOf('/');
            const name = filename.substr(pos + 1);
            console.log(filename, name);
            images.push(`${process.env.BASE_URL}/api/scrape/pixiv/${name}`);
        }
    });

    return {
        id:             id,
        type:           "artwork",
        title:          data.Title,
        description:    data.Caption,
        artist:         [ data["Artist Name"] ],
        tags:           data.Tags,
        url:            url,
        images:         images,
        cover:          null,
        special_access: 'referer'
    }
}