import express, { Application, Router } from 'express';
import http from 'http';
import Config from './config/config';

//Router List
import RouterPing from './routes/ping';

const app: Application = express();
const httpServer = http.createServer(app);
const RouterApi = Router();

app.use(express.json());

app.use('/api', RouterApi);
(async () => {
  try {
    RouterApi.use('/ping', RouterPing);

    httpServer.listen(Config.PORT, () =>
      console.log(`Server running on port ${Config.PORT}`)
    );
  } catch (error) {
    console.log(`Error: ${error}`);
  }
})();
