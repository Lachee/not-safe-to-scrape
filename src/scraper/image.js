const fetch     = require('node-fetch');
const md5       = require('md5');

//example: https://cdn.discordapp.com/attachments/741235846333595669/785374267130904617/Xdb0Fug.jpg

module.exports = async function(url) {
    return {
        id:             md5(url),
        type:           'artwork',
        title:          url,
        description:    null,
        artist:         null,
        tags:           [ ],
        url:            url,
        images:         [ url ],
        cover:          null,
    };
}