import { registerUser } from "../services/auth.service.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { HTTP_STATUS } from "../utils/constants.js";

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
      new ApiResponse(HTTP_STATUS.CREATED, result, "User created successfully"),
    );
});
