import axios from "axios";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";

const MAIN_URL = "https://my-app.kr96-aditya.workers.dev";

export const Blog = () => {
  console.log("re render");

  const time_ref = useRef<any>(null);
  const [filter_val, set_filter_val] = useState<string>(''); // Store the filter value separately
  const [post_list, set_post_list] = useState<any[]>([]);
  const [author_list, set_author_list] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);

  // Fetch post data once on mount
  useEffect(() => {
    async function get_data() {
      try {
        const url = `${MAIN_URL}/api/v1/blog/get-all`;
        const config = {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        };

        const response = await axios.get(url, config);
        set_post_list(response.data);
        setLoading(false);
      } catch (e) {
        console.log(e);
      }
    }
    get_data();
  }, []); 

  // Fetch author data when post_list changes
  useEffect(() => {
    if (post_list.length === 0) return;

    async function get_all_author_names() {
      try {
        const authorIds = Array.from(new Set(post_list.map((it: any) => it.authorId)));
        const url = `${MAIN_URL}/api/v1/blog/find-authors`;
        const config = {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        };

        const body = { authorIds };
        const response = await axios.post(url, body, config);
        set_author_list(response.data.author_list_obj);
      } catch (e) {
        console.log(e);
      }
    }

    get_all_author_names();
  }, [post_list]);

  // Memoize the filtered posts based on filter value and post list
  const filteredPosts = useMemo(() => {
    if (filter_val === "") {
      return post_list; // Return all posts if the filter value is empty
    }

    return post_list.filter((it: any) =>
      author_list[it.authorId]?.toLowerCase().includes(filter_val) ||
      it.title.toLowerCase().includes(filter_val) ||
      it.content.toLowerCase().includes(filter_val)
    );
  }, [filter_val, post_list, author_list]);

  // Debounced input change handler
  const on_input_change = useCallback((e: any) => {

    const value = e.target.value;
    
    if (time_ref.current) {
      clearTimeout(time_ref.current); // Clear any previous timeouts
    }

    time_ref.current = setTimeout(() => {
      set_filter_val(value); // Update the filter value after 300ms
    }, 300);
  }, []);

  return (
    <div className="flex justify-center items-center bg-gray-50">
      <div className="flex flex-col w-3/4 max-w-4xl p-6 bg-white shadow-lg rounded-md">
        <div className="mb-5">
          <input
            className="w-full border border-gray-300 rounded-md p-2"
            type="text"
            placeholder="Search..."
            onChange={on_input_change}
          />
        </div>
        {loading ? (
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="h-6 bg-gray-300 rounded w-1/4 mb-2"></div>
                <div className="h-8 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-5/6 mb-4"></div>
                <div className="h-1 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          filteredPosts.map((it: any, index: number) => (
            <div key={index} className="mb-6">
              {/* Author Name */}
              <div className="text-gray-600 font-semibold text-lg mb-2">
                {author_list[it.authorId] || "Loading..."}
              </div>

              {/* Post Title */}
              <div className="text-3xl font-bold text-gray-800 mb-2 break-words overflow-hidden">
                {it.title}
              </div>

              {/* Post Content */}
              <div className="text-gray-700 font-mono text-base mb-4 break-words overflow-hidden">
                {it.content}
              </div>

              {/* Divider */}
              <div className="border-t border-gray-300"></div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
