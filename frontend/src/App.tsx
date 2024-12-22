import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Auth } from "./pages/Auth";
import { Blog } from "./pages/Blog";

import { RecoilRoot } from "recoil";
import { Add_post } from "./pages/Add_post";

function App() {
  //const [count, setCount] = useState(0)

  return (
    <>
      <BrowserRouter>
        <RecoilRoot>
          <Routes>
            <Route path="/signin" element={<Auth />} />
            <Route path="/signup" element={<Auth />} />
            <Route path="/get-blogs" element={<Blog />} />
            <Route path="/create-post" element={<Add_post />} />
          </Routes>
        </RecoilRoot>
      </BrowserRouter>
    </>
  );
}

export default App;
