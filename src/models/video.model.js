import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema({
    videoFile : {
        type: String, //couldinary url
        required: true,
    },
    thumbnail: {
        type: String, //couldinary url
        required: true,
    },
    title: {
        type: String, 
        required: true,
    },
    description: {
        type: String, 
        required: true,
    },
    duration: {
        type: Number, //couldinary url
        required: true,
    },
    views: {
        type: Number, 
        default: 0,
    },
    ispublished: {
        type: Boolean, 
        default: false,
    }, 
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

},{timestamps: true});

videoSchema.plugin(mongooseAggregatePaginate);
export const Video = mongoose.model("Video", videoSchema);