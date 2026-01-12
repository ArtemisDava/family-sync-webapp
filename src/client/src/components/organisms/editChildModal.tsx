import React, { useState, useEffect } from "react";
import BaseModal from "../atoms/base-modal";
import { FormControl, InputLabel } from "@mui/material";
import Button from "@mui/material/Button";
import { useUser } from "../../contexts/user.context";
import { ChildrenService } from "../../services/children.service";
import { styled, alpha } from "@mui/material/styles";
import { type InputBaseProps } from "@mui/material/InputBase";
import InputBase from "@mui/material/InputBase";

interface BootstrapInputProps extends InputBaseProps {
  isColor?: boolean;
}

export const BootstrapInput = styled(InputBase, {
  shouldForwardProp: (prop) => prop !== "isColor",
})<BootstrapInputProps>(({ theme, isColor }) => ({
  "label + &": {
    marginTop: isColor ? 0 : theme.spacing(3),
  },
  "& .MuiInputBase-input": {
    borderRadius: 4,
    position: "relative",
    backgroundColor: "#F3F6F9",
    border: "1px solid",
    borderColor: "#E0E3E7",
    fontSize: 16,
    width: "100%",
    padding: "10px 12px",
    transition: theme.transitions.create([
      "border-color",
      "background-color",
      "box-shadow",
    ]),
    "&:focus": {
      boxShadow: `${alpha(theme.palette.primary.main, 0.25)} 0 0 0 0.2rem`,
      borderColor: theme.palette.primary.main,
    },
  },
  "& input[type='color']": {
    appearance: "none",
    WebkitAppearance: "none",
    border: "none",
    padding: 0,
    width: 34,
    height: 34,
    cursor: "pointer",
    borderRadius: 6,
    background: "none",

    boxShadow: "0 0 0 1px #ccc inset",

    "&::-webkit-color-swatch-wrapper": {
      padding: 0,
    },
    "&::-webkit-color-swatch": {
      border: "none",
      borderRadius: 6,
    },
    "&::-moz-color-swatch": {
      border: "none",
      borderRadius: 6,
    },
    "&:focus": {
      outline: `2px solid ${theme.palette.primary.main}`,
      outlineOffset: 2,
    },
  },
  "label + & input[type='color']": {
    marginTop: 0,
  },
}));

interface Child {
  _id: string;
  name: string;
  birthDate: string;
  color?: string;
  family: string;
  guardians?: (string | { _id: string; name: string })[];
}

interface EditChildModalProps {
  open: {
    child: Child;
    familyMembers: { _id: string; name: string }[];
    onChildUpdated?: () => void;
  } | null;
  onClose: () => void;
}

export default function EditChildModal({ open, onClose }: EditChildModalProps) {
  const { token } = useUser();
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [color, setColor] = useState("#3b82f6");
  const [guardians, setGuardians] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open?.child) {
      setName(open.child.name);
      setBirthDate(open.child.birthDate?.split("T")[0] || "");
      setColor(open.child.color || "#3b82f6");
      const guardianIds = (open.child.guardians || []).map((guardian) =>
        typeof guardian === "string" ? guardian : guardian?._id || ""
      );
      setGuardians(guardianIds.filter((id) => id !== ""));
    }
  }, [open]);

  if (!open) return null;

  const { child, familyMembers, onChildUpdated } = open;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await ChildrenService.patchChild(
        child._id,
        {
          name,
          birthDate,
          color,
          guardians,
        },
        token || ""
      );

      if (onChildUpdated) {
        await Promise.resolve(onChildUpdated());
      }

      onClose();
    } catch (error) {
      console.error("Error updating child:", error);
      alert("Error updating child. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BaseModal open={!!open} onClose={onClose} title="Edit Child">
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
            Theme Color
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

        {familyMembers && familyMembers.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Guardians: *
            </label>
            <div className="border border-gray-300 rounded-md p-2 max-h-40 overflow-y-auto">
              {familyMembers.map((member) => (
                <div key={member._id} className="flex items-center gap-2 p-1">
                  <input
                    type="checkbox"
                    id={`guardian-edit-${member._id}`}
                    value={member._id}
                    checked={guardians.includes(member._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setGuardians([...guardians, member._id]);
                      } else {
                        setGuardians(
                          guardians.filter((id) => id !== member._id)
                        );
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <label
                    htmlFor={`guardian-edit-${member._id}`}
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

        <div className="flex gap-3">
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting || guardians.length === 0}
            fullWidth
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
          <Button type="button" variant="outlined" onClick={onClose} fullWidth>
            Cancel
          </Button>
        </div>
      </form>
    </BaseModal>
  );
}
