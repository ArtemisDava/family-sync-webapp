export interface Event {
  _id: string;
  title: string;
  startDate: string;
  endDate: string;
  family: Family;
  child: string;
  createdBy: string;
  visibility: string;
  sharedWith: any[];
  isRecurring: boolean;
  category: string;
  location: string;
  reminders: any[];
  isAllDay: boolean;
  notes: any[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  start: string;
  end: string;
}

export interface Family {
  _id: string;
  name: string;
  members: Member[];
  children: Children[];
  createdBy: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Member {
  _id: string;
  email: string;
  name: string;
  families: string[];
  role: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Children {
  _id: string;
  name: string;
  birthDate: string;
  color: string;
  family: string;
  guardians: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}
