// Function to convert date to time text
export function convertDateToTimeText(date: string) {
  const eventDate = new Date(date);
  const now = new Date();
  const timeDiff = (now as any) - (eventDate as any); // Difference in milliseconds

  const hours = timeDiff / 1000 / 60 / 60;
  const days = hours / 24;
  const weeks = days / 7;
  const months = days / 30;
  const years = days / 365;

  if (hours < 24) {
    return `${Math.floor(hours)} hrs ago`;
  } else if (days < 7) {
    return `${Math.floor(days)} days ago`;
  } else if (weeks < 4) {
    return `${Math.floor(weeks)} wks ago`;
  } else if (months < 12) {
    return `${Math.floor(months)} months ago`;
  } else {
    return years <= 1 ? "1 year ago" : ">1 yr ago";
  }
}
