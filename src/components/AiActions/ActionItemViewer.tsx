import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

import { CheckIcon } from "@radix-ui/react-icons";

interface ActionItemInterface {
  results: Array<{
    activity_addition: Array<{
      name: string;
      end_date: string;
      start_date: string;
      description: string;
    }>;
    activity_deletion: Array<{ name: string }>;
    activity_modification: Array<{
      name: string;
      reason: string;
      impact_on_start_date: number;
      impact_on_end_date: number;
    }>;
  }>;
}

function ActionItemViewer({ results }: ActionItemInterface) {
  const { activity_addition, activity_deletion, activity_modification } =
    results[0];

  return (
    <div className="font-normal">
      {activity_addition.length && (
        <div className="mt-8">
          <h2 className="text-center m-2 text-xl">
            New activities to be added in schedule{" "}
          </h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Approve</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activity_addition.map((activity, index) => (
                <TableRow key={`addition-${index}`}>
                  <TableCell>{activity.name}</TableCell>
                  <TableCell>{activity.description}</TableCell>
                  <TableCell>{activity.start_date}</TableCell>
                  <TableCell>{activity.end_date}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="icon">
                      <CheckIcon className="h-w w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {activity_deletion.length > 0 && (
        <div className="mt-8">
          <h2 className="text-center m-2 text-xl">Activity Additions</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Approve</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activity_deletion.map((activity, index) => (
                <TableRow key={`deletion-${index}`}>
                  <TableCell>{activity.name}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="icon">
                      <CheckIcon className="h-w w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {activity_modification.length && (
        <div className="mt-16">
          <h2 className="text-center m-2 text-xl">
            {" "}
            Existing activities to be changed
          </h2>
          <Table>
            {/* <TableCaption>Activity Modifications</TableCaption> */}
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Impact on Start Date</TableHead>
                <TableHead>Impact on End Date</TableHead>
                <TableHead>Approve</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activity_modification.map((activity, index) => (
                <TableRow key={`modification-${index}`}>
                  <TableCell>{activity.name}</TableCell>
                  <TableCell>{activity.reason}</TableCell>
                  <TableCell>{activity.impact_on_start_date}</TableCell>
                  <TableCell>{activity.impact_on_end_date}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="icon">
                      <CheckIcon className="h-w w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

export default ActionItemViewer;
