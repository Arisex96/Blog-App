import { useRef, useState } from "react";
import axios from "axios";

const MAIN_URL = "https://my-app.kr96-aditya.workers.dev";

export const Add_post = () => {
  const in_ref: any = useRef(null);
  const [title, set_title] = useState("");
  const [content, set_content] = useState("");
  const [box, set_box] = useState(false);
  const [message, set_message] = useState<{ text: string; color: string }>({
    text: "",
    color: "",
  });

  async function on_click_handler() {

    if (in_ref.current) in_ref.current.disabled = true;
    console.log("button disabled");

    try {
      const url = `${MAIN_URL}/api/v1/blog/create-post`;

      const config = {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      };

      const body = {
        title: title,
        content: content,
      };

      const response = await axios.post(url, body, config);

      const messageText = response.data.message;
      const success = response.data.success;

      // Set message based on success or failure
      if (!success) {
        set_message({ text: messageText, color: "red" });
      } else {
        //alert("Post was created!");
        set_message({ text: messageText, color: "green" });
      }

      set_box(true);

      setTimeout(() => {
        set_box(false);
      }, 3000);
    } catch (e) {
      console.log(e);
    }

    if (in_ref.current) in_ref.current.disabled = false;
    console.log("button enabled");
  }

  return (
    <>
      <div className="flex flex-col justify-self-center justify-center items-center p-2 w-1/2">
        <div className="h-20 w-full text-start m-2">
          <textarea
            className="w-full h-16 resize-none overflow-y-auto rounded-md p-4 text-3xl border-none bg-white text-gray-900 focus:ring-0 focus:outline-none"
            placeholder="Title"
            onChange={(e) => set_title(e.target.value)}
            value={title}
          ></textarea>
        </div>

        <div className="border-t border-slate-400 w-full"></div>

        <div className="h-80 w-full text-start m-2">
          <textarea
            className="w-full h-full resize-none overflow-y-auto rounded-md p-4 border-none bg-white text-gray-900 focus:ring-0 focus:outline-none placeholder:text-xl"
            placeholder="Start Writing..."
            onChange={(e) => set_content(e.target.value)}
            value={content}
          ></textarea>

          {box && (
            <div className="flex justify-center items-center m-2">
              <div
                className={`w-fit text-white rounded-md p-2 px-4 ${
                  message.color === "red"
                    ? "bg-red-600"
                    : message.color === "green"
                    ? "bg-green-600"
                    : ""
                }`}
              >
                {message.text}
              </div>
            </div>
          )}

          {!box && (
            <div className="flex justify-center items-center m-2">
              <button
                ref={in_ref}
                className="w-fit bg-slate-950 text-white rounded-md p-2 px-4 hover:bg-slate-700"
                onClick={on_click_handler}
              >
                Create Post
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
