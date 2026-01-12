import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import { UserService } from "../services/user.service";
import { Link } from "react-router-dom";
import type { SignUpDto } from "../models/signup.dto";
import { useSearchParams } from "react-router-dom";
import { IonIcon } from "@ionic/react";
import { arrowBack } from "ionicons/icons";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [color, setColor] = useState("#3b82f6");
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
      birthDate,
      color,
      ...(invite ? { invite } : {}),
    };

    try {
      await UserService.signUp(signUpData);

      setEmail("");
      setName("");
      setPassword("");
      setBirthDate("");
      setColor("#3b82f6");
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
    <div className="flex items-center justify-center lg:gap-6  min-h-[86vh] lg:p-0 mx-auto lg:max-w-[72rem] flex-col lg:flex-row">
      <div className="mb-6 bg-logo2 max-w-sm min-w-xs lg:w-1/2 lg:max-w-none min-h-60 lg:min-h-[86vh] flex items-center justify-center">
        <h1 className="text-3xl font-bold mt-12">Family-Sync</h1>
      </div>
      <div className="w-full lg:w-1/2 p-6">
        <button
          className="flex items-center gap-2 mb-4 cursor-pointer opacity-75 hover:opacity-100"
          onClick={() => navigate(-1)}
        >
          <IonIcon icon={arrowBack} className="p-2 text-" />
          <span className="text-md font-medium cursor-pointer">Back</span>
        </button>
        <h1 className="text-2xl font-bold mb-2">Create an account</h1>

        <form
          className="flex flex-col w-full my-8 lg:my-20
          text-start  gap-2 lg:gap-4 mb-4 text-base font-normal"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-2 lg:gap-4 mb-4">
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
              className="bg-white/10 font-normal border border-black/50 rounded-md p-1"
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
              className="bg-white/10 font-normal border border-black/50 rounded-md p-1"
              required
            />
            <label
              className="flex flex-col gap-1 text-base font-bold"
              htmlFor="birthDate"
            >
              Birth Date
            </label>
            <input
              type="date"
              value={birthDate}
              name="birthDate"
              onChange={(e) => setBirthDate(e.target.value)}
              className="bg-white/10 font-normal border border-black/50 rounded-md p-1"
              required
            />
            <label
              className="flex flex-col gap-1 text-base font-bold"
              htmlFor="color"
            >
              Theme Color
            </label>
            <input
              type="color"
              value={color}
              name="color"
              onChange={(e) => setColor(e.target.value)}
              className="h-8 w-full cursor-pointer rounded-md border border-black/50"
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
              className="bg-white/10 font-normal border border-black/50 rounded-md p-1"
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
              sx={{ px: 4, py: 0.5 }}
            >
              Sign up
            </Button>
          </div>
          <div className="w-full flex flex-col items-center gap-2 mt-4">
            <span>Do you have an account?</span>
            <Link
              to={"/login"}
              className="w-full border border-black/50 mx-auto text-center rounded-md p-1"
            >
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
