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

export default function ComplexTable() {
  const [tableData, setTableData] = useState([]);
  const [sorting, setSorting] = React.useState([]);
  const [apiStatus, setApiStatus] = useState("Connected");
  const [lastUpdate, setLastUpdate] = useState({});
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');

  useEffect(() => {
    const fetchData = async (retryCount = 0) => {
      try {
        const response = await fetch('https://fleetbots-production.up.railway.app/api/fleet/status?session_id=49dd464f-0516-40aa-894c-91455e9eacf9');
        if (!response.ok) throw new Error("API request failed");

        const data = await response.json();
        const currentTime = Date.now();
        const updatedData = {};

        Object.keys(data).forEach((roverID) => {
          // Sensor failure detection: check if coordinates have not changed for more than 10 seconds
          if (
            lastUpdate[roverID] &&
            JSON.stringify(data[roverID].coordinates) === JSON.stringify(lastUpdate[roverID].coordinates)
          ) {
            if (currentTime - (lastUpdate[roverID].time || 0) > 10000) {
              data[roverID].sensorError = "GPS Not Updating";
            }
          }

          // Handle low battery condition (battery < 20%)
          if (data[roverID].battery < 20) {
            data[roverID].batteryWarning = "Low Battery!";
          }

          updatedData[roverID] = data[roverID];
        });

        setTableData(
          Object.keys(updatedData).map((key) => ({
            name: key,
            status: updatedData[key].status,
            task: updatedData[key].task || 'N/A',
            coordinates: updatedData[key].coordinates,
            battery: updatedData[key].battery,
            sensorError: updatedData[key].sensorError,
            batteryWarning: updatedData[key].batteryWarning,
          }))
        );

        setLastUpdate((prev) => ({
          ...prev,
          ...Object.fromEntries(
            Object.keys(updatedData).map((id) => [
              id,
              { coordinates: updatedData[id].coordinates, time: currentTime }
            ])
          ),
        }));

        setApiStatus("Connected");
      } catch (error) {
        if (retryCount < 3) {
          setTimeout(() => fetchData(retryCount + 1), 2000 * (retryCount + 1)); // Retry with exponential backoff
        } else {
          setApiStatus("API Unresponsive");
        }
      }
    };

    fetchData(); // Initial fetch
    const interval = setInterval(fetchData, 5000); // Polling every 5s

    return () => clearInterval(interval); // Cleanup interval
  }, [lastUpdate]);

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
    columnHelper.accessor('coordinates', {
      id: 'coordinates',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          COORDINATES
        </Text>
      ),
      cell: (info) => {
        const coords = info.getValue();
        return (
          <Text color={textColor} fontSize="sm" fontWeight="700">
            {coords ? `${coords[0]}, ${coords[1]}` : 'N/A'}
          </Text>
        );
      },
    }),
    columnHelper.accessor('battery', {
      id: 'battery',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          BATTERY
        </Text>
      ),
      cell: (info) => (
        <Flex align="center">
          <Progress
            variant="table"
            colorScheme="brandScheme"
            h="8px"
            w="108px"
            value={info.getValue()}
            title={`${info.getValue()}%`} // Add hover tooltip with percentage
          />
          <Text ml="2" color={textColor} fontSize="sm" fontWeight="700">
            {info.getValue()}%
          </Text>
          {info.getValue() < 20 && (
            <Text color="red.500" fontSize="sm" fontWeight="700">
              Low Battery! Safe Mode Activated.
            </Text>
          )}
        </Flex>
      ),
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
        <Text color={textColor} fontSize="22px" fontWeight="700" lineHeight="100%">
          Activity Table
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
                      {flexRender(header.column.columnDef.header, header.getContext())}
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
                  <Td key={cell.id} fontSize={{ sm: '14px' }} minW={{ sm: '150px', md: '200px', lg: 'auto' }} borderColor="transparent">
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