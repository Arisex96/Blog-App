import { SignupType } from "@kr96.aditya2/common-app";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import user_atom from "../atoms/user_atom";

const MAIN_URL = "https://my-app.kr96-aditya.workers.dev";

//console.log(in_mode);

export const Login_page = () => {

  console.log("re rendered");

  const current_url = window.location.pathname;
  const in_mode =
    current_url.endsWith("signin") || current_url.endsWith("signin/")
      ? "signin"
      : "signup";

  
  const navigate = useNavigate();

  const [user_id] = useRecoilState(user_atom);
  const [mode, set_mode] = useState(in_mode); // Toggle between "signin" and "signup"
  const [message_box, set_message_box] = useState(false);
  const [message, setMessage] = useState("");
  const [success_status, set_success_status] = useState<true | false>(false);
  const [inputVal, setInputVal] = useState<SignupType>({
    name: "",
    email: "",
    password: "",
  });

  const isSignup = mode === "signup";

  // Submit handler
  const handleSubmit = async () => {
    try {
      const url =
        mode === "signup"
          ? `${MAIN_URL}/api/v1/user/signup`
          : `${MAIN_URL}/api/v1/user/signin`;

      const config = {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      };

      const response = await axios.post(url, inputVal, config);

      console.log(response.data);

      if (response.data.success && mode == "signin") {
        console.log(user_id);
        //set_user_id(response.data.user_id);
        console.log("switch");
        navigate("/get-blogs");
      }

      setMessage(response.data.message);
      set_success_status(response.data.success);
      set_message_box(true);

    } catch (error: any) {
      setMessage(error.response?.data?.message || "An error occurred");
      console.log(error);
      set_message_box(true);
    }
  };

  // Toggle mode
  function toggleMode() {
    const newMode = isSignup ? "signin" : "signup";
    set_mode(newMode);
    set_message_box(false);
    setMessage("");
    setInputVal({ name: "", email: "", password: "" });

    // Update the URL without reloading
    navigate(`/${newMode}`);
  }

  return (
    <div className="h-screen flex justify-center items-center w-full md:w-1/2">
      <div className="m-4 w-full max-w-md">
        {/* Title */}
        <div className="mb-6 text-3xl font-bold text-center">
          {isSignup ? "Create an Account" : "Login to Your Account"}
        </div>

        {/* Toggle Link */}
        <div className="mb-4 text-center text-slate-600 text-sm">
          {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
          <span onClick={toggleMode} className="text-blue-500 cursor-pointer">
            {isSignup ? "Login" : "Sign Up"}
          </span>
        </div>

        {/* Error or Success Message */}
        {message_box && (
          <div
            className={`mb-4 text-center ${
              success_status ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </div>
        )}

        {/* Form */}
        <div className="space-y-4">
          {/* Username (Only for Sign Up) */}
          {isSignup && (
            <div>
              <label className="block mb-1 font-semibold">Username</label>
              <input
                className="w-full border border-gray-300 rounded-md p-2"
                type="text"
                placeholder="Enter your username"
                value={inputVal.name}
                onChange={(e) =>
                  setInputVal({ ...inputVal, name: e.target.value })
                }
              />
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block mb-1 font-semibold">Email</label>
            <input
              className="w-full border border-gray-300 rounded-md p-2"
              type="email"
              placeholder="Enter your email"
              value={inputVal.email}
              onChange={(e) =>
                setInputVal({ ...inputVal, email: e.target.value })
              }
            />
          </div>

          {/* Password */}
          <div>
            <label className="block mb-1 font-semibold">Password</label>
            <input
              className="w-full border border-gray-300 rounded-md p-2"
              type="password"
              placeholder="Enter your password"
              value={inputVal.password}
              onChange={(e) =>
                setInputVal({ ...inputVal, password: e.target.value })
              }
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className="w-full bg-black text-white rounded-md p-3 mt-6"
        >
          {isSignup ? "Sign Up" : "Login"}
        </button>
      </div>
    </div>
  );
};
