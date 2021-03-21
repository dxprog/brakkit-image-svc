import cluster from 'cluster';
import os from 'os';

import { App } from './src/app';

// Legacy import
const program = require('commander');

const DEFAULT_PORT: number = 4100;

program
  .version(require('./package.json').version)
  .option('-p, --port <n>', 'Port', parseInt)
  .parse(process.argv);

if (cluster.isMaster) {
  // we don't expect this to be called much. one process for
  // every other core (with a minimum of one, of course)
  const processCount = Math.ceil(os.cpus().length / 2);

  console.log(`Master process spinning up ${processCount} children`);

  for (let i = 0; i < processCount; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Process ${worker.process.pid} died`);
    // re-fork a new process to keep the pool going
  });
} else {
  const app = new App({
    port: program.port || DEFAULT_PORT
  });
  app.start().then(() => {
    console.log(`Process ${process.pid} is running`);
  });
}
