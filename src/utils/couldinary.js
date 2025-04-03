import { v2 as couldinary} from "cloudinary";
import fs from "fs";

cloudinary.config({ 
    cloud_name: process.env.COULDINARY_CLOUD_NAME, 
    api_key: process.env.COULDINARY_API_KEY, 
    api_secret:process.env.COULDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

const uploadOnCouldinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null;
        //upload the file on coludinary
        const response = await couldinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        })
        //file has been uploaded successfully
        console.log("File uploaded successfully on cloudinary", response.url);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the operation got failed
        return null;
    }
}

export {uploadOnCouldinary};