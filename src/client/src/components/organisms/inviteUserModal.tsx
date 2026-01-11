import { useState } from "react";
import BaseModal from "../atoms/base-modal";
import { CustomSelect } from "../atoms/CustomSelect";

interface InviteUserModalProps {
  open: {
    user: { _id: string; name: string; email: string };
    families: { name: string; _id: string }[];
  };
  onClose: () => void;
}

export default function InviteUserModal({
  open,
  onClose,
}: InviteUserModalProps) {
  const [selectedFamily, setSelectedFamily] = useState<string>(
    open.families[0]?._id || "",
  );

  const handleSendInvite = () => {
    onClose();
  };

  return (
    <BaseModal open={!!open} onClose={onClose} title="Inviting to someone">
      <div className="w-full max-w-sm mx-auto flex flex-col gap-6">
        <div>
          <label className="block text-sm font-semibold mb-2">Family:</label>
          <CustomSelect
            name="family"
            value={selectedFamily}
            onChange={(value) => {
            setSelectedFamily(value);
            }}
            required
            placeholder="Select a family"
            options={
            open.families.map((family) => ({
                value: family._id,
                label: family.name,
            })) || []
            }
        />
        </div>

        <p className="text-center text-gray-700">
          Are you sure to invite to {open.user.name} to your family?
        </p>

        <div className="flex justify-between gap-4 mt-4">
          <button
            onClick={onClose}
            className="px-6 py-2 text-red-600 font-semibold hover:text-red-700 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSendInvite}
            className="px-6 py-2 text-gray-800 font-semibold hover:text-gray-900 cursor-pointer"
          >
            Send Invite
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
