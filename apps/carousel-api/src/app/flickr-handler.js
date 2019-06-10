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
      console.log("Trying flickr public auth");
      flickrapi.tokenOnly(
        {
          api_key: environment.apiKey
        },
        (err, flickr) => {
          if (!err) {
            flickrAPI = flickr;
            console.log("flickr public auth successful");
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
    const self = this;
    console.log(`Fetching place id for ${this.place}`);
    // races to timeout
    return Promise.race([
      new Promise((resolve, reject) => {
        if (!flickrAPI) {
          self.public_auth();
          reject();
        }
        this.placeID = CacheHandler.getFromCache(this.place);
        if (this.placeID) {
          console.log(`found placeid from ${this.place} cache`);
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
                  console.log(`found placeid for ${this.place}`);
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
      }),
      new Promise(resolve => setTimeout(() => resolve(this), 4000))
    ]);
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
      let queryObj = {
        page: this.page,
        safe_search: true,
        privacy_filter: 1,
        content_type: 1,
        sort: "interestingness-desc",
        media: "photos",
        tags: this.place,
        geo_context: 2,
        per_page: this.count
      };

      if (this.placeID) {
        console.log(`query with placeid for ${this.place}`);
        queryObj = { ...queryObj, ["place_id"]: this.placeID };
      } else {
        console.log(`query without placeid for ${this.place}`);
      }

      flickrAPI.photos.search(queryObj, (err, data) => {
        if (!err) {
          resolve(this.transform(data));
        } else {
          console.log(err);
          resolve(this.getEmpty());
        }
      });
    });
  }
}
