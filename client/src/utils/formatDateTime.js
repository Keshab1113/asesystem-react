export function formatDateTime(utcDateString, short = false){
  if (!utcDateString) return "-";
 return new Date(utcDateString + "Z").toLocaleString(undefined, {

    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    // timeZoneName: "shortGeneric"
    ...(short ? {} : { timeZoneName: "shortGeneric" }),

  });
}
