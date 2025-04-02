import {
  Avatar,
  Box,
  Flex,
  FormLabel,
  Icon,
  Select,
  SimpleGrid,
  useColorModeValue,
} from '@chakra-ui/react';
import MiniStatistics from 'components/card/MiniStatistics';
import IconBox from 'components/icons/IconBox';
import React from 'react';
import { MdAttachMoney, MdBarChart } from 'react-icons/md';

import ComplexTable from 'views/admin/default/components/ComplexTable';
import TaskTable from 'views/admin/default/components/TaskTable';
import Chart from 'views/admin/default/components/Chart'
import { useEffect, useState } from 'react';
import { columnsDataComplex } from 'views/admin/default/variables/columnsData';
import tableDataComplex from 'views/admin/default/variables/tableDataComplex.json';

// const statisticsData = [
//   {
//     name: 'Total Active Rovers',
//     value: '5', // Replace with dynamic data if available
//     icon: MdBarChart,
//   },
//   {
//     name: 'Total Idle Rovers',
//     value: '12',
//     icon: MdBarChart,
//   },
//   {
//     name: 'Total Active Rovers',
//     value: '9',
//     icon: MdBarChart,
//   },
//   {
//     name: "Pending Missions",
//     value: "3",
//     icon: MdBarChart,
//   },
// ];

export default function UserReports() {
  const [tableData, setTableData] = useState([]);
  const [statistics, setStatistics] = useState({
    totalRovers: 0,
    activeRovers: 0,
    idleRovers: 0,
  });

  useEffect(() => {
    fetch(
      'https://fleetbots-production.up.railway.app/api/fleet/status?session_id=49dd464f-0516-40aa-894c-91455e9eacf9',
    )
      .then((res) => res.json())
      .then((data) => {
        const formattedData = Object.keys(data).map((key) => ({
          name: key,
          status: data[key].status,
          task: data[key].task || 'N/A',
          coordinates: `${data[key].coordinates[0]}, ${data[key].coordinates[1]}`,
          battery: `${data[key].battery}%`,
        }));

        setTableData(formattedData);

        // Update statistics
        const totalRovers = Object.keys(data).length;
        const activeRovers = Object.values(data).filter(
          (r) => r.status !== 'idle',
        ).length;
        const idleRovers = totalRovers - activeRovers;

        setStatistics({
          totalRovers,
          activeRovers,
          idleRovers,
        });
      })
      .catch((err) => console.error('Error fetching rover data:', err));
  }, []);

  // Chakra Color Mode
  const brandColor = useColorModeValue('brand.500', 'white');
  const boxBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');
  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Box mt="20px">
        <FormLabel fontSize="lg" fontWeight="bold">
          Rovers
        </FormLabel>
      </Box>
      <SimpleGrid
        columns={{ base: 1, md: 2, lg: 3, '2xl': 6 }}
        gap="20px"
        mb="20px"
        w="100%"
      >
       
          <MiniStatistics
            startContent={
              <IconBox
                w="56px"
                h="56px"
                bg={boxBg}
                icon={
                  <Icon w="32px" h="32px" as={MdBarChart} color={brandColor} />
                }
              />
            }
            name="Total Rovers"
            value={statistics.totalRovers}
          />
          <MiniStatistics
            startContent={
              <IconBox
                w="56px"
                h="56px"
                bg={boxBg}
                icon={
                  <Icon w="32px" h="32px" as={MdBarChart} color={brandColor} />
                }
              />
            }
            name="Active Rovers"
            value={statistics.activeRovers}
          />
          <MiniStatistics
            startContent={
              <IconBox
                w="56px"
                h="56px"
                bg={boxBg}
                icon={
                  <Icon w="32px" h="32px" as={MdBarChart} color={brandColor} />
                }
              />
            }
            name="Idle Rovers"
            value={statistics.idleRovers}
          />
        
      </SimpleGrid>

      <SimpleGrid gap="20px" mb="20px" w="100%">
        <ComplexTable
          columnsData={columnsDataComplex}
          tableData={tableDataComplex}
        />
      </SimpleGrid>


      <SimpleGrid gap="20px" mb="20px" w="100%">
        <TaskTable
          columnsData={columnsDataComplex}
          tableData={tableDataComplex}
        />
      </SimpleGrid>

      <SimpleGrid gap="20px" mb="20px" w="100%">
        <Chart/>
      </SimpleGrid>
    </Box>
  );
}
