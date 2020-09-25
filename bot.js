require('dotenv').config();
const scrape  = require('./scraper/index');
const fs      = require('fs');
const Discord = require('discord.js');
const discord = new Discord.Client();

let previousScrapedData = null;

const ContextConverter = {
	convert: async function(prt, type) {
		switch (type) {
			default: return false;
			case 'boolean':
				if (prt != "true" && prt  != "false" && prt != "yes" && prt != "no") return false;
				return { value: prt == "true" || prt == "yes" };
				break;
				
			case 'number':
				if (isNaN(prt)) return false;
				return { value: prt }
				
			case 'object':
			case 'string':
				return { value: prt }
				
			case 'Message':
				let msgregex = /https:\/\/discordapp.com\/channels\/.*\/(\d*)\/(\d*)/m;
				let matches = prt.match(msgregex);
				if (!matches || matches.length < 3) return false;
				
				let c = matches[1];
				let m = matches[2];
				if (!discord.channels.has(c)) return false;
				
				let msg = await discord.channels.get(c).fetchMessage(m);
				if (msg == null) return false;
				
				return { value: msg }
		}
	}
}

class Context {
	constructor(cmd, args, callback) {
		this.cmd = cmd;
		this.args = args;
		this.callback = callback;
	}
	
	async evaluate(message, parts) {
		
		//Mismatch length, so abort.
		if (parts.length != this.args.length)
			return false;
		
		//Convert the arguments
		let conv = [ message ];
		
		for (let i = 1; i < parts.length; i++) {
			let arg = this.args[i];
			let prt = parts[i];
			let result = await ContextConverter.convert(prt, arg);
			if (result.value) conv.push(result.value); else return false;
		}
		
		//Evaluate the callback
		this.callback(...conv);
		return true;
	}
}

const cmdexp = /[^\s"]+|"([^"]*)"/gi;
const commands = {
	'show': [ 
		new Context('show', [ 'Message' ], async (msg) => {
            if (!msg.channel.nsfw) return;
            if (previousScrapedData == null) {
                await msg.reply("Cannot display last scrape because there isn't any");
                return;
            } else {

                const data = previousScrapedData.data;

                //Limit illegal tags
                if (data.tags.includes('loli')) {
                    await msg.reply('Cannot display last scrape because it contains loli');
                    return;
                }

                //Limit the image count
                if (data.images.length > process.env.PAGE_LIMIT) {
                    await msg.reply('Cannot display last scrape because it contains more than '+process.env.PAGE_LIMIT+' images. Here is a link instead: ' + data.url);
                    return;
                }

                //Chunk the shit out of this message
                let message = '';
                let first = null;
                for(let i in previousScrapedData.data.images) { 
                    if (message != '' && i % 5 == 0) {
                        const sent = await msg.reply(message);
                        if (first == null) first = sent;                        
                        message = '';
                    }

                    message += `[${i}]: ` + previousScrapedData.data.images[i] + ' ';            
                }
                
                //Send the last message
                if (message != '') {
                    const sent = await msg.reply(message);                    
                    if (first == null) first = sent;
                }

                //Send a link to that message
                if (first) await msg.reply("***JUMP TO START***\n" + first.url);
            }
		}),
    ]
}

discord.on('ready', () => {
    console.log(`Logged in as ${discord.user.tag}!`);
});

//Clears embeds
discord.on('messageUpdate', async (oldMsg, msg) => {
    if (msg.author.bot) return;
    if (msg.channel.id != process.env.CHANNEL_ID) return;
    await msg.suppressEmbeds(true);
});

//Clears messages
discord.on('message', async msg => {
    if (!msg.channel.nsfw) return;
    if (msg.author.bot) return;
    if (msg.channel.id != process.env.CHANNEL_ID) return;

    //Its a link we should scrape!
    if (msg.content.trim().startsWith('http')) {
        console.log("Fetching Shit");
        
        msg.suppressEmbeds(true);
		const scraped = previousScrapedData = await scrape(msg.content);
		if (scraped.data.images.length < 2) {
			await msg.reply("Failed to fetch enough images :/");
			return;
		}
		
        const json = JSON.stringify(scraped, null, 2);
        fs.writeFile(`./bin/${scraped.scraper}-${scraped.data.id}.json`, json, (err) => {});

        if (scraped.data.tags.includes('loli')) {
            await msg.reply(`**${scraped.scraper}***\n[ contains loli ]`);
        } else {
            await msg.reply(`***${scraped.scraper}***\n_title:_ ${scraped.data.title}`);
        }
        return;
    }

    let parts = [];
	do {
		var match = cmdexp.exec(msg.content);
		if (match != null)
			parts.push(match[1] ? match[1] : match[0]);
	} while (match != null);
	
	
	if (parts.length > 0 && commands[parts[0]]) {
		let cmds = commands[parts[0]];
		for(let i in cmds) {
			//Execute the function and abort early if we were succesful
			let success = await cmds[i].evaluate(msg, parts); 
			if (success) return;
		}
	}
});

discord.login(process.env.BOT_TOKEN);