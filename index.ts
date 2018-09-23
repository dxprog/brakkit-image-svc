import * as cluster from 'cluster';
import * as os from 'os';

import { App } from './src/app';

// Legacy import
const program = require('commander');

const DEFAULT_PORT: number = 4100;

program
  .version(require('./package.json').version)
  .option('-p, --port <n>', 'Port', parseInt)
  .parse(process.argv);

if (cluster.isMaster) {
  // Spin up two processes per CPU
  const processCount = os.cpus().length * 2;

  console.log(`Master process spinning up ${processCount} children`);

  for (let i = 0; i < processCount; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Process ${worker.process.pid} died`);
  });
} else {
  const app = new App({
    port: program.port || DEFAULT_PORT
  });
  app.start().then(() => {
    console.log(`Process ${process.pid} is running`);
  });
}