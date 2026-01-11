import React, { useState } from "react";
import BaseModal from "../atoms/base-modal";
import { FormControl, InputLabel } from "@mui/material";
import Button from "@mui/material/Button";
import { useUser } from "../../contexts/user.context";
import { ChildrenService } from "../../services/children.service";
import { CustomSelect } from "../atoms/CustomSelect";
import { type CreateChildDto } from "../../models/createChild.dto";
import { BootstrapInput } from "./editChildModal";

interface CreateChildModalProps {
  open: {
    families: { name: string; _id: string; members: {_id: string, name: string }[] }[];
    onChildCreated?: () => void;
  } | null;
  onClose: () => void;
}

export default function CreateChildModal({
  open,
  onClose,
}: CreateChildModalProps) {
  const { token } = useUser();
  const [name, setName] = useState("");
  const [familyId, setFamilyId] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [color, setColor] = useState("#3b82f6");
  const [guardians, setGuardians] = useState<string[]>([]);

  if (!open) return null;

  const { families } = open;
  const selectedFamily = families.find((f) => f._id === familyId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data: CreateChildDto = {
        name,
        birthDate,
        color,
        family: familyId,
        guardians,
        isActive: true,
      };

      await ChildrenService.createChild(data, token || "");

      if (open.onChildCreated) {
        await Promise.resolve(open.onChildCreated());
      }

      // Reset form
      setName("");
      setFamilyId("");
      setBirthDate("");
      setColor("#3b82f6");
      setGuardians([]);
      onClose();
    } catch (error) {
      console.error("Error creating child:", error);
      alert("Error creating child. Please try again.");
    }
  };

  return (
    <BaseModal open={!!open} onClose={onClose} title="Create New Child">
      <form
        className="text-sm w-full flex gap-4 flex-col"
        onSubmit={handleSubmit}
      >
        <FormControl variant="standard" required>
          <InputLabel shrink className="text-xl font-bold" htmlFor="childName">
            Child Name
          </InputLabel>
          <BootstrapInput
            type="text"
            value={name}
            name="childName"
            id="childName"
            required
            onChange={(e) => setName(e.target.value)}
          />
        </FormControl>

        <div>
          Family: *
          <CustomSelect
            name="family"
            value={familyId}
            onChange={(value) => {
              setFamilyId(value);
              setGuardians([]);
            }}
            required
            placeholder="Select a family"
            options={
              families?.map((family) => ({
                value: family._id,
                label: family.name,
              })) || []
            }
          />
        </div>

        <FormControl variant="standard" required>
          <InputLabel shrink className="text-xl font-bold" htmlFor="birthDate">
            Birth Date
          </InputLabel>
          <BootstrapInput
            type="date"
            value={birthDate}
            name="birthDate"
            id="birthDate"
            required
            onChange={(e) => setBirthDate(e.target.value)}
          />
        </FormControl>

        <FormControl variant="standard" required>
          <InputLabel
            shrink
            className="text-xl font-bold"
            sx={{ position: "relative" }}
            htmlFor="color"
          >
            Favorite Color
          </InputLabel>
          <BootstrapInput
            type="color"
            value={color}
            name="color"
            id="color"
            required
            onChange={(e) => setColor(e.target.value)}
            isColor
          />
        </FormControl>

        {selectedFamily && selectedFamily.members.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Guardians: *
            </label>
            <div className="border border-gray-300 rounded-md p-2 max-h-40 overflow-y-auto">
              {selectedFamily.members.map((member) => (
                <div key={member._id} className="flex items-center gap-2 p-1">
                  <input
                    type="checkbox"
                    id={`guardian-${member._id}`}
                    value={member._id}
                    checked={guardians.includes(member._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setGuardians([...guardians, member._id]);
                      } else {
                        setGuardians(
                          guardians.filter((id) => id !== member._id),
                        );
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <label
                    htmlFor={`guardian-${member._id}`}
                    className="cursor-pointer"
                  >
                    {member.name}
                  </label>
                </div>
              ))}
            </div>
            {guardians.length === 0 && (
              <p className="text-red-500 text-xs mt-1">
                Please select at least one guardian
              </p>
            )}
          </div>
        )}

        <Button
          type="submit"
          variant="contained"
          disabled={!familyId || guardians.length === 0}
        >
          Create Child
        </Button>
      </form>
    </BaseModal>
  );
}
