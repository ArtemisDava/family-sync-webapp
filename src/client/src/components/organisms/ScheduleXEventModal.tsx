import { useState } from "react";
import { EventsService } from "../../services/events.service";
import { useUser } from "../../contexts/user.context";
import type { CalendarEvent } from "../../models/calendar-event";

interface ScheduleXCalendarEvent {
  id: string;
  title: string;
  start: unknown;
  end: unknown;
  calendarId?: string;
  originalEvent?: CalendarEvent & {
    _id?: string;
    location?: string;
    createdBy?: {
      _id: string;
      name: string;
      email: string;
    };
    notes?: string | string[];
    family?: string | { _id: string; name: string };
    familyName?: string;
  };
}

interface ScheduleXEventModalProps {
  calendarEvent: ScheduleXCalendarEvent;
  onEventDeleted?: () => void;
  onClose?: () => void;
  familiesMap?: Map<string, { _id: string; name: string }>;
}

function formatDateTime(date: unknown): string {
  if (!date) return "N/A";

  if (
    typeof date === "object" &&
    date !== null &&
    "epochMilliseconds" in date
  ) {
    return new Date(
      (date as { epochMilliseconds: number }).epochMilliseconds,
    ).toLocaleString();
  }

  if (date instanceof Date) {
    return date.toLocaleString();
  }

  if (typeof date === "string") {
    return new Date(date).toLocaleString();
  }

  return "N/A";
}

export function ScheduleXEventModal({
  calendarEvent,
  onEventDeleted,
  onClose,
  familiesMap,
}: ScheduleXEventModalProps) {
  const { token } = useUser();
  const [isDeleting, setIsDeleting] = useState(false);

  const originalEvent = calendarEvent.originalEvent;
  const eventColor = originalEvent?.color || "#3174ad";

  const getFamilyName = (): string => {
    if (!originalEvent) return "N/A";

    const family = originalEvent.family;
    if (typeof family === "object" && family !== null && "name" in family) {
      return (family as { name: string }).name;
    }

    if (originalEvent.familyName) {
      return originalEvent.familyName;
    }

    if (typeof family === "string" && familiesMap) {
      const familyObj = familiesMap.get(family);
      return familyObj?.name || "N/A";
    }

    return "N/A";
  };

  const handleDelete = async () => {
    const eventId = originalEvent?._id || calendarEvent.id;

    if (!eventId || eventId.startsWith("event-")) {
      alert("This event cannot be deleted.");
      return;
    }

    if (!confirm("Are you sure you want to delete this event?")) {
      return;
    }

    try {
      setIsDeleting(true);
      await EventsService.deleteEvent(eventId, token ?? undefined);
      onEventDeleted?.();
      onClose?.();
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Error deleting the event. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatNotes = (notes: string | string[] | undefined): string => {
    if (!notes) return "N/A";
    if (Array.isArray(notes)) {
      return notes.length > 0 ? notes.join(", ") : "N/A";
    }
    return notes || "N/A";
  };

  return (
    <div
      className="bg-white rounded-lg shadow-lg p-4 min-w-[280px]"
      style={{ borderTop: `4px solid ${eventColor}` }}
    >
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900">
          {calendarEvent.title}
        </h3>
      </div>

{originalEvent?.createdBy && (
            <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900">
          {originalEvent.createdBy.name}
        </h3>
      </div>
)}

      <div className="space-y-3 text-sm">
        <div>
          <span className="font-semibold text-gray-700">📅 Date & Time:</span>
          <p className="text-gray-600 ml-5">
            {formatDateTime(originalEvent?.start || calendarEvent.start)}
          </p>
          {originalEvent?.end || calendarEvent.end ? (
            <p className="text-gray-600 ml-5">
              to {formatDateTime(originalEvent?.end || calendarEvent.end)}
            </p>
          ) : null}
        </div>

        <div>
          <span className="font-semibold text-gray-700">📍 Location:</span>
          <p className="text-gray-600 ml-5">
            {originalEvent?.location || "N/A"}
          </p>
        </div>

        <div>
          <span className="font-semibold text-gray-700">👨‍👩‍👧 Family:</span>
          <p className="text-gray-600 ml-5">{getFamilyName()}</p>
        </div>

        {originalEvent?.notes && (
          <div>
            <span className="font-semibold text-gray-700">📝 Notes:</span>
            <p className="text-gray-600 ml-5">
              {formatNotes(originalEvent?.notes)}
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-200 flex justify-end gap-2">
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  );
}
