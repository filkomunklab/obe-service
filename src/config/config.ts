require('dotenv').config();

export default class Config {
  static PORT = `${process.env.PORT || 3000}`;
}
