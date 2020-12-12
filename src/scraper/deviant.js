const fetch     = require('node-fetch');
const cheerio   = require('cheerio');

//example: https://danbooru.donmai.us/posts/4237731

module.exports = async function(url) {
    
    const response = await fetch(url, { method: 'GET' });
    const page =  await response.text();
    const $ = cheerio.load(page);

    const contentUrl = $('meta[property="da:appurl"]').attr('content');
    const uuid = contentUrl.substr(contentUrl.lastIndexOf('/')+1);
    //console.log('uuid', uuid);

    const oauthToken = await getDeviantToken(process.env.DEVIANT_CLIENT_ID, process.env.DEVIANT_CLIENT_SECRET);
    //console.log('accessToken', oauthToken);

    const deviationResponse = await fetch(`https://www.deviantart.com/api/v1/oauth2/deviation/${uuid}?access_token=${oauthToken['access_token']}`, { method: 'GET' });
    const deviant = await deviationResponse.json();

    const metadataResponse = await fetch(`https://www.deviantart.com/api/v1/oauth2/deviation/metadata?access_token=${oauthToken['access_token']}&deviationids%5B%5D=${uuid}&mature_content=true`, { method: 'GET' });
    const metadata = (await metadataResponse.json()).metadata[0];

    const tags = metadata.tags.map(t => t.tag_name);

    //set the thumbnail
    return {
        id:             uuid,
        type:           tags.indexOf('comic') >= 0 ? 'comic' : 'artwork',
        title:          metadata.title,
        description:    metadata.description,
        artist:         [ deviant.author.username ],
        tags:           [... new Set(tags)],
        url:            deviant.url,
        images:         [ deviant.content.src ],
        cover:          null,
        pages:          1
    };


    async function getPostImage(post) {
        
        const response = await fetch(url, { method: 'GET' });
        const page =  await response.text();
        const $ = cheerio.load(page);

        let images = [];
        $('#image').each((i, elm) => { images.push($(elm).attr('src')); });
        
    }

    async function getDeviantToken(clientId, clientSecret) {
        const url = `https://www.deviantart.com/oauth2/token?grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`;
        const response = await fetch(url, { method: 'GET' });
        return await response.json();
    }
}
