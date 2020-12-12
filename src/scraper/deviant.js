const fetch     = require('node-fetch');
const cheerio   = require('cheerio');

//example: https://danbooru.donmai.us/posts/4237731

module.exports = async function(url) {
    
    url = url.trim();
    const regex = /deviantart\.com\/([a-zA-Z0-9-]*)\/.*/;
    const matches = url.match(regex);
    const username = matches[1];

    //const response = await fetch(url, { method: 'GET' });
    //const page =  await response.text();
    //const $ = cheerio.load(page);
    //const contentUrl = $('meta[property="da:appurl"]').attr('content');
    //const uuid = contentUrl.substr(contentUrl.lastIndexOf('/')+1);
    //console.log('uuid', uuid);

    const oauthToken = await getDeviantToken(process.env.DEVIANT_CLIENT_ID, process.env.DEVIANT_CLIENT_SECRET);
    //console.log('accessToken', oauthToken);

    let page = 0;
    let pageLimit = 24;
    let metadata = null;
    while (metadata == null && page < 15) {
        console.log('looking at', page);
        const offset = (page++) * pageLimit;
        const response = await fetch(`https://www.deviantart.com/api/v1/oauth2/gallery/all?username=${username}&calculate_size=false&mature_content=true&access_token=${oauthToken['access_token']}&offset=${offset}&limit=${pageLimit}`);
        const listing = await response.json();
        
        //Look for the record that has the correct url
        const allResults = listing.results.filter(r => r.url.endsWith(matches[0]));
        if (allResults.length > 0) {
            //metadata = allResults[0];
            const uuid = allResults[0].deviationid;
            const metadataResponse = await fetch(`https://www.deviantart.com/api/v1/oauth2/deviation/metadata?access_token=${oauthToken['access_token']}&deviationids%5B%5D=${uuid}&mature_content=true`, { method: 'GET' });
            metadata = (await metadataResponse.json()).metadata[0];

            //Copy over some important shit
            metadata.content    = allResults[0].content;
            metadata.url        = allResults[0].url;
            break;
        }
        
        //Finally give up is there is no more
        if (!listing.has_more) break;
    }

    if (metadata == null) {
        return null;
    }

    //const deviationResponse = await fetch(`https://www.deviantart.com/api/v1/oauth2/deviation/${uuid}?access_token=${oauthToken['access_token']}`, { method: 'GET' });
    //const deviant = await deviationResponse.json();

    //const metadataResponse = await fetch(`https://www.deviantart.com/api/v1/oauth2/deviation/metadata?access_token=${oauthToken['access_token']}&deviationids%5B%5D=${uuid}&mature_content=true`, { method: 'GET' });
    //const metadata = (await metadataResponse.json()).metadata[0];

    const tags = metadata.tags.map(t => t.tag_name);

    //set the thumbnail
    return {
        id:             metadata.deviationid,
        type:           tags.indexOf('comic') >= 0 ? 'comic' : 'artwork',
        title:          metadata.title,
        description:    metadata.description,
        artist:         [ metadata.author.username ],
        tags:           [... new Set(tags)],
        url:            metadata.url,
        images:         [ metadata.content.src ],
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
