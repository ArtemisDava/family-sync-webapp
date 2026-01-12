import React, { useState } from "react";
import BaseModal from "../atoms/base-modal";
import {
  FormControl,
  InputLabel,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import Button from "@mui/material/Button";
import {
  AdminService,
  type AdminCreateUserDto,
} from "../../services/admin.service";
import { BootstrapInput } from "./editChildModal";
import { CustomSelect } from "../atoms/CustomSelect";

interface CreateUserModalProps {
  open: boolean;
  onClose: () => void;
  onUserCreated?: () => void;
}

export default function CreateUserModal({
  open,
  onClose,
  onUserCreated,
}: CreateUserModalProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [color, setColor] = useState("#3b82f6");
  const [role, setRole] = useState<"parent" | "child" | "relative">("parent");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const data: AdminCreateUserDto = {
        email,
        name,
        password,
        birthDate,
        color,
        role,
        isAdmin,
      };

      await AdminService.createUser(data);

      // Reset form
      setEmail("");
      setName("");
      setPassword("");
      setBirthDate("");
      setColor("#3b82f6");
      setRole("parent");
      setIsAdmin(false);

      if (onUserCreated) {
        await Promise.resolve(onUserCreated());
      }

      onClose();
    } catch (err) {
      console.error("Error creating user:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Error creating user. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BaseModal open={open} onClose={onClose} title="Create New User">
      <form
        className="text-sm w-full flex gap-4 flex-col"
        onSubmit={handleSubmit}
      >
        <FormControl variant="standard" required>
          <InputLabel shrink className="text-xl font-bold" htmlFor="userName">
            Name
          </InputLabel>
          <BootstrapInput
            type="text"
            value={name}
            name="userName"
            id="userName"
            required
            onChange={(e) => setName(e.target.value)}
          />
        </FormControl>

        <FormControl variant="standard" required>
          <InputLabel shrink className="text-xl font-bold" htmlFor="userEmail">
            Email
          </InputLabel>
          <BootstrapInput
            type="email"
            value={email}
            name="userEmail"
            id="userEmail"
            required
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormControl>

        <FormControl variant="standard" required>
          <InputLabel
            shrink
            className="text-xl font-bold"
            htmlFor="userPassword"
          >
            Password
          </InputLabel>
          <BootstrapInput
            type="password"
            value={password}
            name="userPassword"
            id="userPassword"
            required
            inputProps={{ minLength: 6 }}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormControl>

        <FormControl variant="standard" required>
          <InputLabel
            shrink
            className="text-xl font-bold"
            htmlFor="userBirthDate"
          >
            Birth Date
          </InputLabel>
          <BootstrapInput
            type="date"
            value={birthDate}
            name="userBirthDate"
            id="userBirthDate"
            required
            onChange={(e) => setBirthDate(e.target.value)}
          />
        </FormControl>

        <FormControl variant="standard" required>
          <InputLabel
            shrink
            className="text-xl font-bold"
            sx={{ position: "relative" }}
            htmlFor="userColor"
          >
            Theme Color
          </InputLabel>
          <BootstrapInput
            type="color"
            value={color}
            name="userColor"
            id="userColor"
            required
            onChange={(e) => setColor(e.target.value)}
            isColor
          />
        </FormControl>

        <div>
          Role:
          <CustomSelect
            name="role"
            value={role}
            onChange={(value) =>
              setRole(value as "parent" | "child" | "relative")
            }
            options={[
              { value: "parent", label: "Parent" },
              { value: "child", label: "Child" },
              { value: "relative", label: "Relative" },
            ]}
          />
        </div>

        <FormControlLabel
          control={
            <Checkbox
              checked={isAdmin}
              onChange={(e) => setIsAdmin(e.target.checked)}
              color="primary"
            />
          }
          label="Admin privileges"
        />

        {error && (
          <div className="text-red-500 text-sm text-center p-2 bg-red-50 rounded">
            {error}
          </div>
        )}

        <Button type="submit" variant="contained" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create User"}
        </Button>
      </form>
    </BaseModal>
  );
}
