import { asyncHandler } from "../utils/asyncHandles.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCouldinary } from "../utils/couldinary.js";
import { ApiResponse } from "../utils/apiResponse.js";

const generateAccessAndRefereshTokens = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refereshToken = user.generateRefreshToken()

        user.refreshToken = refereshToken
        await user.save({validateBeforeSave : false})

        return { accessToken, refereshToken }
    } catch (error) {
        throw new ApiError(500, "something went wrong while generating  referesh and access tokens");
    }
}

const registerUser = asyncHandler(async (req, res) => {
    // get user detail from frontend
    // validate - not empty..
    // check if user already exists: userName, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object- create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res 



    //get user detail from frontend
    const {fullName, email, userName,password} = req.body
    // console.log("email", email);

     // validate - not empty..
    /*if(fullName === "") {
        throw new ApiError(400, "Full name is required")
    } */
    if(
        [fullName, email, userName, password].some((field)=> field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    // check if user already exists: userName, email
    const existedUser = await User.findOne({
        $or : [{ userName }, { email }]
    })
    if(existedUser) {
        throw new ApiError(409, "User with this email or userName already exists")
    }
    //console.log(req.files);
    
    // check for images, check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    
    let coverImageLocalPath; //this if condition is same as line no 45
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

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
        userName : userName.toLowerCase(),
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

const loginUser = asyncHandler(async (req, res) => {
    // req body -> data
    // username or email
    // find the user
    // password check
    // access and refresh token
    // send cookie

    const {email, userName, password} = req.body

    if(!email || !userName) {
        throw new ApiError(400, "Email or userName is required")
    }

    const user = User.findOne({
        $or : [{ userName }, { email }]
    })

    if(!user) {
        throw new ApiError(404, "user does not exists")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid) {
        throw new ApiError(404, "invalid user credentials")
    }

    const {accessToken, refereshToken} = await generateAccessAndRefereshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly : true,
        secure: true,
    }
    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refereshToken, options)
    .json(
        new ApiResponse(200,
            {
                user: loggedInUser,accessToken, refereshToken
            },
            "User logged in successfully"
        )
    )
})

const logoutUser = asyncHandler(async (req, res) => {
        await User.findByIdAndUpdate(req.user._id, {
            $set: {
                refreshToken: undefined,
            },
        },
        {
        new: true,
        }
    )
    const options = {
        httpOnly : true,
        secure: true,
    }
    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"))

})
export {
    registerUser,
    loginUser,
    logoutUser,
}