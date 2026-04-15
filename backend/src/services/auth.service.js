import ApiError from "../utils/ApiError.js";
import { HTTP_STATUS } from "../utils/constants.js";
import bcrypt from "bcrypt";
import pool from "../configs/db.js";
import jwt from "jsonwebtoken";

export const genrateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, user_name: user.user_name, user_email: user.user_email },
    process.env.ACCESS_TOKEN,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
    },
  );
};

export const genrateRefreshToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
  });
};

export const registerUser = async ({
  user_name,
  user_email,
  user_password,
  account_type,
}) => {
  let values = [user_name, user_email, user_password, account_type].map(
    (field) => field?.trim(),
  );

  if (values.some((field) => !field)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "All fields are required");
  }

  if (values[2].length < 6) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Password must be at least 6 characters long",
    );
  }

  values[1] = values[1].toLowerCase();

  const allowedAccountTypes = ["student", "working_professional", "other"];
  if (!allowedAccountTypes.includes(values[3])) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid account type");
  }

  const existingUserQuery = `
      SELECT id FROM users
      WHERE user_email = $1
      LIMIT 1
    `;
  const existingUser = await pool.query(existingUserQuery, [values[1]]);

  if (existingUser.rows.length > 0) {
    throw new ApiError(
      HTTP_STATUS.CONFLICT,
      "User already exists with this email. Please use another email.",
    );
  }

  values[2] = await bcrypt.hash(values[2], 10);

  const insertQuery = `
      INSERT INTO users (user_name, user_email, user_password, account_type)
      VALUES ($1, $2, $3, $4)
      RETURNING id, user_name, user_email, account_type, is_active, created_at, updated_at
    `;

  const result = await pool.query(insertQuery, values);
  if (!result?.rows?.length) {
    throw new ApiError(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "User was not created",
    );
  }
  return result.rows[0];
};

export const loginUser = async ({ user_email, user_password }) => {
  if (!user_email?.trim() || !user_password?.trim()) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "All fields are required.");
  }

  const normalizedEmail = user_email.trim().toLowerCase();
  const searchQuery = `SELECT * FROM users WHERE user_email=$1 LIMIT 1`;
  const result = await pool.query(searchQuery, [normalizedEmail]);
  if (result.rows.length === 0)
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "This email is not registered");

  const user = result.rows[0];
  const isPasswordCorrect = await bcrypt.compare(
    user_password,
    user.user_password,
  );

  if (!isPasswordCorrect)
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Invalid email or password");

  const { user_password: _, ...safeUser } = user;
  return safeUser;
};
