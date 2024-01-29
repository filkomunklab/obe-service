import express, { Router } from 'express';

const RouterPing = express.Router();

RouterPing.get('/', (req, res) => {
  res.json({
    status: true,
    message: 'pong',
  });
});

export default RouterPing;
