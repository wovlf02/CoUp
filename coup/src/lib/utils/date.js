import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

export const formatDate = (dateString, formatStr = 'yyyy년 MM월 dd일') => {
  if (!dateString) return '';
  const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
  return format(date, formatStr, { locale: ko });
};

export const formatDateTime = (dateString, formatStr = 'yyyy년 MM월 dd일 HH:mm') => {
  if (!dateString) return '';
  const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
  return format(date, formatStr, { locale: ko });
};

export const isSameDay = (date1, date2) => {
  if (!date1 || !date2) return false;
  const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  return format(d1, 'yyyyMMdd') === format(d2, 'yyyyMMdd');
};

// Add more date utility functions as needed
