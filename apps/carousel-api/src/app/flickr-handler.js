/**
 * This is a collection on queries to flickr api
 */

import flickrapi from 'flickrapi';
import CacheHandler from './cache-handler'
import {
  environment
} from '../../environments/environment'


let flickrAPI;

export default class FlickrHandler {
  constructor({
    place,
    page = 1,
    count = 10
  }) {
    this.place = place;
    this.page = page;
    this.count = count;
    return this;
  }

  /***
   * Gets the API object to call Flickr APIs
   */
  static async public_auth() {
    new Promise((resolve, reject) => {
      flickrapi.tokenOnly({
        api_key: environment.apiKey
      }, (err, flickr) => {
        if (!err) {
          flickrAPI = flickr;
          resolve();
        } else {
          reject(err);
        }
      });
    });
  }

  /**
   * Returns flickrs place id for a place key
   * @param {string} placeKey user entered key for a place (e.g NYC, Seattle)
   */
  async getPlaceID() {
    return new Promise(resolve => {
      this.placeID = CacheHandler.getFromCache(this.place);
      if (this.placeID) {
        resolve(this);
      } else {
        flickrAPI.places.find({
          query: this.place
        }, (err, data) => {
          try {
            if (!err) {
              // Returns the first found place id, 
              // expects users to be as specific in their search
              this.placeID = data.places.place[0].place_id;
              CacheHandler.setToCache(this.place, this.placeID);
            }
          } catch (ex) {
            console.log(ex);
            this.placeID = null;
          }
          resolve(this);
        })
      }
    });
  }

  /**
   * Returns image URL from image object
   * Reference: https://www.flickr.com/services/api/misc.urls.html
   * @param {Object} imgObj 
   */
  getImageURL({
    farm,
    server,
    id,
    secret
  }) {
    return `https://farm${farm}.staticflickr.com/${server}/${id}_${secret}_b.jpg`
  }

  getEmpty() {
    return {
      "page": this.page,
      "perpage": this.count,
      "photo": []
    }
  }

  /**
   * Transforms the api result into URL and title
   */
  transform(data) {
    try {
      data.photos.photo = data.photos.photo.map(img => {
        return {
          title: img.title,
          url: this.getImageURL(img)
        }
      });
      return data.photos;
    } catch (ex) {
      console.log(ex);
      return this.getEmpty();
    }
  }

  /**
   * Returns Images for a place ID
   */
  async getImages() {
    return new Promise((resolve, reject) => {
      flickrAPI.photos.search({
        page: this.page,
        safe_search: true,
        per_page: this.count,
        place_id: this.placeID
      }, (err, data) => {
        if (!err) {
          resolve(this.transform(data));
        } else {
          resolve(this.getEmpty())
        }
      });
    });
  }
}
