import Hapi from '@hapi/hapi';
import QueryHandler from './app/query-handler';
import FlickrHandler from './app/flickr-handler';
import {
  environment
} from '../environments/environment';

const init = async () => {
  const server = Hapi.server({
    port: environment.port,
    host: environment.host
  });

  // creates the flickr API object
  FlickrHandler.public_auth();

  // API routes
  server.route({
    method: 'GET',
    path: '/images/{place}/{page}/{count?}',
    handler: async (request, reply) => await QueryHandler.getGeoImages(request, reply)
  });

  // 404 default
  server.route({
    method: '*',
    path: '/{any*}',
    handler: QueryHandler.notfound
  });

  await server.start();
  console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', err => {
  console.log(err);
  process.exit(1);
});

init();
