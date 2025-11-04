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
    <form
      className="flex flex-col w-full max-w-80 mx-auto
          text-start gap-8 text-base font-normal"
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col gap-4">
        {invite && (
          <div className="p-4 bg-green-600 rounded text-white text-center font-bold">
            You have been invited! Please sign up to join.
          </div>
        )}
        <label className="flex flex-col gap-1 text-base font-bold">
          Email
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded px-3 py-2 bg-white/10 font-normal"
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-base font-bold">
          Name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded px-3 py-2 bg-white/10 font-normal"
            required
          />
        </label>
        <label className="flex flex-col gap-1  text-base font-bold">
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded px-3 bg-white/10 py-2  font-normal"
            required
          />
        </label>
      </div>
      {error && <div className="text-red-400 text-sm text-center">{error}</div>}
      <div className="flex flex-col gap-4">
        <Button variant="contained" size="small" color="inherit" type="submit">
          Sign up
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-white"></div>
        <span className="text-xs font-bold">or</span>
        <div className="h-px flex-1 bg-white"></div>
      </div>
      <div className="flex flex-col items-center font-bold">
        <span>Do you have an account?</span>
        <Link
          to={"/login"}
          className="flex cursor-pointer items-center gap-1 text-[#EB634B] transition hover:text-[#6DBE45]"
        >
          Sign in
        </Link>
      </div>
    </form>
  );
}
