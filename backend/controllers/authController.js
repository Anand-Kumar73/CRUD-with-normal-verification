
// Password ko securely hash/compare karne ke liye bcrypt use kar rahe hain
import bcrypt from "bcryptjs";

// Login ke baad JWT token generate karne ke liye
import jwt from "jsonwebtoken";

// PostgreSQL database se connection/pool import kar rahe hain
import pool from "../config/db.js";


//REGISTER 

// User ko register karne ka function
export const register = async (req, res) => {
  try {

    // Frontend se name, email aur password le rahe hain
    const { name, email, password } = req.body;

    // Check kar rahe hain ki koi field empty toh nahi hai
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required"
      });
    }

    // Database me check kar rahe hain ki ye email pehle se registered hai ya nahi
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    // Agar email mil gaya, matlab user already registered hai
    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        message: "Email already exists"
      });
    }

    // Password ko hash/encrypt jaisa secure format me convert kar rahe hain
    // 10 = salt rounds
    const hashedPassword = await bcrypt.hash(password, 10);

    // Database me new user insert kar rahe hain
    const result = await pool.query(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at`,
      [name, email, hashedPassword]
    );

    // Registration successful response frontend ko bhej rahe hain
    // Password return nahi kar rahe hain
    return res.status(201).json({
      message: "User registered successfully",
      user: result.rows[0],
    });

  } catch (error) {

    // Agar database/server me koi error aaye toh terminal me show hoga
    console.error(error);

    // Client ko server error response
    return res.status(500).json({
      message: "Server error"
    });
  }
};


//LOGIN

// User ko login karne ka function
export const login = async (req, res) => {
  try {

    // Frontend se email aur password le rahe hain
    const { email, password } = req.body;

    // Check kar rahe hain ki email/password diya gaya hai ya nahi
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    // Database me email ke according user search kar rahe hain
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    // Agar user nahi mila
    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    // Database se user ka data nikal rahe hain
    const user = result.rows[0];

    // User ke entered password ko database ke hashed password se compare kar rahe hain
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    // Agar password match nahi hua
    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    // Login successful hone par JWT token create kar rahe hain
    // Token ke andar user ki id aur email store ho raha hai
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email
      },

      // JWT_SECRET .env file se aa raha hai
      process.env.JWT_SECRET,

      // Token sirf 1 hour ke liye valid rahega
      {
        expiresIn: "1h"
      }
    );

    // Login successful response frontend ko bhej rahe hain
    return res.json({
      message: "Login successful",

      // Frontend ko JWT token de rahe hain
      token,

      // User ki basic information bhej rahe hain
      // Password nahi bhej rahe
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {

    // Agar koi server/database error aaye
    console.error(error);

    // Client ko server error bhej rahe hain
    return res.status(500).json({
      message: "Server error"
    });
  }
};

