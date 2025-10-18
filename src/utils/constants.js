export const STAT_CARDS_CONFIG = [
  {
    key: 'todaysVisits',
    title: "Today's Visits",
    color: "blue",
    icon: "TodayVisits"
  },
  {
    key: 'medicationGiven',
    title: "Medication Given",
    color: "green", 
    icon: "Medication"
  },
  {
    key: 'lowStockAlerts',
    title: "Low Stock Alerts",
    color: "red",
    icon: "Alert"
  },
  {
    key: 'studentsCleared',
    title: "Students Cleared",
    color: "yellow",
    icon: "Students"
  }
];

export const ALERT_TYPES = {
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
  info: "bg-blue-50 border-blue-200 text-blue-800", 
  urgent: "bg-red-50 border-red-200 text-red-800"
};

export const OUTCOME_STYLES = {
  'Cleared': 'bg-green-100 text-green-800',
  'Sent Home': 'bg-red-100 text-red-800',
  'Medicated': 'bg-blue-100 text-blue-800',
  'Treated': 'bg-purple-100 text-purple-800'
};