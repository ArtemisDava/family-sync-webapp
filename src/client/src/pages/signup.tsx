import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import { UserService } from "../services/user.service";
import { useUser } from "../contexts/user.context";
import type LoginInformation from "../models/loginInformation";
import { Link } from "react-router-dom";
import type { SignUpDto } from "../models/signup.dto";
import type { SignUpResponseDto } from "../models/signupResponse.dto";
import { useSearchParams } from "react-router-dom";
import { IonIcon } from "@ionic/react";
import { arrowBack } from "ionicons/icons";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const invite = searchParams.get("invite");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const signUpData: SignUpDto = {
      email,
      name,
      password,
    };

    try {
      await UserService.signUp(signUpData);

      setEmail("");
      setName("");
      setPassword("");
      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Login failed. Please try again."
      );
    }
  };

  return (
    <div className="flex items-center justify-center gap-6  min-h-[86vh] p-6 lg:p-0 mx-auto container">
      <div className="mb-6 bg-logo lg:w-1/2 min-h-[86vh] flex items-center justify-center">
        <h1 className="text-3xl font-bold">Family Sync!</h1>
      </div>
      <div className="lg:w-1/2 p-6">
        <button
          className="flex items-center gap-2 mb-12 cursor-pointer opcacity-75 hover:opacity-100"
          onClick={() => navigate(-1)}
        >
          <IonIcon icon={arrowBack} className="p-2 text-" />
          <span className="text-md font-medium cursor-pointer">Back</span>
        </button>
        <h1 className="text-2xl font-bold mb-4">Create an account</h1>

        <form
          className="flex flex-col w-full my-20
          text-start gap-8 text-base font-normal"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-4">
            {invite && (
              <div className="p-4 bg-green-600 rounded text-white text-center font-bold">
                You have been invited! Please sign up to join.
              </div>
            )}
            <label
              className="flex flex-col gap-1 text-base font-bold"
              htmlFor="email"
            >
              Email
            </label>
            <input
              type="text"
              value={email}
              name="email"
              onChange={(e) => setEmail(e.target.value)}
              className="px-3 py-2 bg-white/10 font-normal border border-black/50 rounded-md p-2"
              required
            />
            <label
              className="flex flex-col gap-1 text-base font-bold"
              htmlFor="name"
            >
              Name
            </label>
            <input
              type="text"
              value={name}
              name="name"
              onChange={(e) => setName(e.target.value)}
              className="px-3 py-2 bg-white/10 font-normal border border-black/50 rounded-md p-2"
              required
            />
            <label
              className="flex flex-col gap-1  text-base font-bold"
              htmlFor="password"
            >
              Password
            </label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-3 bg-white/10 py-2  font-normal border border-black/50 rounded-md p-2"
              required
            />
          </div>
          {error && (
            <div className="text-red-400 text-sm text-center">{error}</div>
          )}
          <div className="flex flex-col gap-4">
            <Button
              variant="contained"
              size="small"
              color="inherit"
              type="submit"
            >
              Sign up
            </Button>
          </div>
          <div className="w-full flex flex-col items-center gap-2 mt-4">
            <span>Do you have an account?</span>
            <Link
              to={"/login"}
              className="w-full border border-black/50 mx-auto text-center rounded-md p-2"
            >
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
