import "temporal-polyfill/global";
import { useCallback, useState, useEffect, useMemo, useRef } from "react";
import { useCalendarApp, ScheduleXCalendar } from "@schedule-x/react";
import {
  createViewDay,
  createViewWeek,
  createViewMonthGrid,
  createViewMonthAgenda,
  createViewList,
} from "@schedule-x/calendar";
import { createEventsServicePlugin } from "@schedule-x/events-service";
import { createEventModalPlugin } from "@schedule-x/event-modal";
import { createDragAndDropPlugin } from "@schedule-x/drag-and-drop";
import "@schedule-x/theme-default/dist/index.css";
import "./schedule-x.css";
import { createCalendarControlsPlugin } from "@schedule-x/calendar-controls";
import { createCurrentTimePlugin } from "@schedule-x/current-time";
import Skeleton from "@mui/material/Skeleton";

import { useModal } from "../contexts/modal.context";
import { useScheduleData } from "../hooks/useScheduleData";
import { FamilyScheduleList } from "../components/organisms/FamilyScheduleList";
import { ScheduleXEventModal } from "../components/organisms/ScheduleXEventModal";
import { transformToCalendarEvents } from "../utils/event.utils";
import { EventsService } from "../services/events.service";
import { useUser } from "../contexts/user.context";

