/**
 * This is a collection on queries to flickr api
 */

import flickrapi from "flickrapi";
import CacheHandler from "./cache-handler";
import { environment } from "../../environments/environment";

let flickrAPI;

export default class FlickrHandler {
  constructor({ place, page = 1, count = 10 }) {
    this.place = place.trim();
    this.page = page;
    this.count = count;
    return this;
  }

  /***
   * Gets the API object to call Flickr APIs
   */
  static async public_auth() {
    new Promise((resolve, reject) => {
      flickrapi.tokenOnly(
        {
          api_key: environment.apiKey,
          secret: environment.apiSecret,
          progress: false
        },
        (err, flickr) => {
          if (!err) {
            flickrAPI = flickr;
            resolve();
          } else {
            console.log(err);
            reject(err);
          }
        }
      );
    });
  }

  /**
   * Returns flickrs place id for a place key
   * @param {string} placeKey user entered key for a place (e.g NYC, Seattle)
   */
  async getPlaceID() {
    // console.debug("in getPlaceID");
    return new Promise((resolve, reject) => {
      if (!flickrAPI) {
        reject();
      }
      this.placeID = CacheHandler.getFromCache(this.place);
      if (this.placeID) {
        // console.debug("found placeid from cache");
        resolve(this);
      } else {
        flickrAPI.places.find(
          {
            query: this.place
          },
          (err, data) => {
            try {
              if (!err) {
                // Returns the first found place id,
                // expects users to be as specific in their search
                this.placeID = data.places.place[0].place_id;
                // console.debug("found placeid api");
                CacheHandler.setToCache(this.place, this.placeID);
              }
            } catch (ex) {
              console.log(ex);
              this.placeID = null;
            }
            resolve(this);
          }
        );
      }
    });
  }

  /**
   * Returns image URL from image object
   * Reference: https://www.flickr.com/services/api/misc.urls.html
   * @param {Object} imgObj
   */
  getImageURL({ farm, server, id, secret }) {
    return `https://farm${farm}.staticflickr.com/${server}/${id}_${secret}_b.jpg`;
  }

  getEmpty() {
    return {
      page: this.page,
      perpage: this.count,
      photo: []
    };
  }

  /**
   * Transforms the api result into URL and title
   */
  transform(data) {
    try {
      // console.debug("in transform data");
      data.photos.photo = data.photos.photo
        .map(img => {
          if (img.farm && img.server && img.id && img.secret) {
            return {
              id: img.id,
              title: img.title,
              url: this.getImageURL(img)
            };
          }
        })
        .filter(photo => photo);
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
    return new Promise(resolve => {
      // console.debug("making place_id photo search");
      flickrAPI.photos.search(
        {
          page: this.page,
          safe_search: true,
          privacy_filter: 1,
          content_type: 1,
          sort: "relevance",
          media: "photos",
          tags: this.place,
          geo_context: 2,
          per_page: this.count,
          place_id: this.placeID
        },
        (err, data) => {
          if (!err) {
            resolve(this.transform(data));
          } else {
            console.log(err);
            resolve(this.getEmpty());
          }
        }
      );
    });
  }
}
