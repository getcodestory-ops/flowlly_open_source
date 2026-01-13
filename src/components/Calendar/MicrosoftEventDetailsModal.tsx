import React, { useState, useMemo } from "react";
import { Video, Info, Settings } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MicrosoftCalendarEvent } from "@/types/calendar";
import { parseGraphDateTime } from "./calendar-utils";
import { MicrosoftEventDistributionSetup } from "./MicrosoftEventDistributionSetup";

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
  const [activeTab, setActiveTab] = useState("details");

  // Extract attendee emails for distribution setup
  const attendeeEmails = useMemo(() => {
    if (!event?.attendees) return [];
    return event.attendees
      .filter((a): a is typeof a & { emailAddress: { address: string } } => 
        !!a.emailAddress?.address
      )
      .map(a => a.emailAddress.address);
  }, [event?.attendees]);

  return (
    <Dialog open={!!event} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-4 border-b flex-shrink-0">
          <DialogTitle>{event?.subject || "Event Details"}</DialogTitle>
        </DialogHeader>

        {event && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden min-h-0">
            <TabsList className="mx-4 mt-2 w-fit flex-shrink-0">
              <TabsTrigger value="details" className="gap-1.5">
                <Info className="h-3.5 w-3.5" />
                Details
              </TabsTrigger>
              <TabsTrigger value="setup" className="gap-1.5">
                <Settings className="h-3.5 w-3.5" />
                Distribution Setup
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="flex-1 overflow-y-auto p-6 m-0">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> You cannot modify this event directly. Please use your Microsoft Calendar to make changes.
                </p>
              </div>

              <div className="space-y-4">
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
            </TabsContent>

            <TabsContent value="setup" className="flex-1 overflow-hidden m-0 min-h-0 flex flex-col">
              <MicrosoftEventDistributionSetup
                meetingName={event.subject}
                initialEmails={attendeeEmails}
              />
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};
