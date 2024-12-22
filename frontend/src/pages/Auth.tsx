import { Welcome_Qoute } from "../components/Welcome_Qoute";
import { Login_page } from "../components/Login_page";

export function Auth() {
  return (
    <>
      <div className="flex flex-col md:flex-row">
        <Login_page  />
        <Welcome_Qoute />
      </div>
    </>
  );
}
