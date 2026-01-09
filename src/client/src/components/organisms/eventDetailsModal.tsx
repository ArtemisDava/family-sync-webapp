import React, { useState } from "react";
import BaseModal from "../atoms/base-modal";
import { type Event } from "../../models/event";
import { EventsService } from "../../services/events.service";
import { useUser } from "../../contexts/user.context";

interface EventDetailsModalProps {
  event: Event;
  onClose: () => void;
  onEventDeleted?: () => void;
}

export default function EventDetailsModal({
  event,
  onClose,
  onEventDeleted,
}: EventDetailsModalProps) {
  const { token } = useUser();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this event?")) {
      return;
    }

    try {
      setIsDeleting(true);
      await EventsService.deleteEvent(event._id, token ?? undefined);
      onEventDeleted?.();
      onClose();
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Error deleting the event. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <BaseModal open={!!event} onClose={onClose} title="Event Details">
      <div className="text-xs max-w-sm mx-auto flex gap-4 flex-col ">
        <div>
          <h3 className="font-semibold">Event Name</h3>
          <p>{event.title}</p>
        </div>
        <div>
          <h3 className="font-semibold">Date & Time</h3>
          <p>{new Date(event.start).toLocaleString()}</p>
          {event.end && (
            <>
              <h3 className="font-semibold mt-2">To</h3>
              <p>{new Date(event.end).toLocaleString()}</p>
            </>
          )}
        </div>
        <div>
          <h3 className="font-semibold">Location</h3>
          <p>{event.location || "N/A"}</p>
        </div>
        <div>
          <h3 className="font-semibold">Family</h3>
          <p>{event.family.name || "N/A"}</p>
        </div>
        <div>
          <h3 className="font-semibold">Notes</h3>
          <p>{event.notes || "N/A"}</p>
        </div>
      </div>
      <div className="border-t mt-4 pt-4 mx-auto">
        <div className="mt-4 flex justify-between  w-xs">
          <button className="ml-2 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
            Edit
          </button>
          <button className="ml-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="ml-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
