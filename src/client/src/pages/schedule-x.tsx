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

import { useModal } from "../contexts/modal.context";
import { useScheduleData } from "../hooks/useScheduleData";
import { FamilyScheduleList } from "../components/organisms/FamilyScheduleList";
import { ScheduleXEventModal } from "../components/organisms/ScheduleXEventModal";
import { transformToCalendarEvents } from "../utils/event.utils";

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
  events: ReturnType<typeof transformToCalendarEvents>,
  childToCalendarId: Record<string, string> = {}
): ScheduleXEvent[] {
  console.log("Transforming events for ScheduleX:", events);
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

  console.log("Generated calendars config:", calendars);
  return { calendars, childToCalendarId };
}

export default function ScheduleXPage() {
  const { families, familiesMap, children, eventsByChild, loading, refetch } =
    useScheduleData();
  const { invokeCreateEventModal } = useModal();

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

  const toggleChildCalendar = useCallback((childId: string) => {
    setDisabledChildren((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(childId)) {
        newSet.delete(childId);
      } else {
        newSet.add(childId);
      }
      return newSet;
    });
  }, []);

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
    console.log(
      "Opening create event modal with children:",
      transformedChildren
    );
    invokeCreateEventModal({
      families,
      children: transformedChildren,
      onEventCreated: refetch,
    });
  }, [families, children, invokeCreateEventModal, refetch]);

  const filteredEvents = useMemo(
    () => transformToCalendarEvents(eventsByChild, children, disabledChildren),
    [eventsByChild, children, disabledChildren]
  );

  const { calendars, childToCalendarId } = useMemo(
    () => generateCalendarsConfigWithColorMap(filteredEvents),
    [filteredEvents]
  );

  const scheduleXEvents = useMemo(
    () => toScheduleXFormat(filteredEvents, childToCalendarId),
    [filteredEvents, childToCalendarId]
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
    (date: any) => {
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
      });
    },
    [invokeCreateEventModal, refetch]
  );

  const onClickDate = useCallback(
    (date: any) => {
      const fams = familiesRef.current;
      const kids = childrenRef.current;
      console.log("Date clicked:", date);
      console.log("Opening create event modal for clicked date.");
      console.log("Families available:", fams);
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
      });
    },
    [invokeCreateEventModal, refetch]
  );

  const calendar = useCalendarApp({
    views: [
      createViewDay(),
      createViewWeek(),
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
    // calendars: calendars,
    // calendars: {
    //   personal: {
    //     colorName: "personal",
    //     lightColors: {
    //       main: "#f9d71c",
    //       container: "#fff5aa",
    //       onContainer: "#594800",
    //     },
    //     darkColors: {
    //       main: "#fff5c0",
    //       onContainer: "#fff5de",
    //       container: "#a29742",
    //     },
    //   },
    //   work: {
    //     colorName: "work",
    //     lightColors: {
    //       main: "#f91c45",
    //       container: "#ffd2dc",
    //       onContainer: "#59000d",
    //     },
    //     darkColors: {
    //       main: "#ffc0cc",
    //       onContainer: "#ffdee6",
    //       container: "#a24258",
    //     },
    //   },
    //   leisure: {
    //     colorName: "leisure",
    //     lightColors: {
    //       main: "#1cf9b0",
    //       container: "#dafff0",
    //       onContainer: "#004d3d",
    //     },
    //     darkColors: {
    //       main: "#c0fff5",
    //       onContainer: "#e6fff5",
    //       container: "#42a297",
    //     },
    //   },
    //   school: {
    //     colorName: "school",
    //     lightColors: {
    //       main: "#1c7df9",
    //       container: "#d2e7ff",
    //       onContainer: "#002859",
    //     },
    //     darkColors: {
    //       main: "#c0dfff",
    //       onContainer: "#dee6ff",
    //       container: "#426aa2",
    //     },
    //   },
    // },
    // events: [
    //   // ... other events
    //   {
    //     title: "Meeting with Mr. boss",
    //     start: Temporal.ZonedDateTime.from(
    //       "2026-01-05T05:15:00+01:00[Europe/Berlin]"
    //     ),
    //     end: Temporal.ZonedDateTime.from(
    //       "2026-01-05T06:00:00+01:00[Europe/Berlin]"
    //     ),
    //     id: "98d85d98541f",
    //     calendarId: "work",
    //   },
    //   {
    //     title: "Sipping Aperol Spritz on the beach",
    //     start: Temporal.ZonedDateTime.from(
    //       "2026-01-05T12:00:00+01:00[Europe/Berlin]"
    //     ),
    //     end: Temporal.ZonedDateTime.from(
    //       "2026-01-05T15:20:00+01:00[Europe/Berlin]"
    //     ),
    //     id: "0d13aae3b8a1",
    //     calendarId: "leisure",
    //   },
    // ],

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
    },
  });

  useEffect(() => {
    if (calendar && eventsServicePlugin) {
      eventsServicePlugin.set(scheduleXEvents);
      calendarControls.setCalendars(calendars);
    }
  }, [scheduleXEvents, calendar, eventsServicePlugin]);

  if (loading) {
    return (
      <section className="p-4 px-20 container mx-auto">
        <p>Loading families...</p>
      </section>
    );
  }

  if (!families || families.length === 0) {
    return (
      <section className="p-4 px-20 container mx-auto">
        <p>No families found. Please create a family to manage schedules.</p>
      </section>
    );
  }

  return (
    <section className="p-4 lg:px-20 container mx-auto flex flex-wrap flex-col-reverse md:flex-row gap-8 w-full">
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
      <div>
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
    </section>
  );
}
