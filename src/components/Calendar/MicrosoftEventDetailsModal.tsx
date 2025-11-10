import React from "react";
import { X, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MicrosoftCalendarEvent } from "@/types/calendar";
import { parseGraphDateTime } from "./calendar-utils";

interface MicrosoftEventDetailsModalProps {
  event: MicrosoftCalendarEvent | null;
  onClose: () => void;
}

const formatAttendeeStatus = (status: string): string => {
  // Convert camelCase to Title Case with spaces
  const formatted = status
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
  return formatted;
};

const getStatusColor = (status: string): string => {
  const lowerStatus = status.toLowerCase();
  if (lowerStatus === "accepted") return "bg-green-100 text-green-800";
  if (lowerStatus === "declined") return "bg-red-100 text-red-800";
  if (lowerStatus === "tentative" || lowerStatus.includes("tentative")) return "bg-yellow-100 text-yellow-800";
  if (lowerStatus === "notresponded" || lowerStatus.includes("notresponded")) return "bg-gray-100 text-gray-800";
  return "bg-gray-100 text-gray-800";
};

export const MicrosoftEventDetailsModal: React.FC<MicrosoftEventDetailsModalProps> = ({
  event,
  onClose,
}) => {
  if (!event) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Microsoft Calendar Event</h2>
          <Button
            className="h-8 w-8 p-0"
            onClick={onClose}
            size="icon"
            variant="ghost"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> You cannot modify this event directly. Please use your Microsoft Calendar to make changes.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Subject</h3>
              <p className="text-base font-semibold">{event.subject}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Start Time</h3>
                <p className="text-base">
                  {parseGraphDateTime(event.start.dateTime, event.start.timeZone).toLocaleString()}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">End Time</h3>
                <p className="text-base">
                  {parseGraphDateTime(event.end.dateTime, event.end.timeZone).toLocaleString()}
                </p>
              </div>
            </div>

            {event.location?.displayName && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Location</h3>
                <p className="text-base">{event.location.displayName}</p>
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Event Type</h3>
              <div className="flex items-center gap-2">
                {event.isOnlineMeeting && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                    <Video className="h-3 w-3" />
                    Online Meeting
                  </span>
                )}
                <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm">
                  {event.type === "singleInstance" && "Single Event"}
                  {event.type === "occurrence" && "Recurring Event"}
                  {event.type === "exception" && "Exception"}
                  {event.type === "seriesMaster" && "Series Master"}
                </span>
              </div>
            </div>

            {event.organizer?.emailAddress && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Organizer</h3>
                <p className="text-base">
                  {event.organizer.emailAddress.name || event.organizer.emailAddress.address}
                </p>
                {event.organizer.emailAddress.name && (
                  <p className="text-sm text-gray-600">{event.organizer.emailAddress.address}</p>
                )}
              </div>
            )}

            {event.attendees && event.attendees.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Attendees ({event.attendees.length})</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {event.attendees.map((attendee, index) => (
                    <div key={index} className="flex items-start justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <p className="text-sm font-medium">
                          {attendee.emailAddress?.name || attendee.emailAddress?.address}
                        </p>
                        {attendee.emailAddress?.name && (
                          <p className="text-xs text-gray-600">{attendee.emailAddress?.address}</p>
                        )}
                      </div>
                      {attendee.status?.response && (
                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(attendee.status.response)}`}>
                          {formatAttendeeStatus(attendee.status.response)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {event.body?.content && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
                <div 
                  className="text-sm text-gray-700 p-3 bg-gray-50 rounded max-h-60 overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: event.body.content }}
                />
              </div>
            )}

            {event.lastModifiedDateTime && (
              <div className="pt-4 border-t">
                <p className="text-xs text-gray-500">
                  Last modified: {new Date(event.lastModifiedDateTime).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

