import { useState } from "react";
import BaseModal from "../atoms/base-modal";
import Button from "@mui/material/Button";
import { AdminService } from "../../services/admin.service";

interface User {
  _id: string;
  name: string;
  email: string;
  deletedAt?: string;
}

interface RemoveUserModalProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onUserUpdated?: () => void;
}

export default function RemoveUserModal({
  open,
  user,
  onClose,
  onUserUpdated,
}: RemoveUserModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open || !user) return null;

  const handleAction = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await AdminService.deleteUser(user._id);

      if (onUserUpdated) {
        await Promise.resolve(onUserUpdated());
      }

      onClose();
    } catch (err) {
      console.error("Error deleting user:", err);
      setError(
        err instanceof Error
          ? err.message
          : `Error deleting user. Please try again.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BaseModal open={open} onClose={onClose} title={"Remove User"}>
      <div className="text-sm w-full flex gap-4 flex-col text-center">
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-lg font-semibold text-gray-800">{user.name}</p>
          <p className="text-gray-600">{user.email}</p>
        </div>

        <p className="text-gray-600">
          Are you sure you want to{" "}
          <strong className="text-red-600">delete</strong> this user? They will
          no longer be able to log in or access the application.
          <span className="mt-2 font-semibold block">
            This action can be undone by re-enabling the user later.
          </span>
        </p>

        {error && (
          <div className="text-red-500 text-sm text-center p-2 bg-red-50 rounded">
            {error}
          </div>
        )}

        <div className="flex gap-3 mt-4">
          <Button
            variant="outlined"
            onClick={onClose}
            className="flex-1"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color={"error"}
            onClick={handleAction}
            className="flex-1"
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete User"}
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}
