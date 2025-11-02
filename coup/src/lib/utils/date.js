// C:/Project/CoUp/coup/src/lib/utils/date.js

import { format, parseISO, isValid, formatDistanceToNowStrict } from 'date-fns';
import { ko } from 'date-fns/locale';

/**
 * Formats a date string or Date object into a readable format.
 * @param {string | Date} dateInput - The date string or Date object to format.
 * @param {string} formatStr - The format string (e.g., 'yyyy년 MM월 dd일').
 * @returns {string} The formatted date string.
 */
export const formatDate = (dateInput, formatStr = 'yyyy년 MM월 dd일') => {
  if (!dateInput) return '';
  const date = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
  if (!isValid(date)) return '';
  return format(date, formatStr, { locale: ko });
};

/**
 * Formats a date to show how long ago it was.
 * @param {string | Date} dateInput - The date string or Date object to format.
 * @returns {string} The relative time string (e.g., '5분 전', '1시간 전').
 */
export const formatRelativeTime = (dateInput) => {
  if (!dateInput) return '';
  const date = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
  if (!isValid(date)) return '';
  return formatDistanceToNowStrict(date, { addSuffix: true, locale: ko });
};

/**
 * Checks if a given date is today.
 * @param {string | Date} dateInput - The date string or Date object to check.
 * @returns {boolean} True if the date is today, false otherwise.
 */
export const isToday = (dateInput) => {
  if (!dateInput) return false;
  const date = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
  if (!isValid(date)) return false;
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
};

/**
 * Converts a Date object or ISO string to an ISO date string (YYYY-MM-DD).
 * @param {string | Date} dateInput - The date string or Date object to convert.
 * @returns {string} The ISO date string (e.g., '2025-11-03').
 */
export const toISODateString = (dateInput) => {
  if (!dateInput) return '';
  const date = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
  if (!isValid(date)) return '';
  return format(date, 'yyyy-MM-dd');
};

/**
 * Converts a Date object or ISO string to an ISO time string (HH:mm).
 * @param {string | Date} dateInput - The date string or Date object to convert.
 * @returns {string} The ISO time string (e.g., '14:30').
 */
export const toISOTimeString = (dateInput) => {
  if (!dateInput) return '';
  const date = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
  if (!isValid(date)) return '';
  return format(date, 'HH:mm');
};