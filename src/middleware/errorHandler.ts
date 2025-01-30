import { ErrorRequestHandler } from "express";
import { z } from "zod";


const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  console.log(`Path: ${req.path}`, error);

  if (error instanceof z.ZodError) {
    // const errors = error.issues.map((err) => { return { path: err.path, message: err.message } })
    res.status(400).json({
      message: "Invalid input",
    })
  } else {
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export default errorHandler;