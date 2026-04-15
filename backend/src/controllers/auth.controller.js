import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { HTTP_STATUS } from "../utils/constants.js";
import pool from "../configs/db.js";
import {
  genrateAccessToken,
  genrateRefreshToken,
  loginUser,
  registerUser,
} from "../services/auth.service.js";
import { accessTokenOptions, refreshTokenOptions } from "../utils/httpsOption.js";

export const register = asyncHandler(async (req, res) => {
  const { user_name, user_email, user_password, account_type } = req.body;

  const result = await registerUser({
    user_name,
    user_email,
    user_password,
    account_type,
  });

  if (!result) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Problem creating user");
  }

  return res
    .status(HTTP_STATUS.CREATED)
    .json(
      new ApiResponse(HTTP_STATUS.CREATED, "User created successfully", result),
    );
});

export const signIn = asyncHandler(async (req, res) => {
  const { user_email, user_password } = req.body;

  const user = await loginUser({ user_email, user_password });

  const accessToken = genrateAccessToken(user);
  const refreshToken = genrateRefreshToken(user);

  await pool.query(`UPDATE users SET refresh_token = $1 WHERE id = $2`, [
    refreshToken,
    user.id,
  ]);

  return res
    .cookie("accessToken", accessToken, accessTokenOptions)
    .cookie("refreshToken", refreshToken, refreshTokenOptions)
    .status(HTTP_STATUS.OK)
    .json(
      new ApiResponse(
        HTTP_STATUS.OK,
        `Welcome ${user.user_name}`,
        { user }
      )
    );
});
