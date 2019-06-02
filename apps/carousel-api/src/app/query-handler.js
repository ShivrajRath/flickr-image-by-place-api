/**
 * Handler for HTTP queries
 */
import FlickrHandler from './flickr-handler';

export const HTTP_CODES = {
  'NOT_FOUND': {code: 404, message: 'Page Not Found'},
  'ISE': {code: 500, message: 'OOPS!!! Something went wrong'}
};

export default class QueryHandler {

  static async getGeoImages(request, reply) {
    try{
      const images = await (await new FlickrHandler(request.params).getPlaceID()).getImages();
      return reply.response(images);
    }catch(err){
      console.log(err);
      return reply.response(HTTP_CODES.ISE.message).code(HTTP_CODES.ISE.code);
    }
  }
  
  static notfound(request, reply) {
    return reply.response(HTTP_CODES.NOT_FOUND.message).code(HTTP_CODES.NOT_FOUND.code);
  }
}
