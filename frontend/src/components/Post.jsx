import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Bookmark, MessageCircle, MoreHorizontal, Send } from "lucide-react";
import { Button } from "./ui/button";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import CommentDialog from "./CommentsDialog";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "sonner";
import { setPosts, setSelectedPost } from "@/redux/postSlice";
import { Badge } from "./ui/badge";

const Post = ({ post }) => {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const { user } = useSelector((store) => store.auth);
  const { posts } = useSelector((store) => store.post);
  const [liked, setLiked] = useState(post.likes.includes(user?._id) || false);
  const [postLike, setPostLike] = useState(post.likes.length);
  const [comment, setComment] = useState(post.comments);
  const dispatch = useDispatch();

  const changeEventHandler = (e) => {
    const inputText = e.target.value;
    if (inputText.trim()) {
      setText(inputText);
    } else {
      setText("");
    }
  };

  const likeOrDisLikeHandler = async () => {
    // Optimistic UI Update
    const newLikedState = !liked;
    setLiked(newLikedState);
    setPostLike((prev) => (newLikedState ? prev + 1 : prev - 1));

    try {
      const action = newLikedState ? "like" : "dislike";
      const res = await axios.get(
        `https://taphub-1.onrender.com/api/v1/post/${post._id}/${action}`,
        { withCredentials: true }
      );

      if (res.data.success) {
        const updatedPostData = posts.map((p) =>
          p._id === post._id
            ? {
                ...p,
                likes: newLikedState
                  ? [...p.likes, user._id]
                  : p.likes.filter((id) => id !== user._id),
              }
            : p
        );
        dispatch(setPosts(updatedPostData));
        toast.success(res.data.message);
      } else {
        // Revert UI on failure
        setLiked(!newLikedState);
        setPostLike((prev) => (newLikedState ? prev - 1 : prev + 1));
      }
    } catch (error) {
      console.log(error);
      // Revert UI on error
      setLiked(!newLikedState);
      setPostLike((prev) => (newLikedState ? prev - 1 : prev + 1));
    }
  };

  const commentHandler = async () => {
    // Define tempComment outside try to avoid ReferenceError
    const tempComment = {
      text,
      author: { username: user.username, profilePicture: user.profilePicture }, // Mock user data
      _id: Math.random().toString(36).substring(2, 9), // Temporary ID
      createdAt: new Date(),
    };

    try {
      setComment((prev) => [...prev, tempComment]); // Optimistic UI update

      const res = await axios.post(
        `https://taphub-1.onrender.com/api/v1/post/${post._id}/comment`,
        { text },
        { withCredentials: true }
      );

      if (res.data.success) {
        // Replace temp comment with actual API response
        setComment((prev) =>
          prev.map((c) => (c._id === tempComment._id ? res.data.comment : c))
        );

        // Update post comments
        dispatch(
          setPosts(
            posts.map((p) =>
              p._id === post._id
                ? { ...p, comments: [...p.comments, res.data.comment] }
                : p
            )
          )
        );

        toast.success(res.data.message);
      } else {
        // Remove temp comment if API fails
        setComment((prev) => prev.filter((c) => c._id !== tempComment._id));
      }
    } catch (error) {
      console.log(error);
      // Ensure temp comment is removed on error
      setComment((prev) => prev.filter((c) => c._id !== tempComment._id));
      toast.error("Failed to add comment");
    }

    setText("");
  };

  const deletePostHandler = async () => {
    try {
      const res = await axios.delete(
        `https://taphub-1.onrender.com/api/v1/post/delete/${post?._id}`,
        { withCredentials: true }
      );
      if (res.data.success) {
        const updatedPostData = posts.filter(
          (postItem) => postItem?._id !== post?._id
        );
        dispatch(setPosts(updatedPostData));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  const bookmarkHandler = async () => {
    try {
      const res = await axios.get(
        `https://taphub-1.onrender.com/api/v1/post/${post?._id}/bookmark`,
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="my-8 w-full max-w-sm mx-auto ">
      <div className="flex justify-between item-center">
        <div className="flex  gap-2">
          <Avatar>
            <AvatarImage src={post.author?.profilePicture} alt="post_image" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className="flex items-center">
            <div className="flex items-center gap-3">
              <h1>{post.author?.username}</h1>
              {user?._id === post.author._id && (
                <Badge variant="secondary">Author</Badge>
              )}
            </div>
          </div>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <MoreHorizontal className="cursor-pointer" />
          </DialogTrigger>
          <DialogContent className="flex flex-col items-center text-sm text">
            {post?.author?._id !== user?._id && (
              <Button
                variant="ghost"
                className="cursor-pointer w-fit text-[#ED4956] font-bold bg-white"
              >
                unfolloow
              </Button>
            )}

            <Button variant="ghost" className="cursor-pointer w-fit bg-white">
              Add to Favorites
            </Button>
            {user && user?._id === post?.author._id && (
              <Button
                onClick={deletePostHandler}
                variant="ghost"
                className="cursor-pointer w-fit bg-white "
              >
                Delete Post
              </Button>
            )}
          </DialogContent>
        </Dialog>
      </div>
      <img
        className="rounded-sm my-2 w-full aspect-square object-cover"
        src={post.image}
        alt="404"
      />

      <div className="flex justify-between">
        <div className="flex justify-between gap-3">
          {liked ? (
            <FaHeart
              onClick={likeOrDisLikeHandler}
              size={"24"}
              className="cursor-pointer text-red-600"
            />
          ) : (
            <FaRegHeart
              onClick={likeOrDisLikeHandler}
              size={"23px"}
              className="cursor-pointer hover:text-gray-600"
            />
          )}

          <MessageCircle
            onClick={() => {
              dispatch(setSelectedPost(post));
              setOpen(true);
            }}
            className="cursor-pointer hover:text-gray-600"
          />
          <Send className="cursor-pointer hover:text-gray-600" />
        </div>
        <div>
          <Bookmark
            onClick={bookmarkHandler}
            className="cursor-pointer hover:text-gray-600"
          />
        </div>
      </div>
      <span className="font-medium block mb-2">{postLike} Likes</span>
      <p>
        <span className="font-medium mr-2">{post.author?.username}</span>
        {post.caption}
      </p>
      {comment.length > 0 && (
        <span
          onClick={() => {
            dispatch(setSelectedPost(post));
            setOpen(true);
          }}
          className="cursor-pointer text-sm text-gray-400"
        >
          View all {comment.length} comments
        </span>
      )}

      <CommentDialog open={open} setOpen={setOpen} />
      <div className="flex justify-between">
        <input
          type="text"
          placeholder="Add a comment...."
          value={text}
          onChange={changeEventHandler}
          className="outline-none text-sm w-full"
        />
        {text && (
          <span
            onClick={commentHandler}
            className=" cursor-pointer text-[#3BADF8]"
          >
            Post{" "}
          </span>
        )}
      </div>
    </div>
  );
};

export default Post;
