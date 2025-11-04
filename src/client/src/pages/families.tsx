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
import { peopleOutline } from "ionicons/icons";
import Chip from "@mui/material/Chip";

export const WEB_DOMAIN = import.meta.env.WEB_DOMAIN || "http://localhost:5173";

const fetchFamilyDetails = async (id: string, token?: string) => {
  try {
    const response = await FamiliesService.getFamilyById(id, token);
    console.log("Fetched family details:", response);
    return response;
  } catch (error) {
    console.error("Error fetching family details:", error);
    return null;
  }
};

export default function FamiliesPage() {
  const { user, token } = useUser();
  const [familyDetails, setFamilyDetails] = useState<any>(null);
  const params = useParams();
  const [tab, setTab] = useState(0);
  const [childs, setChilds] = useState([]);

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
    console.log("Loading family details for ID:", familyDetails);
    return (
      <section>
        <h1>Loading Family Details...</h1>
      </section>
    );
  }

  console.log("Family ID:", params.id);
  return (
    <section className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Family {familyDetails.name}</h1>

      <p>Manage family members and invite new people to join your family.</p>

      <div className="max-w-md mx-auto my-4">
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
          <Tabs
            value={tab}
            onChange={(_, newValue) => setTab(newValue)}
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
                  <div className="pl-4 flex justify-between  w-full">
                    <p>{member.name}</p>
                    <Chip
                      label={member.role}
                      className="capitalize"
                      color={member.role === "parent" ? "primary" : "default"}
                    />
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
        {tab == 3 && (
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
      </div>
    </section>
  );
}
