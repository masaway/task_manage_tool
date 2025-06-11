export const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDuration = (hours: number): string => {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  return `${wholeHours}時間${minutes > 0 ? ` ${minutes}分` : ''}`;
}; 