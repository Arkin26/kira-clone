import { format, formatDistanceToNow } from "date-fns";

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/** Relative for recent rows; calendar date for older. */
export function formatIntentTimestamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const age = Date.now() - d.getTime();
  if (age >= 0 && age < ONE_WEEK_MS) {
    return formatDistanceToNow(d, { addSuffix: true });
  }
  return format(d, "MMM d, yyyy");
}
