import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser } from "@/redux/authSlice.js";
const Login = () => {
  const [input, setInput] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const {user} = useSelector(store=>store.auth)
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const signupHandler = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const res = await axios.post(
        "https://taphub-1.onrender.com/api/v1/user/login",
        input,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        dispatch(setAuthUser(res.data.user));
        navigate("/");
        toast.success(res.data.message);
        setInput({
          email: "",
          password: "",
        });
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{
    if(user){
      navigate("/");
    }
  },[])

  return (
    <div className="flex items-center w-screen h-screen justify-center">
      <form
        onSubmit={signupHandler}
        className="shadow-lg flex flex-col gap-5 p-8"
      >
        <div className="my-4">
          <h1 className="text-center font-bold text-xl">TAPHUB</h1>
          <p className="text-sm text-center">Login your account and Explore</p>
        </div>

        <div className="flex flex-col ">
          <span className="p-1 font-medium"> Email: </span>

          <Input
            type="email"
            name="email"
            value={input.email}
            onChange={changeEventHandler}
            className="focus-visible:ring-transparent "
          />
        </div>

        <div className="flex flex-col ">
          <span className="p-1 font-medium"> Password: </span>

          <Input
            type="password"
            name="password"
            value={input.password}
            onChange={changeEventHandler}
            className="focus-visible:ring-transparent "
          />
        </div>
        {loading ? (
          <Button>
            <Loader2 className="mr-2 h-4 w-4 animate-spin " />
            Please wait...
          </Button>
        ) : (
          <Button type="submit" className=" bg-cyan-500 p-1 rounded-md ">
            Login
          </Button>
        )}

        <span className="text-center">
          Dont have an account?{" "}
          <Link to="/signup" className="text-blue-600">
            SignUp
          </Link>
        </span>
      </form>
    </div>
  );
};

export default Login;
