/**
 * Timer Service - Internal time-based triggers
 * No OAuth required, always available
 */

export interface TimerTriggerConfig {
  type: 'date' | 'time' | 'future_date';
  // For 'date' type: DD/MM format (e.g., "25/12" for December 25th)
  datePattern?: string;
  // For 'time' type: HH:MM format (e.g., "09:30")
  timePattern?: string;
  // For 'future_date' type: number of days ahead (e.g., 3 for "in 3 days")
  daysAhead?: number;
  // User-friendly description
  description?: string;
}

/**
 * Check if a date trigger matches the current date
 * @param datePattern DD/MM format (e.g., "25/12")
 * @returns true if current date matches the pattern
 */
export function checkDateTrigger(datePattern: string): boolean {
  const now = new Date();
  const currentDay = String(now.getDate()).padStart(2, '0');
  const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
  const currentDate = `${currentDay}/${currentMonth}`;
  
  return currentDate === datePattern;
}

/**
 * Check if a time trigger matches the current time
 * @param timePattern HH:MM format (e.g., "09:30")
 * @returns true if current time matches the pattern (within the same minute)
 */
export function checkTimeTrigger(timePattern: string): boolean {
  const now = new Date();
  const currentHour = String(now.getHours()).padStart(2, '0');
  const currentMinute = String(now.getMinutes()).padStart(2, '0');
  const currentTime = `${currentHour}:${currentMinute}`;
  
  return currentTime === timePattern;
}

/**
 * Get the date and day name for X days in the future
 * @param daysAhead Number of days ahead (e.g., 3)
 * @returns Object with date in DD/MM format and day name (e.g., "Friday")
 */
export function getFutureDate(daysAhead: number): { date: string; dayName: string; fullDescription: string } {
  const now = new Date();
  const futureDate = new Date(now);
  futureDate.setDate(now.getDate() + daysAhead);
  
  const day = String(futureDate.getDate()).padStart(2, '0');
  const month = String(futureDate.getMonth() + 1).padStart(2, '0');
  const date = `${day}/${month}`;
  
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayNamesFr = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const dayName = dayNamesFr[futureDate.getDay()];
  
  const fullDescription = `Dans ${daysAhead} jour${daysAhead > 1 ? 's' : ''}, ce sera ${dayName}`;
  
  return { date, dayName, fullDescription };
}

/**
 * Check if a future date trigger should fire today
 * This checks if today matches the calculated future date from when the trigger was created
 * @param createdAt When the trigger was created
 * @param daysAhead Number of days ahead configured
 * @returns true if today is the target future date
 */
export function checkFutureDateTrigger(createdAt: Date, daysAhead: number): boolean {
  const targetDate = new Date(createdAt);
  targetDate.setDate(targetDate.getDate() + daysAhead);
  
  const now = new Date();
  
  // Check if dates match (ignore time)
  return targetDate.getDate() === now.getDate() &&
         targetDate.getMonth() === now.getMonth() &&
         targetDate.getFullYear() === now.getFullYear();
}

/**
 * Validate a timer trigger configuration
 * @param config Timer trigger configuration
 * @returns true if valid, throws error if invalid
 */
export function validateTimerConfig(config: TimerTriggerConfig): boolean {
  if (!config.type) {
    throw new Error('Timer trigger type is required');
  }
  
  switch (config.type) {
    case 'date':
      if (!config.datePattern) {
        throw new Error('datePattern is required for date triggers');
      }
      // Validate DD/MM format
      const dateRegex = /^([0-2][0-9]|3[0-1])\/(0[1-9]|1[0-2])$/;
      if (!dateRegex.test(config.datePattern)) {
        throw new Error('datePattern must be in DD/MM format (e.g., "25/12")');
      }
      break;
      
    case 'time':
      if (!config.timePattern) {
        throw new Error('timePattern is required for time triggers');
      }
      // Validate HH:MM format
      const timeRegex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;
      if (!timeRegex.test(config.timePattern)) {
        throw new Error('timePattern must be in HH:MM format (e.g., "09:30")');
      }
      break;
      
    case 'future_date':
      if (config.daysAhead === undefined || config.daysAhead === null) {
        throw new Error('daysAhead is required for future_date triggers');
      }
      if (config.daysAhead < 1 || config.daysAhead > 365) {
        throw new Error('daysAhead must be between 1 and 365');
      }
      break;
      
    default:
      throw new Error(`Unknown timer trigger type: ${config.type}`);
  }
  
  return true;
}

/**
 * Get a human-readable description of a timer trigger
 * @param config Timer trigger configuration
 * @returns Human-readable description
 */
export function getTimerDescription(config: TimerTriggerConfig): string {
  switch (config.type) {
    case 'date':
      return `Chaque ${config.datePattern}`;
    case 'time':
      return `Tous les jours à ${config.timePattern}`;
    case 'future_date':
      const future = getFutureDate(config.daysAhead!);
      return future.fullDescription;
    default:
      return 'Timer trigger';
  }
}
