import Post from "../models/Post.js";
import User from "../models/User.js";

/* CREATE */
export const createPost = async (req, res) => {
    try {
        const { userId, description, picturePath } = req.body;
        const user = await User.findById(userId);
        const newPost = new Post({
            userId,
            firstName: user.firstName,
            lastName: user.lastName,
            location: user.location,
            description,
            userPicturePath: user.picturePath,
            picturePath,
            likes: {},
            // likes will be in format of { "user_id": true } denoting that user_id has liked the post
            comments: []
        })
        await newPost.save();
        
        // grabs all the posts that is the updated state with new post
        const post = await Post.find();
        res.status(201).json(post);
    }
    catch (err) {
        res.status(408).json({error: err.message});
    }
};

/* READ */
export const getFeedPosts = async (req,res) => {
    try {
        const post = await Post.find();
        res.status(200).json(post);
    }
    catch (err) {
        res.status(409).json({error: err.message});
    }
};

export const getUserPosts = async (req,res) => {
    try {
        const { userId } = req.params;
        const post = await Post.find({ userId });
        res.status(200).json(post);
    }
    catch (err) {
        res.status(409).json({error: err.message});
    }
};

/* UPDATE */
export const likePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;
        const post = await Post.findById(id);
        const isLiked = post.likes.get(userId);

        if(isLiked)
            post.likes.delete(userId);
        else
            post.likes.set(userId, true);
        
        // updating the frontend once the post likes are updated
        const updatedPost = await Post.findByIdAndUpdate(
            id,
            { likes: post.likes },
            { new: true }
        );

        res.status(200).json(updatedPost);
    }
    catch (err) {
        res.status(409).json({error: err.message});
    }
};