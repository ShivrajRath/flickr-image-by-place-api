## Carousel api docs

This application exposes public api to get images for a particular location.
It uses node.js' [`flickrapi`](https://www.npmjs.com/package/flickrapi) package to call flickr apis.

## Run locally
Provide flickr apiKey in environment.js 
Run `yarn start` to start the node.js server. By default it would run on `3333` port of localhost

## Usage

### Getting images for a particular location:
Calling `/images/{place}/{page}/{count?}` would fetch images for a given location.

* `place` : Name for a place E.g. Seattle, NYC, London
* `page` : Page number for which the images are to be returned.
* `count` (optional): Number of images to be returned. By default it is 10.

## Technical Info

This application uses [`hapi.js`](https://hapijs.com) for wrapping node.js web server and routing.

### Fetching the image

Uses `https://www.flickr.com/services/api/` to fetch images for a particular location.

Steps:

1. Get `place_id` using `flickr.places.find`
2. Get `photos` from the `place_id` using `flickr.photos.search`
3. Form the URL for the `photo` using [misc.urls](https://www.flickr.com/services/api/misc.urls.html)



## Out of scope (Should be developed for future)

1. Prevent api key expiry by handling rate limit threshold
2. A better logging framework



