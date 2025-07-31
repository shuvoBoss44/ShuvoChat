import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useLogin from "../hooks/useLogin";
import useThemeStore from "../store/useThemeStore";

const Login = () => {
  const { theme } = useThemeStore();
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const { isPending, error, loginMutation } = useLogin({
    onSuccessCallback: () => {
      navigate("/");
    },
  });

  const handleLogin = e => {
    e.preventDefault();
    loginMutation(loginData);
  };

  return (
    <div
      className="h-screen flex items-center justify-center p-4 sm:p-6 md:p-8"
      data-theme={theme}
    >
      <div className="border border-primary/25 flex flex-col lg:flex-row w-full max-w-5xl mx-auto bg-base-100 rounded-xl shadow-lg overflow-hidden">
        {/* LOGIN FORM - LEFT SIDE */}
        <div className="w-full lg:w-1/2 p-4 sm:p-8 flex flex-col">
          {/* LOGO */}
          <div className="mb-4 flex items-center justify-start gap-2">
            <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
              ShuvoChat
            </span>
          </div>

          {/* ERROR MESSAGE IF ANY */}
          {error && (
            <div className="alert alert-error mb-4">
              <span>{error.message}</span>
            </div>
          )}

          <div className="w-full">
            <form onSubmit={handleLogin}>
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold">Sign In</h2>
                  <p className="text-sm opacity-70">
                    Welcome back to ShuvoChat! Enter your credentials to
                    continue.
                  </p>
                </div>

                <div className="space-y-3">
                  {/* EMAIL */}
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">Email</span>
                    </label>
                    <input
                      type="email"
                      placeholder="john@gmail.com"
                      className="input input-bordered w-full"
                      value={loginData.email}
                      onChange={e =>
                        setLoginData({
                          ...loginData,
                          email: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  {/* PASSWORD */}
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">Password</span>
                    </label>
                    <input
                      type="password"
                      placeholder="********"
                      className="input input-bordered w-full"
                      value={loginData.password}
                      onChange={e =>
                        setLoginData({
                          ...loginData,
                          password: e.target.value,
                        })
                      }
                      required
                    />
                    <p className="text-xs opacity-70 mt-1">
                      Forgot your password?{" "}
                      <Link
                        to="/forgot-password"
                        className="text-primary hover:underline"
                      >
                        Reset it
                      </Link>
                    </p>
                  </div>
                </div>

                <button
                  className="btn btn-primary w-full"
                  type="submit"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <span className="loading loading-spinner loading-xs"></span>
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </button>

                <div className="text-center mt-4">
                  <p className="text-sm">
                    Don’t have an account?{" "}
                    <Link to="/signup" className="text-primary hover:underline">
                      Sign up
                    </Link>
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT SIDE - ILLUSTRATION */}
        <div className="hidden lg:flex w-full lg:w-1/2 bg-primary/10 items-center justify-center">
          <div className="max-w-md p-8">
            <div className="relative aspect-square max-w-sm mx-auto">
              <img
                src="/login.png" // Reuse signup.png or replace with login.png
                alt="Language connection illustration"
                className="w-full h-full"
              />
            </div>

            <div className="text-center space-y-3 mt-6">
              <h2 className="text-xl font-semibold">
                Connect with your friends
              </h2>
              <p className="opacity-70">
                Log in to ShuvoChat to chat, share, and stay connected with your
                community.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
