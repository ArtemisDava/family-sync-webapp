import React, { useEffect, useCallback } from "react";
import { useUser } from "../contexts/user.context";
import { Button } from "@mui/material";
import { IonIcon } from "@ionic/react";
import { settingsOutline } from "ionicons/icons";
import { FamiliesService } from "../services/families.service";
import { Input } from "@mui/material";
import { UserService } from "../services/user.service";
import { Link } from "react-router-dom";

const fetchFamilies = async (token?: string) => {
  try {
    const families = await FamiliesService.getFamilies(token);
    console.log("Fetched families:", families);
  } catch (error) {
    console.error("Error fetching families:", error);
  }
};

export default function ProfilePage() {
  const { user, token } = useUser();
  const [toggleNewFamily, setToggleNewFamily] = React.useState(false);
  const [families, setFamilies] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [toggleEditProfile, setToggleEditProfile] = React.useState(false);
  const [email, setEmail] = React.useState(user?.email || "");

  const loadFamilies = useCallback(async () => {
    if (token) {
      try {
        const fetchedFamilies = await FamiliesService.getFamilies(token);
        setFamilies(fetchedFamilies);
      } catch (error) {
        console.error("Error fetching families:", error);
      }
    }
  }, [token]);

  useEffect(() => {
    if (!user) {
      window.location.href = "/";
      return;
    }
    loadFamilies();
  }, [user, loadFamilies]);

  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault();

    const newFamily = await FamiliesService.createFamily(
      (e.target as HTMLFormElement).familyName.value,
      token || ""
    );

    console.log("Created family:", newFamily);
    setFamilies((prevFamilies) => [...prevFamilies, newFamily]);
    setToggleNewFamily(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Profile Page</h1>
      <p>This is the profile page. User details will be displayed here.</p>

      <section className="mt-6  border border-black/20  rounded-lg shadow-sm p-4 flex flex-row justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold mb-2">User Information</h2>
          <p>{user?.name}</p>
          {!toggleEditProfile && <p>{email}</p>}
          {toggleEditProfile && (
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          )}
          <p>Managing {families.length} families</p>
        </div>
        <div className="flex gap-4">
          {!toggleEditProfile && (
            <Button
              variant="contained"
              color="primary"
              className="mt-4"
              onClick={() => setToggleEditProfile(true)}
            >
              <IonIcon icon={settingsOutline} className="p-2 text-2xl" />
              Edit Profile
            </Button>
          )}
          {toggleEditProfile && (
            <>
              <Button
                variant="contained"
                color="error"
                className="mt-4 ml-4"
                onClick={async () => {
                  const confirmDelete = window.confirm(
                    "Are you sure you want to delete your account? This action cannot be undone."
                  );
                  if (confirmDelete) {
                    await UserService.deleteUser();
                  }
                }}
              >
                Delete Account
              </Button>
              <Button
                variant="contained"
                color="secondary"
                className="mt-4"
                onClick={() => {
                  setToggleEditProfile(false);
                  setEmail(user?.email || "");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                className="mt-4 ml-4"
                onClick={async () => {
                  try {
                    const response = await UserService.updateUser({ email });
                    alert("Profile updated successfully.");
                    setToggleEditProfile(false);
                  } catch (error) {
                    console.error("Error updating profile:", error);
                    setEmail(user?.email || "");
                    setToggleEditProfile(false);
                    alert("Failed to update profile.");
                  }
                }}
              >
                Save Changes
              </Button>
            </>
          )}
        </div>
      </section>
      <section className="mt-6">
        <div className="flex flex-row justify-between items-center p-4">
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold">Your families</h2>
            <p>Manage your family groups and track shared expenses.</p>
          </div>
          <div className="flex flex-col">
            <Button
              variant="contained"
              color="primary"
              onClick={() => setToggleNewFamily(true)}
            >
              Create Family
            </Button>
            {toggleNewFamily && (
              <form className="mt-4" onSubmit={handleCreateFamily}>
                <input
                  type="text"
                  placeholder="Family Name"
                  className="border border-gray-300 rounded p-2 mr-2"
                  name="familyName"
                  required
                />
                <Button variant="contained" color="primary" type="submit">
                  Create
                </Button>
              </form>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 min-h-[200px]">
          {families.map((family) => (
            <Link
              key={family._id}
              className="border border-gray-300 rounded-lg p-4 shadow hover:shadow-lg transition"
              to={`/families/${family._id}`}
            >
              <h3 className="text-lg font-semibold mb-2">{family.name}</h3>
              <p>Members: {family.members.length}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
