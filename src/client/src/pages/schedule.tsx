import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import React, { useCallback, useState } from "react";
import { useModal } from "../contexts/modal.context";
import { useScheduleData } from "../hooks/useScheduleData";
import { FamilyScheduleList } from "../components/organisms/FamilyScheduleList";
import {
  populateEventFamily,
  transformToCalendarEvents,
  getFamilyById,
  type UnpopulatedEvent,
} from "../utils/event.utils";

export default function SchedulePage() {
  const { families, familiesMap, children, eventsByChild, loading, refetch } =
    useScheduleData();
  const { invokeCreateEventModal, invokeEventDetailsModal } = useModal();

  const [disabledChildren, setDisabledChildren] = useState<Set<string>>(
    new Set()
  );

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
    }));
    invokeCreateEventModal({
      families,
      children: transformedChildren,
      onEventCreated: refetch,
    });
  }, [families, children, invokeCreateEventModal, refetch]);

  const handleSelectEvent = useCallback(
    (event: unknown) => {
      if (!families) return;
      const eventWithFamily = populateEventFamily(
        event as UnpopulatedEvent,
        familiesMap
      );
      invokeEventDetailsModal(eventWithFamily, { onEventDeleted: refetch });
    },
    [families, familiesMap, invokeEventDetailsModal, refetch]
  );

  const filteredEvents = React.useMemo(
    () => transformToCalendarEvents(eventsByChild, children, disabledChildren),
    [eventsByChild, children, disabledChildren]
  );

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
    <section className="p-4 px-20 container mx-auto flex gap-8 w-full">
      <div className="flex-1" style={{ minHeight: 500 }}>
        <FullCalendar
          plugins={[
            dayGridPlugin,
            timeGridPlugin,
            interactionPlugin,
            listPlugin,
          ]}
          initialView="dayGridMonth"
          locale="en"
          buttonText={{
            today: "Today",
            month: "Month",
            week: "Week",
            day: "Day",
            list: "Agenda",
          }}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
          }}
          views={{
            listWeek: {
              titleFormat: { year: "numeric", month: "long" },
            },
            listDay: {
              titleFormat: { year: "numeric", month: "long", day: "numeric" },
            },
          }}
          dayHeaderContent={(args) => {
            const { view } = args;
            const date = args.date;
            /// TODO: separate logic in if statements
            const options: Intl.DateTimeFormatOptions = {
              weekday: "short",
              month: "short",
              day: "numeric",
            };
            const eventCount = filteredEvents.filter((event) => {
              const eventStart = new Date(event.start);
              return (
                eventStart.getFullYear() === date.getFullYear() &&
                eventStart.getMonth() === date.getMonth() &&
                eventStart.getDate() === date.getDate()
              );
            }).length;

            const formattedDate = date.toLocaleDateString("en-US", options);
            const options2: Intl.DateTimeFormatOptions = {
              weekday: "long",
            };
            const formattedDate2 = date.toLocaleDateString("en-US", options2);
            return (
              <div className="flex justify-between items-center">
                {view.type === "dayGridMonth" && (
                  <span className="fc-daygrid-day-number">
                    {formattedDate2}
                  </span>
                )}

                {(view.type === "listWeek" || view.type === "listDay") && (
                  <>
                    <span className="fc-list-day-text">{formattedDate}</span>
                    <span className="fc-list-day-side-text">
                      {eventCount} event{eventCount !== 1 ? "s" : ""}
                    </span>
                  </>
                )}
              </div>
            );
          }}
          eventContent={(arg) => {
            console.log("Rendering event:", arg);
            const { event, view } = arg;

            return (
              <div>
                {view.type === "timeGridWeek" ||
                view.type === "timeGridDay" ||
                view.type === "dayGridMonth" ? (
                  <div>
                    {event.start?.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                  </div>
                ) : null}
                <b>{event.title}</b>
                {view.type === "listWeek" || view.type === "listDay" ? (
                  <>
                    <div>
                      {event.extendedProps.family
                        ? `Family: ${
                            getFamilyById(
                              familiesMap,
                              event.extendedProps.family
                            )?.name ?? event.extendedProps.family
                          }`
                        : "No family"}
                    </div>
                  </>
                ) : null}
              </div>
            );
          }}
          events={filteredEvents.map((event) => ({
            title: event.title,
            start: event.start,
            end: event.end,
            backgroundColor: event.color || "#3174ad",
            borderColor: event.color || "#3174ad",
            extendedProps: event,
          }))}
          eventDisplay="block"
          eventClick={(info) => {
            console.log("Event clicked:", info);
            handleSelectEvent(info.event.extendedProps);
          }}
          height="auto"
          dateClick={(info) => {
            invokeCreateEventModal({
              families,
              children: children.map((child) => ({
                name: child.name,
                _id: child._id,
                family: { _id: child.family },
              })),
              start: info.date,
              end: info.date,
              onEventCreated: refetch,
            });
          }}
          select={(info) => {
            invokeCreateEventModal({
              families,
              children: children.map((child) => ({
                name: child.name,
                _id: child._id,
                family: { _id: child.family },
              })),
              start: info.start,
              end: info.end,
              onEventCreated: refetch,
            });
          }}
          selectable={true}
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
