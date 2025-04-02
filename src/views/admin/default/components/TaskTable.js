import {
  Box,
  Flex,
  Icon,
  Progress,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import Card from 'components/card/Card';
import { useEffect, useState } from 'react';
import * as React from 'react';
import { MdCancel, MdCheckCircle, MdOutlineError } from 'react-icons/md';

const columnHelper = createColumnHelper();

export default function TaskTable() {
  const [selectedTask, setSelectedTask] = useState('');
  const [tableData, setTableData] = useState([]);
  const [sorting, setSorting] = React.useState([]);
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');

  useEffect(() => {
    fetch(
      'https://fleetbots-production.up.railway.app/api/fleet/status?session_id=49dd464f-0516-40aa-894c-91455e9eacf9',
    )
      .then((res) => res.json())
      .then((data) => {
        // Format the API response data into an array
        const formattedData = Object.keys(data).map((key) => ({
          name: key,
          status: data[key].status,
          task: data[key].task || 'N/A',
          coordinates: data[key].coordinates,
          battery: data[key].battery,
        }));

        setTableData(formattedData);
      })
      .catch((err) => console.error('Error fetching rover data:', err));
  }, []);

  const columns = [
    columnHelper.accessor('name', {
      id: 'name',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          ROVER NAME
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor} fontSize="sm" fontWeight="700">
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor('status', {
      id: 'status',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          STATUS
        </Text>
      ),
      cell: (info) => (
        <Flex align="center">
          <Icon
            w="24px"
            h="24px"
            me="5px"
            color={
              info.getValue() === 'idle'
                ? 'green.500'
                : info.getValue() === 'Moving forward' ||
                  info.getValue() === 'Moving backward' ||
                  info.getValue() === 'Moving left' ||
                  info.getValue() === 'Moving right'
                ? 'red.500'
                : info.getValue() === 'Error'
                ? 'orange.500'
                : null
            }
            as={
              info.getValue() === 'idle'
                ? MdCheckCircle
                : info.getValue() === 'Moving forward' ||
                  info.getValue() === 'Moving backward' ||
                  info.getValue() === 'Moving left' ||
                  info.getValue() === 'Moving right'
                ? MdCancel
                : info.getValue() === 'Error'
                ? MdOutlineError
                : null
            }
          />
          <Text color={textColor} fontSize="sm" fontWeight="700">
            {info.getValue()}
          </Text>
        </Flex>
      ),
    }),
    columnHelper.accessor('task', {
      id: 'task',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          TASK
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor} fontSize="sm" fontWeight="700">
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor('assignTask', {
      id: 'assignTask',
      header: () => (
        <Text fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">
          ASSIGN TASK
        </Text>
      ),
      cell: (info) => {
        const roverName = info.row.original.name;
        return (
          <select
            value={info.row.original.selectedTask || ""}
            onChange={(event) => {
              const newTask = event.target.value;
              setTableData((prevData) =>
                prevData.map((rover) =>
                  rover.name === roverName ? { ...rover, selectedTask: newTask } : rover
                )
              );
            }}
            style={{
              padding: '5px',
              borderRadius: '5px',
              border: `1px solid ${borderColor}`,
              color: textColor,
            }}
          >
            <option value="" disabled>Select Task</option>
            <option value="Soil Analysis">Soil Analysis</option>
            <option value="Crop Monitoring">Crop Monitoring</option>
            <option value="Weeding">Weeding</option>
            <option value="Irrigation">Irrigation</option>
          </select>
        );
      },
    }),
    columnHelper.accessor('action', {
      id: 'action',
      header: () => (
        <Text fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">
          ASSIGN TASK
        </Text>
      ),
      cell: (info) => {
        const roverName = info.row.original.name;
        const selectedTask = info.row.original.selectedTask || "";
    
        const handleAssignTask = async () => {
          if (!selectedTask) {
            alert("Please select a task before assigning.");
            return;
          }
    
          try {
            const response = await fetch(
              `https://fleetbots-production.up.railway.app/api/rover/${roverName}/task?session_id=49dd464f-0516-40aa-894c-91455e9eacf9&task=${selectedTask}`,
              { method: "POST" }
            );
    
            if (response.ok) {
                alert(`Task "${selectedTask}" assigned to ${roverName} successfully!`);
                window.location.reload();
            } else {
              alert(`Failed to assign task to ${roverName}`);
            }
          } catch (error) {
            console.error("Error assigning task:", error);
          }
        };
    
        return (
          <button
            style={{
              padding: '5px 10px',
              borderRadius: '5px',
              backgroundColor: 'blue',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
            }}
            onClick={handleAssignTask}
          >
            Assign
          </button>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: tableData, // Use the fetched and formatted data
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Card
      flexDirection="column"
      w="100%"
      px="0px"
      overflowX={{ sm: 'scroll', lg: 'hidden' }}
    >
      <Flex px="25px" mb="8px" justifyContent="space-between" align="center">
        <Text
          color={textColor}
          fontSize="22px"
          fontWeight="700"
          lineHeight="100%"
        >
          Assigning Table
        </Text>
      </Flex>
      <Box>
        <Table variant="simple" color="gray.500" mb="24px" mt="12px">
          <Thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <Tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <Th
                    key={header.id}
                    colSpan={header.colSpan}
                    pe="10px"
                    borderColor={borderColor}
                    cursor="pointer"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <Flex
                      justifyContent="space-between"
                      align="center"
                      fontSize={{ sm: '10px', lg: '12px' }}
                      color="gray.400"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {{
                        asc: '',
                        desc: '',
                      }[header.column.getIsSorted()] ?? null}
                    </Flex>
                  </Th>
                ))}
              </Tr>
            ))}
          </Thead>
          <Tbody>
            {table.getRowModel().rows.map((row) => (
              <Tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <Td
                    key={cell.id}
                    fontSize={{ sm: '14px' }}
                    minW={{ sm: '150px', md: '200px', lg: 'auto' }}
                    borderColor="transparent"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Td>
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Card>
  );
}
