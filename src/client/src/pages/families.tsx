import { useParams } from "react-router-dom";
import { useEffect, useCallback, useState } from "react";
import { useUser } from "../contexts/user.context";
import { FamiliesService } from "../services/families.service";
import { Button } from "@mui/material";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { Input } from "@mui/material";
import Box from "@mui/material/Box";
import { IonIcon } from "@ionic/react";
import {
  peopleOutline,
  trashOutline,
  colorFilterOutline,
  eyeOutline,
} from "ionicons/icons";
import Chip from "@mui/material/Chip";
import { useNavigate } from "react-router-dom";

export const WEB_DOMAIN = import.meta.env.WEB_DOMAIN || "http://localhost:5173";

const fetchFamilyDetails = async (id: string, token?: string) => {
  try {
    const response = await FamiliesService.getFamilyById(id, token);
    return response;
  } catch (error) {
    console.error("Error fetching family details:", error);
    return null;
  }
};

export default function FamiliesPage() {
  const navigate = useNavigate();
  const { user, token } = useUser();
  const [familyDetails, setFamilyDetails] = useState<any>(null);
  const [toggleEditMode, setToggleEditMode] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const params = useParams();
  const [tab, setTab] = useState(0);
  const [childs, setChilds] = useState([]);

  const loadFamilyDetails = useCallback(async () => {
    if (params.id && token) {
      const details = await fetchFamilyDetails(params.id, token);
      setFamilyDetails(details);
      const currentUser = details.members.find(
        (m: any) => m._id === user?.userId
      );
      setUserRole(currentUser ? currentUser.role : null);
    }
  }, [params.id, token]);

  useEffect(() => {
    if (params.id && token) {
      loadFamilyDetails();
    }
  }, [params.id, token]);

  if (!familyDetails) {
    return (
      <section>
        <h1>Loading Family Details...</h1>
      </section>
    );
  }

  return (
    <section className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Family {familyDetails.name}</h1>

      <p>Manage family members and invite new people to join your family.</p>

      <div className="max-w-md mx-auto my-4">
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
          <Tabs
            value={tab}
            onChange={(_, newValue) => {
              setTab(newValue);
            }}
            variant="fullWidth"
          >
            <Tab label="Members" />
            <Tab label="Invite People" />
            <Tab label="Childs" />
          </Tabs>
        </Box>
        {tab == 0 && (
          <>
            <div className="flex flex-row items-center mb-4">
              <IonIcon icon={peopleOutline} className="p-2 text-2xl" />
              <p>Members ({familyDetails.members.length})</p>
            </div>
            <ul className="list-disc list-inside">
              {familyDetails.members.map((member: any) => (
                <li
                  key={member._id}
                  className="relative before:content-['•'] before:left-0 before:text-2xl before:text-gray-500 w-full flex items-center mb-2 justify-center"
                >
                  <div className="pl-4 flex justify-between items-center  w-full">
                    <p>{member.name}</p>
                    <div className="flex items-center space-x-2 justify-center gap-2">
                      {toggleEditMode &&
                        userRole == "parent" &&
                        member.role != "parent" && (
                          <>
                            <Button
                              variant="text"
                              color="error"
                              onClick={async () => {
                                const confirmRemove = window.confirm(
                                  `Are you sure you want to remove ${member.name} from the family?`
                                );
                                if (confirmRemove && params.id && token) {
                                  await FamiliesService.removeFamilyMember(
                                    params.id,
                                    member._id,
                                    token
                                  );
                                  loadFamilyDetails();
                                }
                              }}
                            >
                              <IonIcon
                                icon={trashOutline}
                                className="p-2 text-xl"
                              />
                            </Button>
                          </>
                        )}
                      <Chip
                        label={member.role}
                        className="capitalize"
                        color={member.role === "parent" ? "primary" : "default"}
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
        {tab == 1 && (
          <>
            <p>
              Invite new members to your family by sharing the invite link
              below:
            </p>
            <Input
              value={`${WEB_DOMAIN}/invite/${familyDetails._id}`}
              readOnly
              fullWidth
            />
          </>
        )}
        {tab == 2 && (
          <>
            <div className="flex flex-row items-center mb-4">
              <IonIcon icon={colorFilterOutline} className="p-2 text-2xl" />
              <p>Children ({familyDetails.children.length})</p>
            </div>
            <ul className="list-disc list-inside">
              {familyDetails.children.map((child: any) => (
                <li
                  key={child._id}
                  className="relative before:content-['•'] before:left-0 before:text-2xl before:text-gray-500 w-full flex items-center mb-2 justify-center"
                >
                  <div className="pl-4 flex justify-between items-center  w-full">
                    <p>{child.name}</p>
                    <div className="flex items-center space-x-2 justify-center gap-2">
                      {toggleEditMode &&
                        userRole == "parent" &&
                        child.role != "parent" && (
                          <>
                            <Button
                              variant="text"
                              color="error"
                              onClick={async () => {
                                const confirmRemove = window.confirm(
                                  `Are you sure you want to remove ${child.name} from the family?`
                                );
                                if (confirmRemove && params.id && token) {
                                  await FamiliesService.removeChildFromFamily(
                                    params.id,
                                    child._id,
                                    token
                                  );
                                  loadFamilyDetails();
                                }
                              }}
                            >
                              <IonIcon
                                icon={trashOutline}
                                className="p-2 text-xl"
                              />
                            </Button>
                          </>
                        )}
                      <Button
                        variant="text"
                        color="info"
                        onClick={async () => {
                          navigate(`/child/${child._id}`);
                        }}
                      >
                        <IonIcon icon={eyeOutline} className="p-2 text-xl" />
                      </Button>
                      <Chip
                        label="Child"
                        className="capitalize"
                        color={"info"}
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
        <div className="flex flex-col gap-4 mt-8">
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate(`/families/${params.id}/add-child`)}
          >
            Add Child
          </Button>

          <Button
            variant={toggleEditMode ? "contained" : "outlined"}
            color="secondary"
            onClick={() => setToggleEditMode(!toggleEditMode)}
          >
            Edit Family
          </Button>

          {toggleEditMode && (
            <>
              <Button
                variant="contained"
                color="error"
                onClick={async () => {
                  const confirmDelete = window.confirm(
                    "Are you sure you want to delete this family? This action cannot be undone."
                  );
                  if (confirmDelete && params.id && token) {
                    await FamiliesService.deleteFamily(params.id, token);
                    navigate("/profile");
                  }
                }}
                className="mt-4"
              >
                Delete Family
              </Button>
              <Button
                variant="outlined"
                onClick={() => setToggleEditMode(false)}
              >
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