function SchedulePageSkeleton() {
  const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  const weeks = Array(5).fill(null);

  return (
    <section className="px-4 lg:px-0 container flex flex-wrap flex-col-reverse md:flex-row gap-8 mx-auto max-w-6xl">
      <div className="flex-1" style={{ minHeight: 500 }}>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Skeleton variant="rounded" width={70} height={36} />
              <Skeleton variant="circular" width={32} height={32} />
              <Skeleton variant="circular" width={32} height={32} />
              <Skeleton variant="text" width={150} height={32} />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton variant="rounded" width={100} height={36} />
              <Skeleton variant="rounded" width={140} height={36} />
            </div>
          </div>

          <div className="grid grid-cols-7 border-b pb-2 mb-2">
            {days.map((day) => (
              <div key={day} className="text-center">
                <Skeleton
                  variant="text"
                  width={30}
                  height={20}
                  className="mx-auto"
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-px bg-gray-200">
            {weeks.map((_, weekIndex) =>
              days.map((_, dayIndex) => (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className="bg-white min-h-20 p-2"
                >
                  <Skeleton variant="text" width={20} height={20} />
                  {Math.random() > 0.7 && (
                    <Skeleton
                      variant="rounded"
                      width="100%"
                      height={24}
                      className="mt-1"
                      sx={{ bgcolor: "rgba(59, 130, 246, 0.2)" }}
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="min-w-[170px]">
        <div className="md:fixed">
          <Skeleton
            variant="rounded"
            width={140}
            height={40}
            className="mb-4"
            sx={{ bgcolor: "rgba(59, 130, 246, 0.3)" }}
          />

          <Skeleton variant="text" width={140} height={28} className="mb-3" />

          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="mb-3 p-3 bg-white rounded-lg shadow-sm border"
            >
              <Skeleton
                variant="text"
                width={100}
                height={24}
                className="mb-2"
              />
              {i === 1 && (
                <div className="flex items-center gap-2 ml-2">
                  <Skeleton variant="circular" width={12} height={12} />
                  <Skeleton variant="text" width={70} height={20} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

interface ScheduleXEvent {
  id: string;
  title: string;
  start: Temporal.ZonedDateTime;
  end: Temporal.ZonedDateTime;
  calendarId?: string;
  originalEvent?: ReturnType<typeof transformToCalendarEvents>[number];
  [key: string]: unknown;
}

function toScheduleXFormat(
  events: ReturnType<typeof transformToCalendarEvents>
): ScheduleXEvent[] {
  return events.map((event, index) => {
    const calendarId = event.childId;

    return {
      id: event._id || `event-${index}`,
      title: event.title,
      start: formatDateForScheduleX(event.start),
      end: formatDateForScheduleX(event.end),
      calendarId,
      originalEvent: event,
      color: event.color || "#3174ad",
    };
  });
}

function formatDateForScheduleX(date: Date): Temporal.ZonedDateTime {
  return Temporal.ZonedDateTime.from({
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    hour: date.getHours(),
    minute: date.getMinutes(),
    second: date.getSeconds(),
    timeZone: Temporal.Now.timeZoneId(),
  });
}

function generateCalendarsConfigWithColorMap(
  events: ReturnType<typeof transformToCalendarEvents>
): {
  calendars: Record<
    string,
    {
      colorName: string;
      lightColors: { main: string; container: string; onContainer: string };
      darkColors: { main: string; container: string; onContainer: string };
    }
  >;
  childToCalendarId: Record<string, string>;
} {
  const childToCalendarId: Record<string, string> = {};
  const calendars: Record<
    string,
    {
      colorName: string;
      lightColors: { main: string; container: string; onContainer: string };
      darkColors: { main: string; container: string; onContainer: string };
    }
  > = {
    default: {
      colorName: "default",
      lightColors: {
        main: "#3174ad",
        container: "#d4e5f7",
        onContainer: "#1a4971",
      },
      darkColors: {
        main: "#5a9fd4",
        onContainer: "#d4e5f7",
        container: "#2a5a8a",
      },
    },
  };

  const uniqueChildIds = [
    ...new Set(events.map((e) => e.childId).filter(Boolean)),
  ] as string[];

  uniqueChildIds.forEach((childId) => {
    const calendarId = childId;
    childToCalendarId[childId] = calendarId;

    const childEvent = events.find((e) => e.childId === childId);
    const color = childEvent?.color || "#3174ad";

    calendars[childId] = {
      colorName: childId,
      lightColors: {
        main: color,
        container: `${color}33`,
        onContainer: "#000000",
      },
      darkColors: {
        main: color,
        onContainer: "#ffffff",
        container: `${color}99`,
      },
    };
  });

  return { calendars, childToCalendarId };
}

export default function ScheduleXPage() {
  const { families, familiesMap, children, eventsByChild, loading, refetch } =
    useScheduleData();
  const { invokeCreateEventModal } = useModal();
  const { token, user } = useUser();

  const [disabledChildren, setDisabledChildren] = useState<Set<string>>(
    new Set()
  );

  const familiesRef = useRef<typeof families>(families);
  const childrenRef = useRef<typeof children>(children);
  useEffect(() => {
    familiesRef.current = families;
  }, [families]);
  useEffect(() => {
    childrenRef.current = children;
  }, [children]);

  const toggleChildCalendar = useCallback(
    (childId: string, familyId?: string) => {
      setDisabledChildren((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(childId + "-" + (familyId || ""))) {
          newSet.delete(childId + "-" + (familyId || ""));
        } else {
          newSet.add(childId + "-" + (familyId || ""));
        }
        return newSet;
      });
    },
    []
  );

  const handleCreateEvent = useCallback(() => {
    if (!families || families.length === 0) {
      console.warn("No families available to create an event.");
      return;
    }
    const transformedChildren = children.map((child) => ({
      name: child.name,
      _id: child._id,
      family: { _id: child.family },
      color: child.color,
    }));
    invokeCreateEventModal({
      families,
      children: transformedChildren,
      onEventCreated: refetch,
      user,
    });
  }, [families, children, invokeCreateEventModal, refetch, user]);

  const membersColorsMap = useMemo(() => {
    if (!families) return new Map<string, string>();
    const map = new Map<string, string>();
    families.forEach((family) => {
      family.members.forEach((member) => {
        map.set(member._id, member.color || "");
      });
    });
    return map;
  }, [families]);

  const filteredEvents = useMemo(
    () =>
      transformToCalendarEvents(
        eventsByChild,
        children,
        disabledChildren,
        user,
        membersColorsMap
      ),
    [eventsByChild, children, disabledChildren, user, membersColorsMap]
  );

  const { calendars, childToCalendarId } = useMemo(
    () => generateCalendarsConfigWithColorMap(filteredEvents),
    [filteredEvents]
  );

  const scheduleXEvents = useMemo(
    () => toScheduleXFormat(filteredEvents),
    [filteredEvents]
  );

  const eventsServicePlugin = useMemo(() => createEventsServicePlugin(), []);

  const eventModalPlugin = useMemo(() => createEventModalPlugin(), []);

  const calendarControls = useMemo(() => createCalendarControlsPlugin(), []);

  const dragAndDropPlugin = useMemo(() => createDragAndDropPlugin(), []);
  const currentTimePlugin = useMemo(
    () => createCurrentTimePlugin({ fullWeekWidth: true }),
    []
  );

  const onDoubleClickDate = useCallback(
    (date: { year: number; month: number; day: number }) => {
      const fams = familiesRef.current;
      const kids = childrenRef.current;
      if (!fams || fams.length === 0) return;
      const dateObj = new Date(date.year, date.month - 1, date.day);
      invokeCreateEventModal({
        families: fams,
        children: kids.map((child) => ({
          name: child.name,
          _id: child._id,
          family: { _id: child.family },
          color: child.color,
        })),
        start: dateObj,
        end: dateObj,
        onEventCreated: refetch,
        user,
      });
    },
    [invokeCreateEventModal, refetch, user]
  );

  const onClickDate = useCallback(
    (date: { year: number; month: number; day: number }) => {
      const fams = familiesRef.current;
      const kids = childrenRef.current;
      if (!fams || fams.length === 0) return;
      const dateObj = new Date(date.year, date.month - 1, date.day);
      invokeCreateEventModal({
        families: fams,
        children: kids.map((child) => ({
          name: child.name,
          _id: child._id,
          family: { _id: child.family },
          color: child.color,
        })),
        start: dateObj,
        end: dateObj,
        onEventCreated: refetch,
        user,
      });
    },
    [invokeCreateEventModal, refetch, user]
  );

  const onEventUpdate = useCallback(
    async (updatedEvent: ScheduleXEvent) => {
      try {
        const eventId = updatedEvent.id;

        const startDate = new Date(
          updatedEvent.start.year,
          updatedEvent.start.month - 1,
          updatedEvent.start.day,
          updatedEvent.start.hour,
          updatedEvent.start.minute,
          updatedEvent.start.second
        ).toISOString();

        const endDate = new Date(
          updatedEvent.end.year,
          updatedEvent.end.month - 1,
          updatedEvent.end.day,
          updatedEvent.end.hour,
          updatedEvent.end.minute,
          updatedEvent.end.second
        ).toISOString();

        await EventsService.updateEvent(
          eventId,
          {
            startDate,
            endDate,
          },
          token
        );
      } catch (error) {
        console.error("Error updating event:", error);
        refetch();
      }
    },
    [token, refetch]
  );

  const calendar = useCalendarApp({
    views: [
      // createViewDay(),
      // createViewWeek(),
      createViewMonthGrid(),
      createViewMonthAgenda(),
      createViewList(),
    ],
    defaultView: "month-grid",
    events: scheduleXEvents,
    translations: {
      enUS: {
        List: "Agenda",
      },
    },
    plugins: [
      eventsServicePlugin,
      eventModalPlugin,
      dragAndDropPlugin,
      calendarControls,
      currentTimePlugin,
    ],
    callbacks: {
      onDoubleClickDate,
      onClickDate,
      onEventUpdate,
    },
  });

  useEffect(() => {
    if (calendar && eventsServicePlugin) {
      eventsServicePlugin.set(scheduleXEvents);
      calendarControls.setCalendars(calendars);
    }
  }, [
    scheduleXEvents,
    calendar,
    eventsServicePlugin,
    calendars,
    calendarControls,
  ]);

  if (loading) {
    return <SchedulePageSkeleton />;
  }

  if (!families || families.length === 0) {
    return (
      <section className="max-w-6xl mx-auto text-center">
        <p>No families found. Please create a family to manage schedules.</p>
      </section>
    );
  }

  return (
    <section className="px-4 lg:px-0 py-8 sm:py-2 lg:py-4  container lg:mx-auto flex flex-wrap flex-col-reverse md:flex-row gap-8 max-w-6xl">
      <div
        className="flex-1 sx-react-calendar-wrapper"
        style={{ minHeight: 500 }}
      >
        <ScheduleXCalendar
          calendarApp={calendar}
          customComponents={{
            eventModal: ({ calendarEvent }) => (
              <ScheduleXEventModal
                calendarEvent={calendarEvent}
                onEventDeleted={refetch}
                onClose={() => eventModalPlugin.close()}
                familiesMap={familiesMap}
              />
            ),
          }}
        />
      </div>
      <div className="min-w-[170px]">
        <div className="md:fixed">
          <button
            className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
            onClick={handleCreateEvent}
          >
            Create Event
          </button>

          <FamilyScheduleList
            families={families}
            disabledChildren={disabledChildren}
            onToggleChild={toggleChildCalendar}
          />
        </div>
      </div>
    </section>
  );
}
