import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import { UserService } from "../services/user.service";
import { useUser } from "../contexts/user.context";
import { type LoginDto } from "../models/login.dto";
import type LoginInformation from "../models/loginInformation";
import { Link } from "react-router-dom";

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
    <div className="">
      <form className="" onSubmit={handleSubmit}>
        <div className="">
          <label className="">
            Email
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className=""
              required
            />
          </label>
          <label className="">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className=""
              required
            />
          </label>
        </div>
        {error && <div className="">{error}</div>}
        <div className="">
          <Button
            variant="contained"
            size="small"
            color="inherit"
            type="submit"
          >
            Sign in
          </Button>
        </div>
        <div className="">
          <div className=""></div>
          <span className="">or</span>
          <div className=""></div>
        </div>
        <div className="">
          <span>Don't have an account yet?</span>
          <Link to={"/singup"} className="">
            Sign up
          </Link>
        </div>
      </form>
    </div>
  );
}
