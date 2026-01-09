export type CalendarEvent = {
  start: Date;
  end: Date;
  title: string;
  color: string;
  _id?: string;
  family?: string;
  childId?: string;
  [key: string]: unknown;
};
