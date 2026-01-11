import { useEffect, useState } from "react";
import BaseModal from "../atoms/base-modal";
import { FormControl, InputLabel } from "@mui/material";
import Button from "@mui/material/Button";
import { useUser } from "../../contexts/user.context";
import { EventsService } from "../../services/events.service";
import { CategorySelect } from "../atoms/CategorySelect";
import { CustomSelect, type Option } from "../atoms/CustomSelect";
import type LoginInformation from "../../models/loginInformation";
import { BootstrapInput } from "./editChildModal";

interface CreateEventModalProps {
  open: {
    start?: Date;
    end?: Date;
    families: { name: string; _id: string }[];
    children: {
      name: string;
      _id: string;
      family: { _id: string };
      color?: string;
    }[];
    onEventCreated?: () => void;
    user: LoginInformation | null;
  } | null;
  onClose: () => void;
}
function toDatetimeLocal(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-` +
    `${pad(d.getMonth() + 1)}-` +
    `${pad(d.getDate())}T` +
    `${pad(d.getHours())}:` +
    `${pad(d.getMinutes())}`
  );
};

export default function CreateEventModal({
  open,
  onClose,
}: CreateEventModalProps) {
  const { token } = useUser();
  const [title, setTitle] = useState("");
  const [familyId, setFamilyId] = useState("");
  const [assignedId, setAssignedId] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    if (!open) return;

    if (open.start instanceof Date) {
      setStartDate(toDatetimeLocal(open.start));
    }
    if (open.end instanceof Date) {
      setEndDate(toDatetimeLocal(open.end));
    }
  }, [open]);

  if (!open) return null;

  const { families, children, user } = open;

  return (
    <BaseModal open={!!open} onClose={onClose} title="Create Event">
      <form
        className="text-sm w-full flex gap-4 flex-col"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            const formData = new FormData(e.currentTarget);
            const assignedId = formData.get("assigned")?.toString() || "";
            const isAnAdultEvent = user && assignedId === user.userId;

            const information: {
              childId: string | undefined;
              adultId: string | undefined;
              eventData: {
                title: string;
                startDate: string;
                endDate: string;
                category: string;
                location: string;
                family: string;
              };
              token: string;
            } = {
              adultId: isAnAdultEvent ? user.userId : undefined,
              childId: isAnAdultEvent ? undefined : assignedId,
              eventData: {
                title: formData.get("title")?.toString() || "",
                startDate: startDate ? new Date(startDate).toISOString() : "",
                endDate: endDate ? new Date(endDate).toISOString() : "",
                category: formData.get("category")?.toString() || "",
                location: formData.get("location")?.toString() || "",
                family: familyId,
              },
              token: token || "",
            };

            if (!information.childId && !information.adultId) {
              throw new Error("No valid target selected for the event.");
            }
            if (!isAnAdultEvent && information.childId) {
              await EventsService.addNewEventToChild(
                information.childId,
                information.eventData,
                information.token,
              );
            } else if (isAnAdultEvent && information.adultId) {
              await EventsService.addNewEventToAdult(
                familyId,
                information.eventData,
                information.token,
              );
            }

            if (open.onEventCreated) {
              await Promise.resolve(open.onEventCreated());
            }
            onClose();
          } catch (error) {
            console.error("Error creating event:", error);
            alert("Error creating event. Please try again.");
          }
        }}
      >
        <FormControl variant="standard" required>
          <InputLabel shrink className="text-xl font-bold" htmlFor="title">
            Title
          </InputLabel>
          <BootstrapInput
            type="text"
            value={title}
            name="title"
            id="title"
            required
            onChange={(e) => setTitle(e.target.value)}
          />
        </FormControl>
        <div>
          Family: *
          <CustomSelect
            name="family"
            value={familyId}
            onChange={(value) => {
              setFamilyId(value);
              setAssignedId("");
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
        <div>
          Target: *
          <CustomSelect
            name="assigned"
            value={assignedId}
            onChange={setAssignedId}
            required
            placeholder="Select a child"
            options={[
              ...children
                .filter((child) => child.family._id === familyId)
                .map<Option>((child) => ({
                  value: child._id,
                  label: child.name,
                  color: child.color,
                })),
              user
                ? {
                  value: user.userId,
                  label: "Myself",
                  color: user.color,
                }
                : null,
            ].filter((o): o is Option => o !== null)}
          />
        </div>
        <div>
          Category: *
          <CategorySelect
            name="category"
            value={category}
            onChange={setCategory}
            required
          />
        </div>
        <FormControl variant="standard" required>
          <InputLabel shrink className="text-xl font-bold" htmlFor="location">
            Location
          </InputLabel>
          <BootstrapInput
            type="text"
            value={location}
            name="location"
            id="location"
            required
            onChange={(e) => setLocation(e.target.value)}
          />
        </FormControl>

        <FormControl variant="standard">
          <InputLabel shrink className="text-xl font-bold" htmlFor="startDate">
            Start Date *
          </InputLabel>
          <BootstrapInput
            type="datetime-local"
            value={startDate}
            name="startDate"
            id="startDate"
            required
            onChange={(e) => setStartDate(e.target.value)}
          />
        </FormControl>

        <FormControl variant="standard">
          <InputLabel shrink className="text-xl font-bold" htmlFor="endDate">
            End Date *
          </InputLabel>
          <BootstrapInput
            type="datetime-local"
            value={endDate}
            name="endDate"
            id="endDate"
            required
            onChange={(e) => setEndDate(e.target.value)}
          />
        </FormControl>

        <Button type="submit">Create Event</Button>
      </form>
    </BaseModal>
  );
}
