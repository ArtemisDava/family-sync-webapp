export interface CreateEventDto {
  title: string;

  description?: string;

  startDate: string;

  endDate?: string;

  family: string;

  child?: string;
  
  adult?: string;

  // @IsEnum(['shared', 'private'])
  visibility?: string;

  sharedWith?: string[];

  isRecurring?: boolean;

  recurrencePattern?: string; // "daily", "weekly", "monthly"

  recurrenceEndDate?: string;

  //   @IsEnum(['appointment', 'school', 'activity', 'birthday', 'other'])
  category?: string;

  location?: string;

  reminders?: number[];

  color?: string;

  isAllDay?: boolean;
}
