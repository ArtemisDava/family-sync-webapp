import { useNavigate, useParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { useUser } from "../contexts/user.context";
import { ChildrenService } from "../services/children.service";
import { Button, InputLabel, FormControl } from "@mui/material";
import { BootstrapInput } from "./add-child";
import { FamiliesService } from "../services/families.service";

const fetchFamilyDetails = async (id: string, token?: string) => {
  try {
    const response = await FamiliesService.getFamilyById(id, token);
    return response;
  } catch (error) {
    console.error("Error fetching family details:", error);
    return null;
  }
};

export default function ChildPage() {
  const navigate = useNavigate();
  const params = useParams();
  const { token, user } = useUser();
  const [childrenDetails, setChildrenDetails] = useState<any>(null);
  const [familyDetails, setFamilyDetails] = useState<any>(null);

  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [color, setColor] = useState("#000000");

  const [age, setAge] = useState<{ year: number; month: number }>({
    year: 0,
    month: 0,
  });

  const [editMode, setEditMode] = useState(false);

  const loadChildrenDetails = useCallback(async () => {
    if (params.id && token) {
      const details = await ChildrenService.getChildrenById(
        params.id,
        token || ""
      );
      setChildrenDetails(details);
      const familyDetails = await fetchFamilyDetails(details.family._id, token);
      setFamilyDetails(familyDetails);
      setName(details.name);
      setColor(details.color);
      setBirthDate(new Date(details.birthDate));
      const childBirthDate = new Date(details.birthDate);
      const today = new Date();
      let years = today.getFullYear() - childBirthDate.getFullYear();
      let months = today.getMonth() - childBirthDate.getMonth();
      let days = today.getDate() - childBirthDate.getDate();

      if (days < 0) {
        months--;
        days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
      }

      if (months < 0) {
        years--;
        months += 12;
      }

      setAge({ year: years, month: months });
    }
  }, [params.id, token]);

  useEffect(() => {
    if (params.id && token) {
      loadChildrenDetails();
    }
  }, [params.id, token]);

  if (!childrenDetails) {
    return (
      <section>
        <h1>Loading Children Details...</h1>
      </section>
    );
  }

  return (
    <>
      <section className="p-6 bg-white rounded shadow-md max-w-xl mx-auto mt-10 flex justify-between">
        <div>
          {!editMode && (
            <>
              <h1 className="text-xl font-bold mb-4">{childrenDetails.name}</h1>
              <h2 className="text-lg mb-2">
                {age.year > 1 && `${age.year} years and `}
                {age.month} months
              </h2>
              <p className="mb-2">
                Birth Date: {new Date(childrenDetails.birthDate).toDateString()}
              </p>
              <p className="mb-2">
                Favorite Color:{" "}
                <span
                  style={{ backgroundColor: childrenDetails.color }}
                  className="size-6 inline-block"
                ></span>
              </p>
              <p className="mb-2">Family {childrenDetails.family.name}</p>
              <p className="mb-2">Guardians:</p>
              <ul className="list-disc list-inside">
                {childrenDetails.guardians.map((guardian: any) => (
                  <li key={guardian._id}>{guardian.name}</li>
                ))}
              </ul>
            </>
          )}

          {editMode && (
            <form
              className="flex flex-col"
              onSubmit={async (e) => {
                e.preventDefault();
                await ChildrenService.patchChild(
                  childrenDetails._id,
                  {
                    name: name,
                    birthDate: birthDate!.toISOString(),
                    color: color,
                    guardians: Array.from(
                      e.currentTarget.guardians as HTMLOptionElement[]
                    )
                      .filter((v: HTMLOptionElement) => v.selected)
                      .map((option: any) => option.value),
                  },
                  token || ""
                );
                await loadChildrenDetails();
                setEditMode(false);
              }}
            >
              <FormControl variant="standard">
                <InputLabel shrink className="text-xl font-bold" htmlFor="name">
                  Name
                </InputLabel>
                <BootstrapInput
                  type="name"
                  value={name}
                  id="name"
                  onChange={(e) => setName(e.target.value)}
                />
              </FormControl>
              <FormControl variant="standard" className="mt-4">
                <InputLabel shrink className="text-xl font-bold" htmlFor="age">
                  Birthdate
                </InputLabel>
                <BootstrapInput
                  type="date"
                  defaultValue={birthDate?.toISOString().split("T")[0]}
                  onChange={(e) => setBirthDate(new Date(e.target.value))}
                />
              </FormControl>
              <FormControl variant="standard" className="mt-4">
                <InputLabel
                  shrink
                  className="text-xl font-bold"
                  htmlFor="favorite-color"
                  sx={{ position: "unset" }}
                >
                  Favorite Color
                </InputLabel>
                <BootstrapInput
                  type="color"
                  id="favorite-color"
                  defaultValue={color}
                  onChange={(e) => setColor(e.target.value)}
                  isColor
                />
              </FormControl>
              <div>
                Guardians:
                <select
                  name="guardians"
                  multiple
                  defaultValue={childrenDetails.guardians.map(
                    (g: any) => g._id
                  )}
                  className="w-full mt-2 border border-gray-300 rounded px-3 py-2"
                >
                  {familyDetails &&
                    familyDetails.members.map((member: any) => (
                      <option key={member._id} value={member._id}>
                        {member.name}
                      </option>
                    ))}
                </select>
              </div>
              <Button
                variant="contained"
                color="primary"
                className="mt-6"
                type="submit"
              >
                Save Changes
              </Button>
            </form>
          )}
        </div>
        <div>
          {!editMode && (
            <>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setEditMode(true)}
              >
                Edit Child
              </Button>
            </>
          )}
        </div>
      </section>
    </>
  );
}
