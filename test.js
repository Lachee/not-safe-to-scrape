
const scrape  = require('./scraper');

const URL = "https://nhentai.net/g/327520/";
scrape(URL).then(data => {
  console.log("SCRAPED", data);
});

/*
const MIN_IMAGE_SIZE = 25 * 1000;

(async () => {
  const { data, response } = await scrapeIt(URL, {
    title: ".header h2",
    desc: ".header h2",
    images: {
      listItem: "img",
      data: {
        src: {
          attr: "src"
        }
      }
    },
  });

  let promises = [];
  for(let i in data.images) {
    const img = data.images[i];
    if (!img.src.startsWith('http')) continue;

    promises.push(fetch(img.src, {
      method: 'HEAD'
    }));
  }

  let results = await Promise.all(promises);
  for(let i in results) {
    const result = results[i];
    if (result.status != 200) continue;

    const type = result.headers.get('content-type');
    const length = result.headers.get('content-length');
    if (!type.startsWith('image/')) continue;
    if (length < MIN_IMAGE_SIZE) continue;

    console.log(result.url);
  }



})().then(() => {
    console.log("DONE");
})*/