import sharp from "sharp";
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js";
import { User } from "../models/user.model.js";
import { Comment } from "../models/comment.model.js";
import { getReceiverSocketId ,io} from "../socket/socket.js";

export const addNewPost = async (req, res) => {
  try {
    const { caption } = req.body;
    const image = req.file;
    const authorId = req.id;

    if (!image) return res.status(400).json({ message: "Image required" });

    const optimizedImageBuffer = await sharp(image.buffer)
      .resize({ width: 800, height: 800, fit: "inside" })
      .toFormat("jpeg", { quality: 80 })
      .toBuffer();

    const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString(
      "base64"
    )}`;
    const cloudResponse = await cloudinary.uploader.upload(fileUri);
    const post = await Post.create({
      caption,
      image: cloudResponse.secure_url,
      author: authorId,
    });

    const user = await User.findById(authorId);
    if (user) {
      user.posts.push(post._id);
      await user.save();
    }
    await post.populate({ path: "author", select: "-password" });

    return res.status(201).json({
      message: "New post added",
      post,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getAllpost = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({ path: "author", select: "username profilePicture" })
      .populate({
        path: "comments",
        sort: { createdAt: -1 },
        populate: {
          path: "author",
          select: "username profilePicture",
        },
      });
    return res.status(200).json({
      posts,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getUserPost = async (req, res) => {
  try {
    const authorId = req.id;
    const posts = await Post.find({ author: authorId })
      .sort({ createdAt: -1 })
      .populate({
        path: "author",
        select: "username profilePicture",
      })
      .populate({
        path: "comments",
        sort: { createdAt: -1 },
        populate: {
          path: "author",
          select: "username profilePicture",
        },
      });
    return res.status(200).json({
      posts,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const likePost = async (req, res) => {
  try {
    const likeKrneWaleUserKiId = req.id;
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post)
      return res
        .status(404)
        .json({ message: "post not found", success: false });

    // like logic
    await post.updateOne({ $addToSet: { likes: likeKrneWaleUserKiId } });
    await post.save();
    
    
        // implement socket io for real time notification
        const user = await User.findById(likeKrneWaleUserKiId).select('username profilePicture');
         
        const postOwnerId = post.author.toString();
        if(postOwnerId !== likeKrneWaleUserKiId){
            // emit a notification event
            const notification = {
                type:'like',
                userId:likeKrneWaleUserKiId,
                userDetails:user,
                postId,
                message:'Your post was liked'
            }
            const postOwnerSocketId = getReceiverSocketId(postOwnerId);
            io.to(postOwnerSocketId).emit('notification', notification);
        }


    return res.status(200).json({ message: "post liked", success: true });
  } catch (error) {
    console.log(error);
  }
};

export const dislikePost = async (req, res) => {
  try {
    const likeKrneWaleUserKiId = req.id;
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post)
      return res
        .status(404)
        .json({ message: "post not found", success: false });

    // like logic
    await post.updateOne({ $pull: { likes: likeKrneWaleUserKiId } });
    await post.save();

    
        // implement socket io for real time notification
        const user = await User.findById(likeKrneWaleUserKiId).select('username profilePicture');
         
        const postOwnerId = post.author.toString();
        if(postOwnerId !== likeKrneWaleUserKiId){
            // emit a notification event
            const notification = {
                type:'dislike',
                userId:likeKrneWaleUserKiId,
                userDetails:user,
                postId,
                message:'Your post was liked'
            }
            const postOwnerSocketId = getReceiverSocketId(postOwnerId);
            io.to(postOwnerSocketId).emit('notification', notification);
        }

    return res.status(200).json({ message: "post disliked", success: true });
  } catch (error) {
    console.log(error);
  }
};

export const addComment = async (req, res) => {
    try {
      const postId = req.params.id;
      const userId = req.id; // Renamed variable for clarity
      const { text } = req.body;
  
      if (!text) {
        return res.status(400).json({ message: "Text is required", success: false });
      }
  
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found", success: false });
      }
  
      const comment = await Comment.create({
        text,
        author: userId,
        post: postId,
      });
  
      await comment.populate("author", "username profilePicture"); // Optimized populate
  
      post.comments.push(comment._id);
      await post.save();
  
      return res.status(201).json({
        message: "Comment Added Successfully!",
        comment,
        success: true,
      });
  
    } catch (error) {
      console.error("Error adding comment:", error);
      return res.status(500).json({ message: "Internal Server Error", success: false });
    }
  };
  

// export const addComment = async (req, res) => {
//   try {
//     const postId = req.params.id;
//     const commentKarneWaleUserKiId = req.id;

//     const { text } = req.body;

//     const post = await Post.findById(postId);

//     if (!text)
//       return res
//         .status(400)
//         .json({ message: "text is required", success: false });

//     const comment = await Comment.create({
//       text,
//       author: commentKarneWaleUserKiId,
//       post: postId,
//     });

//     await comment.populate({
//       path: "author",
//       select: "username profilePicture",
//     });
//     post.comments.push(comment._id);
//     await post.save();

//     return res.status(201).json({
//       message: "Comment Added",
//       comment,
//       success: true,
//     });
//   } catch (error) {
//     console.log(error);
//   }
// };

export const getCommentsOfPost = async (req, res) => {
  try {
    const postId = req.params.id;

    const comments = await Comment.find({ post: postId }).populate(
      "author",
      "username",
      "profilePicture"
    );
    if (!comments)
      return res.status(404).json({
        message: " no comments find on this post ",
        success: false,
      });

    return res.status(200).json({
      success: true,
      comments,
    });
  } catch (error) {
    console.log(error);
  }
};

export const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const authorId = req.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        message: "post not found",
        success: false,
      });
    }

    //only owner can delete
    if (post.author.toString() !== authorId) {
      return res.status(403).json({
        message: "unauthorised",
      });
    }

    //delete post
    await Post.findByIdAndDelete(postId);

    //remove post from user profile
    let user = await User.findById(authorId);
    user.posts = user.posts.filter((id) => id.toString() !== postId);
    await user.save();

    //delete comments of post
    await Comment.deleteMany({ post: postId });

    return res.status(200).json({
      success: true,
      message: "Post deleted",
    });
  } catch (error) {
    console.log(error);
  }
};

export const bookmarkPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const authorId = req.id;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        message: "post not found",
        success: false,
      });
    }

    const user = await User.findById(authorId);
    if (user.bookmarks.includes(post._id)) {
      //already bookmarked --> remove
      await user.updateOne({ $pull: { bookmarks: post._id } });
      await user.save();
      return res
        .status(200)
        .json({
          type: "unsaved",
          message: "post remove from bookmark",
          success: true,
        });
    } else {
      //to bookmark
      await user.updateOne({ $addToSet: { bookmarks: post._id } });
      await user.save();
      return res
        .status(200)
        .json({ type: "saved", message: "Post bookmarked", success: true });
    }
  } catch (error) {
    console.log(error);
  }
};
