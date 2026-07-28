import { StatusType } from "../context/SocketContext";

export const getStatusColor = (status: StatusType | undefined) => {
    switch (status) {
      case 'Available':
        return '#22c55e'; 
      case 'Away':
        return '#f59e0b'; 
      case 'Busy':
        return '#ef4444';
      default:
        return '#9ca3af'; 
    }
  };