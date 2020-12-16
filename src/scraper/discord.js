const fetch     = require('node-fetch');
const md5       = require('md5');

//example: https://cdn.discordapp.com/attachments/741235846333595669/785374267130904617/Xdb0Fug.jpg

module.exports = async function(url) {
    const regex = /(\w*).discordapp.\w*\/attachments\/(\w*)\/(\w*)\/(\w*).((png)|(jpe?g))/;
    const matches = url.match(regex);
    
    let title   = matches[4];
    let id      = md5(matches[2] + matches[3] + matches[4]);
    let hotlink = `https://cdn.discordapp.com/attachments/${matches[2]}/${matches[3]}/${matches[4]}.${matches[5]}`;

    return {
        id:             id,
        type:           'artwork',
        title:          title,
        description:    null,
        artist:         null,
        tags:           [ ],
        url:            hotlink,
        images:         [ hotlink ],
        cover:          null,
    };
}