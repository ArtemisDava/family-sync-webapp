import React, { useEffect, useCallback, useState } from "react";
import { useUser } from "../contexts/user.context";
import { Button, Tooltip } from "@mui/material";
import { IonIcon } from "@ionic/react";
import {
  trashOutline,
  checkmarkOutline,
  linkOutline,
  closeOutline,
  settingsOutline,
} from "ionicons/icons";
import { FamiliesService } from "../services/families.service";
import { Input } from "@mui/material";
import { UserService } from "../services/user.service";
import { ChildrenService } from "../services/children.service";
import { InvitationService } from "../services/invitation.service";
import { type Family } from "../models/event";
import Card from "../components/atoms/card";
import { useModal } from "../contexts/modal.context";
import { formatDate } from "../utils/date.utils";

const WEB_DOMAIN = import.meta.env.WEB_DOMAIN || "http://localhost:5173";

export default function ProfilePage() {
  const { user, token, setUser } = useUser();
  const { invokeCreateChildModal, invokeEditChildModal } = useModal();
  const [toggleNewFamily, setToggleNewFamily] = React.useState(false);
  const [families, setFamilies] = React.useState<Family[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [name, setName] = React.useState(user?.name || "");
  const [email, setEmail] = React.useState(user?.email || "");
  const [password, setPassword] = React.useState("");
  const [color, setColor] = React.useState(user?.color || "#000000");
  const [children, setChildren] = React.useState<
    {
      _id: string;
      name: string;
      birthDate: string;
      color?: string;
      family: { _id: string };
      guardians?: string[];
    }[]
  >([]);
  const [currentView, setCurrentView] = React.useState<
    "settings" | "family" | "children" | "invitations"
  >("family");
  const [isSaving, setIsSaving] = React.useState(false);
  const [copiedFamilyId, setCopiedFamilyId] = useState<string | null>(null);
  const [editingFamilyId, setEditingFamilyId] = useState<string | null>(null);
  const [editingFamilyName, setEditingFamilyName] = useState("");
  const [invitations, setInvitations] = useState<
    {
      _id: string;
      familyId: { _id: string; name: string };
      invitedByUser: { _id: string; name: string };
      status: "pending" | "accepted" | "rejected" | "expired";
      createdAt: string;
      respondedAt?: string;
    }[]
  >([]);

  const loadFamilies = useCallback(async () => {
    if (token) {
      try {
        const fetchedFamilies = await FamiliesService.getFamilies(token);
        const children = await ChildrenService.getChildrenByUser(
          user?.userId || "",
          token
        );
        setFamilies(fetchedFamilies);
        setLoading(false);
        setChildren(children);
      } catch (error) {
        console.error("Error fetching families:", error);
      }
    }
  }, [token, user?.userId]);

  const loadInvitations = useCallback(async () => {
    if (!token) return;
    try {
      const invitationsData = await InvitationService.getInvitations(token);
      setInvitations(invitationsData);
    } catch (error) {
      console.error("Error loading invitations:", error);
    }
  }, [token]);

  useEffect(() => {
    if (!user) {
      window.location.href = "/";
      return;
    }
    loadFamilies();
  }, [user, loadFamilies]);

  useEffect(() => {
    if (currentView === "invitations") {
      loadInvitations();
    }
  }, [currentView, loadInvitations]);

  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault();

    const newFamily = await FamiliesService.createFamily(
      (e.target as HTMLFormElement).familyName.value,
      token || ""
    );

    setFamilies((prevFamilies) => [...prevFamilies, newFamily]);
    setToggleNewFamily(false);
  };

  const handleCopyInviteLink = (familyId: string) => {
    const inviteLink = `${WEB_DOMAIN}/invite/${familyId}/${user?.userId}`;
    navigator.clipboard.writeText(inviteLink);
    setCopiedFamilyId(familyId);
    setTimeout(() => setCopiedFamilyId(null), 2000);
  };

  const handleStartEditFamily = (family: Family) => {
    setEditingFamilyId(family._id);
    setEditingFamilyName(family.name);
  };

  const handleCancelEditFamily = () => {
    setEditingFamilyId(null);
    setEditingFamilyName("");
  };

  const handleSaveFamilyName = async (familyId: string) => {
    if (!editingFamilyName.trim()) {
      alert("Family name cannot be empty");
      return;
    }
    try {
      await FamiliesService.updateFamily(
        familyId,
        { name: editingFamilyName.trim() },
        token || ""
      );
      setFamilies((prev) =>
        prev.map((f) =>
          f._id === familyId ? { ...f, name: editingFamilyName.trim() } : f
        )
      );
      setEditingFamilyId(null);
      setEditingFamilyName("");
    } catch (error) {
      console.error("Error updating family name:", error);
      alert("Failed to update family name. Please try again.");
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const updateData: { name?: string; email?: string; password?: string; color?: string } =
        {};

      if (name && name !== user?.name) {
        updateData.name = name;
      }

      if (email && email !== user?.email) {
        updateData.email = email;
      }
      if (password) {
        updateData.password = password;
      }
      if (color && color !== user?.color) {
        updateData.color = color;
      }

      if (Object.keys(updateData).length === 0) {
        alert("No changes to save");
        setIsSaving(false);
        return;
      }

      const updatedUser = await UserService.updateUser(updateData);
      setUser(updatedUser);
      alert("Settings saved successfully!");
      setPassword("");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="text-black py-8 sm:py-2 lg:py-4 min-h-[80vh] max-w-6xl mx-auto flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
      <div className="w-full lg:max-w-[270px]">
        <div className="flex flex-col justify-between items-center mb-4 sm:mb-6 lg:mb-8 bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-center">
            {user?.name}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mb-4">
            {user?.email}
          </p>
          <div className="w-full flex flex-col sm:flex-row lg:flex-col gap-2 overflow-x-auto">
            <Button
              variant={currentView === "settings" ? "contained" : "text"}
              onClick={() => setCurrentView("settings")}
              fullWidth
              size="small"
            >
              Settings
            </Button>
            <Button
              variant={currentView === "family" ? "contained" : "text"}
              onClick={() => setCurrentView("family")}
              fullWidth
              size="small"
            >
              My Family
            </Button>
            <Button
              variant={currentView === "children" ? "contained" : "text"}
              onClick={() => setCurrentView("children")}
              fullWidth
              size="small"
            >
              My Children
            </Button>

            <Button
              variant={currentView === "invitations" ? "contained" : "text"}
              onClick={() => setCurrentView("invitations")}
              fullWidth
              size="small"
            >
              Invitations
            </Button>

            <Button variant="contained" fullWidth size="small" color="error">
              Logout
            </Button>
          </div>
        </div>
      </div>
      <div className="w-full overflow-x-hidden">
        {/* BEGIN SETTINGS VIEW */}
        {currentView === "settings" && (
          <div className="p-4 sm:p-6 bg-white rounded-lg shadow-sm">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Settings</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm  font-bold text-gray-700 mb-1">
                  Name:
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  sx={{
                    backgroundColor: "#0B6CEB1A",
                    borderRadius: "8px",
                    ":before": { borderBottom: "none" },
                    fontWeight: "bold",
                    px: "8px",
                    py: "6px",
                  }}
                  fullWidth
                />
              </div>
              <div>
                <label className="block text-sm  font-bold text-gray-700 mb-1">
                  Email:
                </label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                  sx={{
                    backgroundColor: "#0B6CEB1A",
                    borderRadius: "8px",
                    ":before": { borderBottom: "none" },
                    fontWeight: "bold",
                    px: "8px",
                    py: "6px",
                  }}
                  type="email"
                />
              </div>
              <div>
                <label className="block text-sm  font-bold text-gray-700 mb-1">
                  Theme color:
                </label>
                <Input
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  fullWidth
                  sx={{
                    backgroundColor: "#0B6CEB1A",
                    borderRadius: "8px",
                    ":before": { borderBottom: "none" },
                    fontWeight: "bold",
                    px: "8px",
                    py: "6px",
                  }}
                  type="color"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1 font-bold">
                  Change Password:
                </label>
                <Input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  fullWidth
                  sx={{
                    backgroundColor: "#0B6CEB1A",
                    borderRadius: "8px",
                    ":before": { borderBottom: "none" },
                    fontWeight: "bold",
                    px: "8px",
                    py: "6px",
                  }}
                  type="password"
                  placeholder="Leave blank to keep current password"
                />
              </div>

              <div className="flex flex-row gap-5">
                <Button
                  variant="contained"
                  color="primary"
                  sx={{
                    borderRadius: "8px",
                    fontWeight: "bold",
                    fontSize: "12px",
                  }}
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  sx={{
                    borderRadius: "8px",
                    fontWeight: "bold",
                    fontSize: "12px",
                  }}
                  onClick={() => {
                    const confirmDelete = window.confirm(
                      "Are you sure you want to delete your account? This action cannot be undone."
                    );
                    if (confirmDelete) {
                      UserService.deleteUser(token || "");
                      window.location.href = "/";
                    }
                  }}
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        )}
        {/* END SETTINGS VIEW */}

        {/* BEGIN FAMILY VIEW */}
        {currentView === "family" && (
          <>
            {toggleNewFamily && (
              <div className="mb-6 sm:mb-8 p-4 sm:p-6 border rounded-lg bg-white shadow-sm">
                <h2 className="text-lg sm:text-xl font-bold mb-4">
                  Create New Family
                </h2>
                <form
                  onSubmit={handleCreateFamily}
                  className="flex flex-col gap-4"
                >
                  <Input
                    name="familyName"
                    placeholder="Family Name"
                    required
                    fullWidth
                  />
                  <div className="flex gap-4">
                    <Button variant="contained" color="primary" type="submit">
                      Create
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => setToggleNewFamily(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {families.length === 0 && !loading && !toggleNewFamily && (
              <>
                <div className="text-center mb-6 sm:mb-8 p-4 sm:p-6 bg-white rounded-lg shadow-sm">
                  <h2 className="text-xl sm:text-2xl font-bold mb-4">
                    You are not part of any families yet.
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 mb-4">
                    Create a new family to get started.
                  </p>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setToggleNewFamily(true)}
                    sx={{ fontWeight: "bold", fontSize: "12px" }}
                  >
                    Create New Family
                  </Button>
                </div>
              </>
            )}

            {families.map((family) => (
              <div key={family._id}>
                <div
                  key={family._id}
                  className="mb-4 flex flex-col-reverse sm:flex-row items-start sm:items-center gap-3 sm:gap-5 text-base sm:text-xl justify-between border-b bg-white shadow-sm p-8 lg:p-4 rounded-t-md"
                >
                  <div className="flex gap-3 sm:gap-4 items-center w-full sm:w-auto">
                    {editingFamilyId === family._id ? (
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Input
                          value={editingFamilyName}
                          onChange={(e) => setEditingFamilyName(e.target.value)}
                          size="small"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter")
                              handleSaveFamilyName(family._id);
                            if (e.key === "Escape") handleCancelEditFamily();
                          }}
                          className="text-lg font-semibold"
                        />
                        <button
                          onClick={() => handleSaveFamilyName(family._id)}
                          className="shrink-0 text-green-600 hover:text-green-800 transition-colors bg-green-300/20 border shadow-sm rounded-full p-1 flex items-center justify-center"
                          title="Save"
                        >
                          <IonIcon
                            icon={checkmarkOutline}
                            className="text-2xl"
                          />
                        </button>
                        <button
                          onClick={handleCancelEditFamily}
                          className="shrink-0 text-gray-500 hover:text-red-600 transition-colors bg-red-300/20 border shadow-sm rounded-full p-1 flex items-center justify-center"
                          title="Cancel"
                        >
                          <IonIcon icon={closeOutline} className="text-2xl" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="text-lg md:text-2xl font-bold truncate">
                          {family.name}
                        </p>
                        <button
                          className="shrink-0 text-gray-500 hover:text-blue-600 transition-colors"
                          onClick={() => handleStartEditFamily(family)}
                          title="Edit family name"
                        >
                          <IonIcon
                            icon={settingsOutline}
                            className="text-lg sm:text-xl"
                          />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800"
                          onClick={async () => {
                            const confirmRemove = window.confirm(
                              `Are you sure you want to delete the family "${family.name}"? This action cannot be undone.`
                            );
                            if (confirmRemove && token) {
                              await FamiliesService.deleteFamily(
                                family._id,
                                token
                              );
                              loadFamilies();
                            }
                          }}
                        >
                          <IonIcon icon={trashOutline} className="text-xl" />
                        </button>
                      </>
                    )}
                  </div>
                  <div className="flex gap-3 sm:gap-5 w-full sm:w-auto justify-end">
                    <Tooltip
                      title={
                        copiedFamilyId === family._id
                          ? "Copied!"
                          : "Copy invite link to clipboard"
                      }
                      arrow
                    >
                      <button
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${copiedFamilyId === family._id
                            ? "bg-green-100 text-green-700 border border-green-300"
                            : "text-[#0B6CEB] font-bold "
                          }`}
                        onClick={() => handleCopyInviteLink(family._id)}
                      >
                        {copiedFamilyId === family._id
                          ? "Copied!"
                          : "Copy Invitation Link"}
                        <IonIcon
                          icon={
                            copiedFamilyId === family._id
                              ? checkmarkOutline
                              : linkOutline
                          }
                          className="text-base"
                        />
                      </button>
                    </Tooltip>
                  </div>
                </div>
                <div className="px-4 lg:px-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  {family.members
                    .filter((member) => member._id != user?.userId)
                    .map((member) => {
                      const birthDate = new Date(member.birthDate);
                      const ageDifMs = Date.now() - birthDate.getTime();
                      const ageDate = new Date(ageDifMs);
                      const age = Math.abs(ageDate.getUTCFullYear() - 1970);

                      return (
                        <>
                          <Card className="flex flex-col gap-2 h-full relative bg-white w-full  px-4 py-3">
                            <button
                              className="absolute top-2 right-2 text-red-600 hover:text-red-800 z-10"
                              onClick={async () => {
                                const confirmRemove = window.confirm(
                                  `Are you sure you want to remove ${member.name} from the family?`
                                );
                                if (confirmRemove && token) {
                                  await FamiliesService.removeFamilyMember(
                                    family._id,
                                    member._id,
                                    token
                                  );
                                  loadFamilies();
                                }
                              }}
                            >
                              <IonIcon
                                icon={trashOutline}
                                className="text-xl"
                              />
                            </button>
                            <h2 className="text-base font-bold pr-8">
                              {member.name}
                            </h2>
                            <p className="capitalize text-xs font-semibold text-[#1E1E1E]">
                              {member.role}
                            </p>
                            <span className="inline-block w-full h-px bg-[#1E1E1E10] rounded-full"></span>
                            <div className="flex flex-row items-center gap-5">
                              <div className="flex font-bold flex-col gap-3 text-[#828282] text-xs">
                                <p>Birthdate:</p>
                                <p>Age:</p>
                                <p>Theme Color: </p>
                              </div>
                              <div className="flex flex-col gap-3 text-[#1E1E1E] text-xs font-semibold">
                                <p>{formatDate(member.birthDate)}</p>
                                <p>{age} years</p>
                                <span
                                  style={{ backgroundColor: member.color }}
                                  className="px-2 py-2 rounded-full w-full inline-block"
                                ></span>
                              </div>
                            </div>
                          </Card>
                        </>
                      );
                    })}
                  {family.children.map((child) => (
                    <div key={child._id}>
                      <Card className="flex flex-col gap-2 h-full relative bg-white w-full  px-4 py-3">
                        <button
                          className="absolute top-2 right-10 text-gray-400 hover:text-blue-800 z-10"
                          onClick={() => {
                            invokeEditChildModal({
                              child: {
                                _id: child._id,
                                name: child.name,
                                birthDate: child.birthDate,
                                color: child.color,
                                family: family._id,
                                guardians: child.guardians || [],
                              },
                              familyMembers: family.members.map((m) => ({
                                _id: m._id,
                                name: m.name,
                              })),
                              onChildUpdated: loadFamilies,
                            });
                          }}
                          title="Edit child"
                        >
                          <IonIcon icon={settingsOutline} className="text-xl" />
                        </button>
                        <button
                          className="absolute top-2 right-2 text-red-600 hover:text-red-800 z-10"
                          onClick={async () => {
                            const confirmRemove = window.confirm(
                              `Are you sure you want to remove ${child.name} from the family?`
                            );
                            if (confirmRemove && token) {
                              await FamiliesService.removeChildFromFamily(
                                family._id,
                                child._id,
                                token
                              );
                              loadFamilies();
                            }
                          }}
                        >
                          <IonIcon icon={trashOutline} className="text-xl" />
                        </button>
                        <h2 className="text-base font-bold pr-8">
                          {child.name}
                        </h2>
                        <p className="capitalize text-xs font-semibold text-[#1E1E1E]">
                          Child
                        </p>
                        <span className="inline-block w-full h-px bg-[#1E1E1E10] rounded-full"></span>
                        <div>
                          <div className="flex flex-row items-center gap-5">
                            <div className="flex font-bold flex-col gap-3 text-[#828282] text-xs">
                              <p>Birthdate:</p>
                              <p>Age:</p>
                              <p>Theme Color: </p>
                            </div>
                            <div className="flex flex-col gap-3 text-[#1E1E1E] text-xs font-semibold">
                              <p>{formatDate(child.birthDate)}</p>
                              <p>
                                {(() => {
                                  const birthDate = new Date(child.birthDate);
                                  const ageDifMs =
                                    Date.now() - birthDate.getTime();
                                  const ageDate = new Date(ageDifMs);
                                  return Math.abs(
                                    ageDate.getUTCFullYear() - 1970
                                  );
                                })()}{" "}
                                years
                              </p>
                              <span
                                style={{ backgroundColor: child.color }}
                                className="px-2 py-2 rounded-full w-full inline-block"
                              ></span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {families.length > 0 && !toggleNewFamily && (
              <div className="mb-4 flex flex-col justify-center py-8">
                <div className="mt-2 flex justify-center">
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => setToggleNewFamily(true)}
                    sx={{ fontWeight: "bold", fontSize: "12px" }}
                  >
                    Create New Family
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
        {/* END FAMILY VIEW */}

        {/* BEGIN CHILDREN VIEW */}
        {currentView === "children" && (
          <div className="">
            <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5 text-base sm:text-xl justify-between border-b bg-white shadow-sm p-4 rounded-t-md">
              <div className="flex gap-3 sm:gap-5">
                <p className="text-lg md:text-2xl font-bold">My Children</p>
              </div>
              <div className="flex gap-3 sm:gap-5 w-full sm:w-auto">
                <Button
                  variant="contained"
                  onClick={() => {
                    invokeCreateChildModal({
                      families: families.map((f) => ({
                        name: f.name,
                        _id: f._id,
                        members: f.members,
                      })),
                      onChildCreated: loadFamilies,
                    });
                  }}
                  disabled={families.length === 0}
                  size="small"
                  fullWidth
                  className="sm:w-auto"
                  sx={{ fontWeight: "bold", fontSize: "12px" }}
                >
                  ADD CHILD
                </Button>
              </div>
            </div>
            {children.length === 0 ? (
              <p className="text-gray-600">No children added yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {children.map((child) => (
                  <Card
                    key={child._id}
                    className="flex flex-col gap-2 p-4 sm:p-4 justify-baseline h-full relative bg-white"
                  >
                    <button
                      className="absolute top-2 right-10 text-gray-400 hover:text-blue-800 z-10"
                      onClick={() => {
                        invokeEditChildModal({
                          child: {
                            _id: child._id,
                            name: child.name,
                            birthDate: child.birthDate,
                            color: child.color,
                            family: child.family._id,
                            guardians: child.guardians || [],
                          },
                          familyMembers:
                            families
                              .find((f) => f._id === child.family._id)
                              ?.members.map((m) => ({
                                _id: m._id,
                                name: m.name,
                              })) || [],
                          onChildUpdated: loadFamilies,
                        });
                      }}
                      title="Edit child"
                    >
                      <IonIcon icon={settingsOutline} className="text-xl" />
                    </button>
                    <button
                      className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                      onClick={async () => {
                        const confirmRemove = window.confirm(
                          `Are you sure you want to remove ${child.name}?`
                        );
                        if (confirmRemove && token) {
                          await FamiliesService.removeChildFromFamily(
                            child.family._id,
                            child._id,
                            token
                          );
                          loadFamilies();
                        }
                      }}
                    >
                      <IonIcon icon={trashOutline} className="text-xl" />
                    </button>
                    <h2 className="text-base font-bold pr-8">{child.name}</h2>
                    <p className="capitalize text-xs font-semibold text-[#1E1E1E]">
                      Child
                    </p>
                    <span className="inline-block w-full h-px bg-[#1E1E1E10] rounded-full"></span>
                    <div>
                      <div className="flex flex-row items-center gap-5">
                        <div className="flex font-bold flex-col gap-3 text-[#828282] text-xs">
                          <p>Birthdate:</p>
                          <p>Age:</p>
                          <p>Theme Color: </p>
                        </div>
                        <div className="flex flex-col gap-3 text-[#1E1E1E] text-xs font-semibold">
                          <p>{formatDate(child.birthDate)}</p>
                          <p>
                            {(() => {
                              const birthDate = new Date(child.birthDate);
                              const ageDifMs = Date.now() - birthDate.getTime();
                              const ageDate = new Date(ageDifMs);
                              return Math.abs(ageDate.getUTCFullYear() - 1970);
                            })()}{" "}
                            years
                          </p>

                          <span
                            style={{ backgroundColor: child.color }}
                            className="px-2 py-2 rounded-full w-full inline-block"
                          ></span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
        {/* END CHILDREN VIEW */}

        {/* BEGIN INVITATIONS VIEW */}

        {currentView === "invitations" && (
          <div className="">
            <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5 text-base sm:text-xl justify-between border-b bg-white shadow-sm p-4 rounded-t-md">
              <div className="flex gap-3 sm:gap-5">
                <p className="text-lg md:text-2xl font-bold">My Invitations</p>
              </div>
            </div>
            {invitations.length === 0 ? (
              <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                <p className="text-gray-600">No invitations at the moment.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {invitations.map((invitation) => (
                  <Card
                    key={invitation._id}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 sm:p-6 bg-white"
                  >
                    <div className="flex flex-col gap-2">
                      <h3 className="text-lg font-bold">
                        {invitation.familyId?.name || "Unknown Family"}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Invited by:{" "}
                        <span className="font-semibold">
                          {invitation.invitedByUser?.name || "Unknown User"}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(invitation.createdAt).toLocaleDateString()}
                      </p>
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full inline-block w-fit ${
                          invitation.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : invitation.status === "accepted"
                            ? "bg-green-100 text-green-800"
                            : invitation.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {invitation.status.toUpperCase()}
                      </span>
                    </div>
                    {invitation.status === "pending" && (
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          onClick={async () => {
                            try {
                              await InvitationService.acceptInvitation(
                                invitation._id,
                                token || ""
                              );
                              loadInvitations();
                              loadFamilies();
                            } catch (error) {
                              console.error("Error accepting invitation:", error);
                              alert("Failed to accept invitation. Please try again.");
                            }
                          }}
                          sx={{ fontWeight: "bold", fontSize: "12px" }}
                        >
                          <IonIcon icon={checkmarkOutline} className="mr-1" />
                          Accept
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={async () => {
                            try {
                              await InvitationService.rejectInvitation(
                                invitation._id,
                                token || ""
                              );
                              loadInvitations();
                            } catch (error) {
                              console.error("Error rejecting invitation:", error);
                              alert("Failed to reject invitation. Please try again.");
                            }
                          }}
                          sx={{ fontWeight: "bold", fontSize: "12px" }}
                        >
                          <IonIcon icon={closeOutline} className="mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* END INVITATIONS VIEW */}
      </div>
    </section>
  );
}
