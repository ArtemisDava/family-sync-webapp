import React, { useState, useEffect } from "react";
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
  type AdminUpdateUserDto,
} from "../../services/admin.service";
import { BootstrapInput } from "./editChildModal";
import { CustomSelect } from "../atoms/CustomSelect";

interface UserToEdit {
  _id: string;
  name: string;
  email: string;
  birthDate?: string;
  color?: string;
  phoneNumber?: string;
  deletedAt?: Date;
  role?: "parent" | "child" | "relative";
  isAdmin?: boolean;
}

interface EditUserModalProps {
  open: boolean;
  user: UserToEdit | null;
  onClose: () => void;
  onUserUpdated?: () => void;
}

export default function EditUserModal({
  open,
  user,
  onClose,
  onUserUpdated,
}: EditUserModalProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [color, setColor] = useState("#3b82f6");
  const [role, setRole] = useState<"parent" | "child" | "relative">("parent");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleted, setIsDeleted] = useState(false);

  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
      setName(user.name || "");
      setBirthDate(user.birthDate ? user.birthDate.split("T")[0] : "");
      setColor(user.color || "#3b82f6");
      setRole(user.role || "parent");
      setIsAdmin(user.isAdmin || false);
    }
  }, [user]);

  if (!open || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (isDeleted) {
      const confirmDelete = window.confirm(
        "Are you sure you want to mark this user as deleted? This action cannot be undone."
      );
      if (!confirmDelete) {
        setIsLoading(false);
        return;
      }
      await AdminService.deleteUser(user._id);
      if (onUserUpdated) {
        await Promise.resolve(onUserUpdated());
      }
      setIsLoading(false);
      onClose();
      return;
    }

    try {
      const data: AdminUpdateUserDto = {
        email,
        name,
        birthDate,
        color,
        role,
        isAdmin,
        deletedAt: isDeleted ? new Date() : null,
      };

      await AdminService.updateUser(user._id, data);

      if (onUserUpdated) {
        await Promise.resolve(onUserUpdated());
      }

      onClose();
    } catch (err) {
      console.error("Error updating user:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Error updating user. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BaseModal open={open} onClose={onClose} title="Edit User">
      <form
        className="text-sm w-full flex gap-4 flex-col"
        onSubmit={handleSubmit}
      >
        <div className="p-3 bg-gray-50 rounded-lg mb-2">
          <p className="text-xs text-gray-500">User ID</p>
          <p className="text-sm font-mono text-gray-700">{user._id}</p>
        </div>

        <FormControl variant="standard" required>
          <InputLabel
            shrink
            className="text-xl font-bold"
            htmlFor="editUserName"
          >
            Name
          </InputLabel>
          <BootstrapInput
            type="text"
            value={name}
            name="editUserName"
            id="editUserName"
            required
            onChange={(e) => setName(e.target.value)}
          />
        </FormControl>

        <FormControl variant="standard" required>
          <InputLabel
            shrink
            className="text-xl font-bold"
            htmlFor="editUserEmail"
          >
            Email
          </InputLabel>
          <BootstrapInput
            type="email"
            value={email}
            name="editUserEmail"
            id="editUserEmail"
            required
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormControl>

        <FormControl variant="standard" required>
          <InputLabel
            shrink
            className="text-xl font-bold"
            htmlFor="editUserBirthDate"
          >
            Birth Date
          </InputLabel>
          <BootstrapInput
            type="date"
            value={birthDate}
            name="editUserBirthDate"
            id="editUserBirthDate"
            required
            onChange={(e) => setBirthDate(e.target.value)}
          />
        </FormControl>

        <FormControl variant="standard" required>
          <InputLabel
            shrink
            className="text-xl font-bold"
            sx={{ position: "relative" }}
            htmlFor="editUserColor"
          >
            Theme Color
          </InputLabel>
          <BootstrapInput
            type="color"
            value={color}
            name="editUserColor"
            id="editUserColor"
            required
            onChange={(e) => setColor(e.target.value)}
            isColor
          />
        </FormControl>

        <div>
          Role:
          <CustomSelect
            name="editRole"
            value={role}
            onChange={(value) => setRole(value as "parent" | "relative")}
            options={[
              { value: "parent", label: "Parent" },
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

        <FormControlLabel
          control={
            <Checkbox
              checked={isDeleted}
              onChange={(e) => setIsDeleted(e.target.checked)}
              color="primary"
            />
          }
          label="Mark as Deleted"
        />

        {isDeleted && (
          <p className="text-sm text-red-600">
            This user will be marked as deleted and will not be able to access
            their account.
          </p>
        )}

        {error && (
          <div className="text-red-500 text-sm text-center p-2 bg-red-50 rounded">
            {error}
          </div>
        )}

        <div className="flex gap-3 mt-2">
          <Button
            variant="outlined"
            onClick={onClose}
            className="flex-1"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            className="flex-1"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </BaseModal>
  );
}
