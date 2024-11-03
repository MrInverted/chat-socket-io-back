import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "./database.js";

const router = express.Router();

const isAllFields = (req, res, next) => {
  const { login, password } = req.body;

  if (!login || !password) return res.status(400).json({ err: "Some of the fields are empty" });

  next();
}

router.post("/register", isAllFields, async (req, res) => {
  try {
    const { login, password } = req.body;

    const isAlreadyExists = await User.findOne({
      where: { login: login }
    })

    if (isAlreadyExists) return res.status(400).json({ err: "User is already exist" });

    const passwordHash = await bcrypt.hash(password, 2);

    const user = await User.create({
      login,
      password: passwordHash
    });

    const { password: p, ...userWithoutPassword } = user.toJSON();

    const token = jwt.sign(userWithoutPassword, "secret-key");

    return res.json({
      success: true,
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    return res.status("500").json({ err: error })
  }
})

router.post("/login", isAllFields, async (req, res) => {
  try {
    const { login, password } = req.body;

    const isUser = await User.findOne({
      where: { login }
    })

    if (!isUser) return res.status(400).json({ err: "No user is found with this login" });

    const user = isUser.toJSON();

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) return res.status(400).json({ err: "Wrong password" });

    const { password: p, ...userWithoutPassword } = user;

    const token = jwt.sign(userWithoutPassword, "secret-key");

    return res.json({
      success: true,
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    return res.status("500").json({ err: error })
  }
})

router.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization;

    if (!token) return res.status(401).json({ err: "Token is missed" });

    let isVeryfied;

    try {
      isVeryfied = jwt.verify(token, "secret-key");
    } catch (error) {
      return res.status(401).json({ err: "Token is invalid" });
    }

    const user = await User.findByPk(isVeryfied.id);

    return res.json({
      success: true,
      token, user
    })

  } catch (error) {
    return res.status("500").json({ err: error })
  }
})



export { router }