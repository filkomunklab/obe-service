import { Request, Response, NextFunction } from "express";
import * as yup from "yup";

const validateSchema =
  (schema: yup.ObjectSchema<any>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = req.body;
      const file = req.file;
      const payload = { ...body, file };
      await schema.validate(payload, { abortEarly: false });
      next();
    } catch (error) {
      const errors = error.inner.map((err: yup.ValidationError) => {
        return {
          field: err.path,
          message: err.message,
        };
      });
      res.status(400).json({ status: false, message: "Bad Request", errors });
    }
  };

export default validateSchema;
