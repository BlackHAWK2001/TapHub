import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Link } from "react-router-dom";
import { MoreHorizontal } from "lucide-react";

import { Input } from "./ui/input";
import { Button2 } from "./ui/button2";
import { useDispatch, useSelector } from "react-redux";
import Comment from "./Comment";
import axios from "axios";
import { toast } from "sonner";
import { setPosts } from "@/redux/postSlice";

const CommentDialog = ({ open, setOpen }) => {
  const [text, setText] = useState("");
  const { selectedPost, posts } = useSelector((store) => store.post);
  const [comment, setComment] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    if (selectedPost) {
      setComment(selectedPost.comments);
    }
  }, [selectedPost]);

  const changeEventHandler = (e) => {
    const inputText = e.target.value;
    if (inputText.trim()) {
      setText(inputText);
    } else {
      setText("");
    }
  };

  const sendMessageHandler = async () => {
    // Define tempComment outside try to avoid ReferenceError

    try {
      const res = await axios.post(
        `http://localhost:8000/api/v1/post/${selectedPost?._id}/comment`,
        { text },
        { withCredentials: true }
      );

      if (res.data.success) {
        const updatedCommentData = [...comment, res.data.comment];
        setComment(updatedCommentData);

        const updatedPostData = posts.map((p) =>
          p._id === selectedPost._id
            ? { ...p, comments: updatedCommentData }
            : p
        );
        dispatch(setPosts(updatedPostData));
        toast.success(res.data.message);
        setText("");
      }
    } catch (error) {
      console.log(error);
      // Ensure temp comment is removed on error
    }

    setText("");
  };

  return (
    <Dialog open={open}>
      <DialogContent
        onInteractOutside={() => setOpen(false)}
        className="max-w-5xl p-0 flex flex-col"
      >
        <div className="flex flex-1 gap-2">
          <div className="w-1/2">
            <img
              src={selectedPost?.image}
              alt=""
              className="w-full h-full object-cover rounded-l-lg"
            />
          </div>
          <div className="w-1/2">
            <div className="w-full flex flex-col justify-between">
              <div className="flex item-center  justify-between">
                <div className="flex gap-3 item-center">
                  <Link>
                    <Avatar>
                      <AvatarImage src={selectedPost?.author?.profilePicture} />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                  </Link>
                  <div>
                    <Link className="font-semibold text-xs">
                      {selectedPost?.author?.username}
                    </Link>
                    {/* <span>   biohere..</span> */}
                  </div>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="p-2">
                      <MoreHorizontal className="cursor-pointer" />
                    </button>
                  </DialogTrigger>
                  <DialogContent
                    className="flex flex-col items-center
                   text-sm text-center"
                  >
                    <div className="cursor-pointer w-full text-[#ED4956] font-bold">
                      Unfollow
                    </div>
                    <div className="cursor-pointer w-full">
                      Add to Favorites
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <hr />
              <div className="flex-1 overflow-y-auto max-h-96 p-4">
                {comment.map((comment) => (
                  <Comment key={comment._id} comment={comment} />
                ))}
              </div>
              <div className="p-4">
                <div className="flex item-center gap-2">
                  <Input
                    type="text"
                    value={text}
                    onChange={changeEventHandler}
                    placeholder="Add a comment..."
                    className="w-full outline-none border-gray-300 p-2 rounded"
                  />
                  <Button2
                    disabled={!text.trim()}
                    onClick={sendMessageHandler}
                    variant="outline"
                    className="bg-white"
                  >
                    Send
                  </Button2>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommentDialog;
