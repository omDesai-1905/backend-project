import { asyncHandler } from "../utils/asyncHandles.js";
import { ApiError } from "../utils/apiError.js";
import User from "../models/user.model.js";
import { uploadOnCouldinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
    // get user detail from frontend
    // validate - not empty..
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object- create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res 



    //get user detail from frontend
    const {fullName, email, userName,password} = req.body
    console.log("email", email);

     // validate - not empty..
    /*if(fullName === "") {
        throw new ApiError(400, "Full name is required")
    } */
    if(
        [fullName, email, userName, password].some((field)=> field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    // check if user already exists: username, email
    const existedUser = User.findOne({
        $or : [{ userName }, { email }]
    })
    if(existedUser) {
        throw new ApiError(409, "User with this email or username already exists")
    }

    // check for images, check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;
    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    // upload them to cloudinary, avata
    const avatar = await uploadOnCouldinary(avatarLocalPath)
    const coverImage = await uploadOnCouldinary(coverImageLocalPath)

    if(!avatar) {
        throw new ApiError(500, "Avatar file is required")
    }

    // create user object- create entry in db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage : coverImage?.url || "", //if cover image is not provided, then it will be empty string else take url
        email,
        password,
        userName : userName.toLowerCase()
    })

    // remove password and refresh token field from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken " //write this field which is remove from response
    )

    // check for user creation
    if(!createdUser) {
        throw new ApiError(500, "something went wrong while registering user")
    }

    // return res
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User created successfully")
    )

})

export {registerUser}