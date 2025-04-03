import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "C:/Users/DRASHTI/OneDrive/Documents/Desktop/programer/NodeJsMain/professionalProject/public/temp")
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
  })
  
export const upload = multer({
     storage, 
})