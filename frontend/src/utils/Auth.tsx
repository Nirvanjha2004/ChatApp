import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Auth({ type }: { type: "signin" | "signup" }) {
  const[username, setUsername] = useState("me23b1079");
  const [password, setPassword]= useState("nirvanjha")
  const navigate = useNavigate();

  const signuphandlechange = async (e: any) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `http://localhost:8080/signup`,
      {
        username, 
        password
      }
      );
      const data = await response.data;
      console.log("Successfully signed in or signed up:", data);
      navigate("/signin");
    } catch (error) {
      console.error("Error during sign in/up:", error);
    }
  };

  const signinhandlechange = async (e: any) => {
    e.preventDefault();
    const response = await fetch("http://localhost:8080/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    });
    console.log(response);
    const data = await response.json();
    console.log(data);

    if (response.ok) {
      localStorage.setItem("jwtToken", data.userSigntoken);
      console.log("Token stored:", data.userSigntoken);
      navigate("/home");
    } else {
      console.error("Login failed:", data.message);
    }
  };

  return (
    <section className="bg-gray-50 pt-0 dark:bg-gray-900">
      <div className="flex flex-col items-center justify-center px-6 py-8 pt-1 mx-auto  md:h-screen lg:py-0">
        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
              {type === "signin"
                ? "Sign in to your account"
                : "Create an account"}
            </h1>
            <form className="space-y-4 md:space-y-6" action="#">
              {type === "signin" ? null : (
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Your Email
                  </label>
                  <input
                    
                    type="email"
                    name="email"
                    id="email"
                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                    placeholder="name@company.com"
                  ></input>
                </div>
              )}

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900">
                  Username
                </label>
                <input
                  onChange={(e)=>{
                    setUsername(e.target.value);
                    console.log("Username Set!");
                  }}
                  type="username"
                  name="username"
                  id="username"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                  placeholder="name1234"
                ></input>
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900">
                  Password
                </label>
                <input
                  onChange={(e)=>{
                    setPassword(e.target.value);
                    console.log("Password Set!");
                  }}
                  type="password"
                  name="password"
                  id="password"
                  placeholder="••••••••"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                ></input>
              </div>
              {type === "signin" ? (
                <button
                  onClick={signinhandlechange}
                  type="submit"
                  className="w-full text-black bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                >
                  Sign in
                </button>
              ) : (
                <button
                  onClick={signuphandlechange}
                  type="submit"
                  className="w-full text-black bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                >
                  Sign up
                </button>
              )}

              {type === "signin" ? (
                <p className="text-sm font-light text-gray-500">
                  Dont have an account yet?{" "}
                  <Link
                    to="/signup"
                    className="font-medium text-black hover:underline "
                  >
                    Sign up
                  </Link>
                </p>
              ) : (
                <p className="text-sm font-light text-gray-500">
                  Already have an account?{" "}
                  <Link
                    to="/signin"
                    className="font-medium text-black hover:underline "
                  >
                    Sign in
                  </Link>
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Auth;

