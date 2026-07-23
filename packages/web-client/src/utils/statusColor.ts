import { StatusType } from "../context/SocketContext";

export const getStatusColor = (status: StatusType | undefined) => {
    switch (status) {
      case 'Available':
        return '#22c55e'; // Green
      case 'Away':
        return '#f59e0b'; // Amber
      case 'Busy':
        return '#ef4444'; // Red
      default:
        return '#9ca3af'; // Gray
    }
  };