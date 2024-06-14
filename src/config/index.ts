export default class Config {
  static PORT = `${process.env.PORT || 3000}`;
  static SECRET_KEY = `${process.env.SECRET_KEY || "secret"}`;
}
