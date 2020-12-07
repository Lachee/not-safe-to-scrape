# Not Safe to Scrape
NSTS is a web scraper that specializes in NSFW content. It is able to scrape titles, descriptions tags and multiple images from numerious websites and provides a small web service (or discord bot) to scrape the contents of any site.

## Supported Sites
* Danbooru
* NHentai
* XYZ
* _everything else!*_

**Generic Support**

The scraper tries its best to scrape sites it does not have direct support for. The generic scraper will look for common patterns in the HTML, or large groups of images and return those.

## Response
The scraper does not download any content, it will just return hot links to the resources from the site. The response looks like
| Name | Type | Description |
|-----------|-----------|--------------------|
|id			| string 	| unique identifier of the particular page for the scraped site. |
|scraper| string | unique identifier of what scraper was used for the image |
|type   | string  | type of content. Either `artwork`, `comic`, `video`  |
|title		| string	| the name of the image/comic/article/page. |
|description| string	| the description of the image/comic/article/page. |
|artist| string | the name of the artist
|tags		| string[]	| list of tags that are on the page. This maybe empty as some pages do not have tags. |
|languages	| ?string[]	| list of languages that the comic is in. Optional. |
|url		| string 	| original URL of the website. |
|images		| string[] 	| list of image URLs to the best quality available of the image. |
|thumbnail| string | the first image URL, or a suitable thumbnail to display |
|special_access| ?bool | indicates that the images are stuck behind either authorization or referer. Either way, you require special access to get to the image. |

_?type denotes optional, type? denotes nullable_
