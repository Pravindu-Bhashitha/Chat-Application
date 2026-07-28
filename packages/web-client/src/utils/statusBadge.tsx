export const getStatusBadge = (currentStatus: string|undefined) => {
    switch (currentStatus) {
      case 'Available':
        return <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill ms-2" style={{ fontSize: '0.6rem' }}>Available</span>;
      case 'Away':
        return <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle rounded-pill ms-2" style={{ fontSize: '0.6rem' }}>Away</span>;
      case 'Busy':
        return <span className="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill ms-2" style={{ fontSize: '0.6rem' }}>Busy</span>;
      default:
        return null; 
    }
  };