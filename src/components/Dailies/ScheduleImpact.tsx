import React, { useEffect, useMemo, useState } from "react";
import { Flex } from "@chakra-ui/react";
import { useScheduleImpact } from "./useScheduleImpact";
import {
  useReactTable,
  ColumnDef,
  flexRender,
  RowData,
  getCoreRowModel,
  createColumnHelper,
} from "@tanstack/react-table";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Box,
  Textarea,
  Input,
  Icon,
} from "@chakra-ui/react";
import { ActivityRevisionEntity } from "@/types/activities";
import { FaCheck } from "react-icons/fa";
import { VscChromeClose } from "react-icons/vsc";

declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData> {
    updateData: (rowIndex: number, columnId: string, value: unknown) => void;
  }
}

const defaultColumn: Partial<ColumnDef<ActivityRevisionEntity>> = {
  cell: ({ getValue, row: { index }, column: { id }, table }) => {
    const initialValue = getValue();
    // We need to keep and update the state of the cell normally
    const [value, setValue] = useState(initialValue);

    // When the input is blurred, we'll call our table meta's updateData function
    const onBlur = () => {
      table.options.meta?.updateData(index, id, value);
    };

    // If the initialValue is changed external, sync it up with our state
    useEffect(() => {
      setValue(initialValue);
    }, [initialValue]);

    return (
      <Textarea
        fontSize={"sm"}
        rows={10}
        cols={100}
        value={value as string}
        onChange={(e) => setValue(e.target.value)}
        onBlur={onBlur}
      />
    );
  },
};

function numberCell({ getValue, row: { index }, column: { id }, table }: any) {
  const initialValue = getValue();
  // We need to keep and update the state of the cell normally
  const [value, setValue] = useState(initialValue);

  // When the input is blurred, we'll call our table meta's updateData function
  const onBlur = () => {
    table.options.meta?.updateData(index, id, value);
  };

  // If the initialValue is changed external, sync it up with our state
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return (
    <Input
      fontSize={"sm"}
      value={value as number}
      type="number"
      onChange={(e) => setValue(e.target.value)}
      onBlur={onBlur}
      max={100}
      min={0}
    />
  );
}

const columnHelper = createColumnHelper<ActivityRevisionEntity>();

function ScheduleImpact({ impactDate }: { impactDate: string }) {
  const { scheduleRevision, updateActivity, rejectActivityRevision } =
    useScheduleImpact(impactDate);

  // useEffect(() => {
  //   console.log("impactDate", impactDate);
  // }, [impactDate]);

  const [data, _setData] = React.useState<ActivityRevisionEntity[]>([]);
  const rerender = React.useReducer(() => ({}), {})[1];

  function approve(info: any) {
    const initialValue = info.getValue();
    const [value, setValue] = useState(initialValue);

    useEffect(() => {
      setValue(initialValue);
    }, [initialValue]);

    function approveRevision() {
      const revision = {
        id: info.row.original.activity_revision[0].id,
        revision: {
          ...info.row.original.activity_revision[0].revision,

          impact_on_start_date:
            info.row.original.impact_start ??
            info.row.original.activity_revision[0].revision
              .impact_on_start_date,
          impact_on_end_date:
            info.row.original.impact_end ??
            info.row.original.activity_revision[0].revision.impact_on_end_date,
        },
      };
      //console.log(revision);
      updateActivity(revision);
    }

    function rejectRevision() {
      rejectActivityRevision(info.row.original.activity_revision[0].id);
    }

    return (
      <Flex gap="2">
        <Icon
          size="xs"
          color={
            info.row.original.activity_revision[0].status === "approved"
              ? "green.500"
              : "gray"
          }
          cursor="pointer"
          as={FaCheck}
          onClick={() => approveRevision()}
        />
        <Icon
          size="xs"
          color={
            info.row.original.activity_revision[0].status === "rejected"
              ? "red.500"
              : "gray"
          }
          cursor="pointer"
          as={VscChromeClose}
          onClick={() => rejectRevision()}
        />
      </Flex>
    );
  }

  useEffect(() => {
    if (scheduleRevision) {
      _setData(scheduleRevision.data);
    }
  }, [scheduleRevision]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        id: "name",
        cell: (info) => <i>{info.getValue()}</i>,
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor(
        (row) => row.activity_revision[0].activity_history.history.message,
        {
          id: "activity_revision",
          cell: (info) => <i>{info.getValue()}</i>,
          header: () => <span>Message</span>,
          footer: (info) => info.column.id,
        }
      ),
      columnHelper.accessor(
        (row) => row.activity_revision[0].activity_history.history.impact,
        {
          id: "impact",
          header: () => <span>Impact</span>,
          cell: (info) => <i>{info.getValue()}</i>,
          footer: (info) => info.column.id,
        }
      ),
      columnHelper.accessor(
        (row) => row.activity_revision[0].revision.impact_on_start_date,
        {
          id: "impact_start",
          header: () => <span>Impact on start date</span>,
          cell: numberCell,
          footer: (info) => info.column.id,
        }
      ),
      columnHelper.accessor(
        (row) => row.activity_revision[0].revision.impact_on_end_date,
        {
          id: "impact_end",
          header: () => <span>Impact on end date</span>,
          cell: numberCell,
          footer: (info) => info.column.id,
        }
      ),
      columnHelper.accessor((row) => row.activity_revision[0].id, {
        id: "approve",
        header: () => <span>Approve</span>,
        cell: approve,
        footer: (info) => info.column.id,
      }),
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    defaultColumn,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      updateData: (rowIndex, columnId, value) => {
        _setData((old) =>
          old.map((row, index) => {
            if (index === rowIndex) {
              return {
                ...old[rowIndex]!,
                [columnId]: value,
              };
            }
            return row;
          })
        );
      },
    },
    debugTable: true,
  });

  return (
    <Box width="100%" fontSize={"sm"}>
      {data && table && (
        <Table variant="simple">
          <Thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <Tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <Th key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </Th>
                ))}
              </Tr>
            ))}
          </Thead>
          <Tbody>
            {table.getRowModel().rows.map((row) => (
              <Tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <Td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Td>
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </Box>
  );
}

export default ScheduleImpact;
