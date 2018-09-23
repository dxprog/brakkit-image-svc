import * as express from 'express';
import * as http from 'http';

import { bannerHandler } from './routes/banner';
import { cardHandler } from './routes/card';

export interface AppOptions {
  port: number;
}

export class App {
  private port: number;
  private app: express.Express;
  private server: http.Server;

  constructor(options: AppOptions) {
    this.port = options.port;
    this.app = express();
    this.server = http.createServer(this.app);
    this._bindRoutes();
  }

  start() {
    return new Promise((resolve, reject) => {
      this.server.listen(this.port, (err: any) => {
        if (!err) {
          resolve();
        } else {
          reject(err);
        }
      });
    });
  }

  stop() {
    this.server.close();
  }

  _bindRoutes() {
    this.app.get('/banner/:perma', bannerHandler);
    this.app.get('/card/:perma', cardHandler);
  }

};