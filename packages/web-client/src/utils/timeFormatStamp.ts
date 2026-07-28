export const formatTimestamp = (timestamp?: string) => {
  if (!timestamp) return "";

  const date = new Date(timestamp);
  const now = new Date();

  // Today
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  // Yesterday
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  // before yesterday
  return date.toLocaleDateString([], {
    month: "numeric",
    day: "numeric",
    year: "2-digit",
  });
};