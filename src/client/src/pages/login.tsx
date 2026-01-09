import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import { UserService } from "../services/user.service";
import { useUser } from "../contexts/user.context";
import { type LoginDto } from "../models/login.dto";
import type LoginInformation from "../models/loginInformation";
import { Link } from "react-router-dom";
import { IonIcon } from "@ionic/react";
import { arrowBack } from "ionicons/icons";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const { login } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const loginData: LoginDto = {
      email,
      password,
    };

    try {
      const result: LoginInformation = await UserService.login(loginData);

      login(result, result.accessToken);
      setEmail("");
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
        <h1 className="text-2xl font-bold mb-4">Welcome back!</h1>

        <form className="my-20" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4 mb-4">
            <label className="" htmlFor="email">
              Email
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border border-black/50 rounded-md p-2"
              name="email"
            />
            <label className="" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              value={password}
              name="password"
              onChange={(e) => setPassword(e.target.value)}
              className="border border-black/50 rounded-md p-2"
              required
            />
          </div>
          {error && <div className="">{error}</div>}
          <div className="">
            <Button
              variant="contained"
              size="small"
              color="secondary"
              type="submit"
              fullWidth={true}
              sx={{ px: 4, py: 1 }}
            >
              Login
            </Button>
          </div>
          <div className="w-full flex flex-col items-center gap-2 mt-4">
            <p>Don't have an account yet?</p>
            <Link
              to={"/singup"}
              className="w-full border border-black/50 mx-auto text-center rounded-md p-2"
            >
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
