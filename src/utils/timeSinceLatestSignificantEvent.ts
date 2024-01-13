// Function to extract and sort significant events
export function extractAndSortSignificantEvents(activity: any) {
  let significantEvents = activity.history.filter(
    (e: any) => e.severity === "severe"
  );

  if (significantEvents.length === 0) {
    significantEvents = activity.history.filter(
      (e: any) => e.severity === "moderate"
    );
  }

  if (significantEvents.length === 0) {
    significantEvents = activity.history.filter(
      (e: any) => e.severity === "low"
    );
  }

  significantEvents.sort(
    (a: any, b: any) =>
      (new Date(b.created_at) as any) - (new Date(a.created_at) as any)
  );

  return significantEvents;
}
