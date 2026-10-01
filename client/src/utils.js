// Utility helpers
export const getInitials = (name = '') =>
  name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

export const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const formatCurrency = (amount) => {
  if (!amount) return 'Negotiable';
  return `₹${Number(amount).toLocaleString('en-IN')}`;
};

export const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(dateStr);
};

export const getStatusBadge = (status) => {
  const map = {
    open: 'badge-success', in_progress: 'badge-warning', completed: 'badge-info',
    closed: 'badge-danger', pending: 'badge-warning', accepted: 'badge-success',
    rejected: 'badge-danger', withdrawn: 'badge-danger'
  };
  return map[status] || 'badge-info';
};

export const CATEGORIES = [
  'Web Development', 'Graphic Design', 'Video Editing', 'Content Writing',
  'Data Analysis', 'Mobile App Development', 'UI/UX Design', 'Photography',
  'Social Media Marketing', 'Tutoring', 'Music Production', 'SEO', 'Translation',
  'Logo Design', 'Excel & Spreadsheets', 'Other'
];
