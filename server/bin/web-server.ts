import chalk from 'chalk';
import fastify from 'fastify';
import fs from 'fs';

import type {FastifyInstance} from 'fastify';
import type {Http2SecureServer} from 'http2';
import type {Server} from 'http';

import config from '../../config';
import constructRoutes from '../routes';
import packageJSON from '../../package.json';

const startWebServer = async () => {
  const {ssl, floodServerHost: host, floodServerPort: port} = config;

  let instance: FastifyInstance<Http2SecureServer> | FastifyInstance<Server>;

  if (ssl) {
    if (!config.sslKey || !config.sslCert) {
      console.error('Cannot start HTTPS server, `sslKey` or `sslCert` is missing in config.js.');
      process.exit(1);
    }

    instance = fastify({
      trustProxy: 'loopback',
      http2: true,
      https: {
        allowHTTP1: true,
        key: fs.readFileSync(config.sslKey),
        cert: fs.readFileSync(config.sslCert),
      },
    });
  } else {
    instance = fastify({trustProxy: 'loopback'});
  }

  await constructRoutes(instance as FastifyInstance);

  await instance.listen(port, host);

  const address = chalk.underline(`${ssl ? 'https' : 'http'}://${host}:${port}`);

  console.log(chalk.green(`Flood server ${packageJSON.version} starting on ${address}\n`));

  if (config.authMethod === 'none') {
    console.log(chalk.yellow('Starting without builtin authentication\n'));
  }

  if (config.serveAssets === false) {
    console.log(chalk.blue('Static assets not served\n'));
  }
};

export default startWebServer;
