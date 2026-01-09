import { useParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { useUser } from "../contexts/user.context";
import { FamiliesService } from "../services/families.service";
import { Input, TextField, InputLabel } from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import InputBase from "@mui/material/InputBase";
import { FormControl } from "@mui/material";
import Button from "@mui/material/Button";
import { ChildrenService } from "../services/children.service";
import { type CreateChildDto } from "../models/createChild.dto";
import { useNavigate } from "react-router-dom";
import { type InputBaseProps } from "@mui/material/InputBase";

export const WEB_DOMAIN = import.meta.env.WEB_DOMAIN || "http://localhost:5173";

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

const fetchFamilyDetails = async (id: string, token?: string) => {
  try {
    const response = await FamiliesService.getFamilyById(id, token);
    return response;
  } catch (error) {
    console.error("Error fetching family details:", error);
    return null;
  }
};

export default function CreateAChildPage() {
  const params = useParams();
  const { token } = useUser();
  const navigate = useNavigate();
  const [familyDetails, setFamilyDetails] = useState<any>(null);
  const loadFamilyDetails = useCallback(async () => {
    if (params.id && token) {
      const details = await fetchFamilyDetails(params.id, token);
      setFamilyDetails(details);
    }
  }, [params.id, token]);

  useEffect(() => {
    if (params.id && token) {
      loadFamilyDetails();
    }
  }, [params.id, token]);

  if (!familyDetails) {
    return <div>Loading family details...</div>;
  }

  return (
    <section className="max-w-2xl mx-auto">
      <form
        className="flex flex-col gap-4 p-4"
        onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const data: CreateChildDto = {
            name: formData.get("childName")?.toString() || "",
            birthDate: formData.get("birthDate")?.toString() || "",
            color: formData.get("color")?.toString() || "#FFFFFF",
            family: params.id || "",
            guardians: formData.getAll("guardians") as string[],
            isActive: true,
          };
          await ChildrenService.createChild(data, token || "");
          navigate(`/families/${params.id}`);
        }}
      >
        <h2 className="text-2xl font-bold mb-4">
          Add Child to Family {familyDetails.name}
        </h2>
        <label>
          <FormControl variant="standard">
            <InputLabel shrink htmlFor="childName" sx={{ fontSize: "1.2rem" }}>
              Child Name:
            </InputLabel>
            <BootstrapInput name="childName" id="childName" />
          </FormControl>
        </label>
        <label>
          Birth Date:
          <input type="date" name="birthDate" />
        </label>
        <label>
          Favorite Color:
          <input type="color" name="color" />
        </label>
        <label>
          Guardians:
          <select name="guardians" multiple>
            {familyDetails &&
              familyDetails.members.map((member: any) => (
                <option key={member._id} value={member._id}>
                  {member.name}
                </option>
              ))}
          </select>
        </label>

        <br />
        <Button type="submit" variant="contained" className="max-w-xs">
          Add Child
        </Button>
      </form>
    </section>
  );
}

// {
//   "name": "second child",
//   "birthDate": "2018-03-20",
//   "color": "#E74C3C",
//   "family": "690768a368a483764aa5b723",
//   "guardians": ["6907455dd2366e73007ec564"]
// }
// http://localhost:3000/api/children
