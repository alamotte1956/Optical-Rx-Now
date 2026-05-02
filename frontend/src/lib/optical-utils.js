import { addDays, differenceInCalendarDays, format, isValid, parseISO } from "date-fns";

export const SHOP_LINKS = [
  {
    id: "zenni-optical",
    label: "Zenni Optical",
    description: "Budget-friendly glasses and sunglasses.",
    href: "https://www.zennioptical.com/",
  },
  {
    id: "warby-parker",
    label: "Warby Parker",
    description: "Eyeglasses and try-at-home frames.",
    href: "https://www.warbyparker.com/",
  },
  {
    id: "contacts-direct",
    label: "ContactsDirect",
    description: "Contact lens ordering and refill options.",
    href: "https://www.contactsdirect.com/",
  },
  {
    id: "1800-contacts",
    label: "1-800 Contacts",
    description: "Popular contact lens destination.",
    href: "https://www.1800contacts.com/",
  },
];

export const CONTACT_CADENCE_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "biweekly", label: "Biweekly" },
  { value: "monthly", label: "Monthly" },
  { value: "custom", label: "Custom" },
];

export const EXPIRATION_REMINDER_OPTIONS = [7, 14, 30, 60];

export const getExpirationStatus = (expirationDate) => {
  if (!expirationDate) {
    return { tone: "missing", label: "Missing", detail: "Add a current prescription" };
  }

  const today = new Date();
  const parsedDate = parseISO(expirationDate);
  const daysLeft = differenceInCalendarDays(parsedDate, today);

  if (daysLeft < 0) {
    return { tone: "expired", label: "Expired", detail: `${Math.abs(daysLeft)} day${Math.abs(daysLeft) === 1 ? "" : "s"} ago` };
  }

  if (daysLeft <= 30) {
    return { tone: "warning", label: "Expiring soon", detail: `${daysLeft} day${daysLeft === 1 ? "" : "s"} left` };
  }

  return { tone: "active", label: "Active", detail: `${daysLeft} day${daysLeft === 1 ? "" : "s"} left` };
};

export const formatDateLabel = (value, fallback = "Not set") => {
  if (!value) {
    return fallback;
  }

  const parsedDate = parseISO(value);
  return isValid(parsedDate) ? format(parsedDate, "MMM d, yyyy") : fallback;
};

export const getCadenceDays = (reminder) => {
  if (!reminder?.enabled) {
    return null;
  }

  if (reminder.cadence === "daily") return 1;
  if (reminder.cadence === "biweekly") return 14;
  if (reminder.cadence === "monthly") return 30;
  if (reminder.cadence === "custom") return Number(reminder.customDays) || null;
  return null;
};

export const getNextReminderDate = (reminder) => {
  const interval = getCadenceDays(reminder);
  if (!interval || !reminder?.startDate) {
    return null;
  }

  return addDays(parseISO(reminder.startDate), interval).toISOString();
};

export const getReminderSummary = (reminder) => {
  if (!reminder?.enabled) {
    return "Off";
  }

  if (reminder.cadence === "custom" && reminder.customDays) {
    return `Every ${reminder.customDays} days`;
  }

  const match = CONTACT_CADENCE_OPTIONS.find((option) => option.value === reminder.cadence);
  return match?.label || "Set";
};

export const getReminderStatus = (reminder) => {
  if (!reminder?.enabled) {
    return { label: "Reminder off", tone: "muted", detail: "Set a person-level lens cadence" };
  }

  const nextDate = getNextReminderDate(reminder);
  if (!nextDate) {
    return { label: "Needs a start date", tone: "warning", detail: "Choose the replacement start date" };
  }

  const daysLeft = differenceInCalendarDays(parseISO(nextDate), new Date());

  if (daysLeft < 0) {
    return { label: "Due now", tone: "expired", detail: `${Math.abs(daysLeft)} day${Math.abs(daysLeft) === 1 ? "" : "s"} overdue` };
  }

  if (daysLeft <= 2) {
    return { label: "Due soon", tone: "warning", detail: `${daysLeft} day${daysLeft === 1 ? "" : "s"} left` };
  }

  return { label: "Scheduled", tone: "active", detail: `Next: ${formatDateLabel(nextDate)}` };
};
