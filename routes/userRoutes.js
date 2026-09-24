import express from "express";

import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../controller/userController.js";

import authMiddleware from "../middlewere/authMiddleware.js";

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  getUsers
);

router.post(
  "/",
  authMiddleware,
  createUser
);

router.put(
  "/:id",
  authMiddleware,
  updateUser
);

router.delete(
  "/:id",
  authMiddleware,
  deleteUser
);

export default router;
