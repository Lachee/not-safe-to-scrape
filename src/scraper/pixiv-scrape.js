/**
 * Scapes PIXIV using the https://github.com/Nandaka/PixivUtil2 docker image
 */
const fs = require('fs');
const child_process = require('child_process');

module.exports = async function(url) {
    const regex = /pixiv.net\/?\w*\/(\w*)\/(\d*)/;
    const matches = url.match(regex);
    const urlType = matches[1];
    const id = matches[2];

    //Process the file
    const downloadsh = process.env.PIXIV2UTIL_DIR + "/download.sh";
    child_process.execFileSync(downloadsh, [ id ]);

    //Fetch the file
    const filename = process.env.PIXIV2UTIL_DIR + `/dmp/${id}.json`;
    const json = fs.readFileSync(filename);
    const data = JSON.parse(json);
    
    //Store images
    const images = [];
    for(let i = 0; i < data.Pages; i++) {
        images.push(`${process.env.BASE_URL}/prixiv/${id}_p${i}.png`);
    }

    return {
        id:             id,
        type:           "artwork",
        title:          data.Title,
        description:    data.Caption,
        artist:         [ data["Artist Name"] ],
        tags:           data.Tags,
        url:            url,
        images:         images,
        cover:          details.illust.image_urls.medium,
        special_access: 'referer'
    }
}