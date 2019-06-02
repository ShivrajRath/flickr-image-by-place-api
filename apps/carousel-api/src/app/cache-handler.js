/**
 * Implements a simple in-memory caching to store the place_id
 * This avoids extra call to the flickr API to get the place_id
 */
let _cache = {};
export default class CacheHandler {
  static getFromCache(key) {
    return _cache[key];
  }

  static setToCache(key, value) {
    _cache[key] = value;
  }

  static clearCache(){
    _cache = {};
  }
}