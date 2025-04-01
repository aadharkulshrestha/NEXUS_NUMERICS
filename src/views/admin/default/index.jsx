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

import { columnsDataComplex } from 'views/admin/default/variables/columnsData';
import tableDataComplex from 'views/admin/default/variables/tableDataComplex.json';

const statisticsData = [
  {
    name: "Total Active Rovers",
    value: "5", // Replace with dynamic data if available
    icon: MdBarChart,
  },
  {
    name: "Total Idle Rovers",
    value: "12",
    icon: MdBarChart,
  },
  {
    name: "Total Active Rovers",
    value: "9",
    icon: MdBarChart,
  },
  // {
  //   name: "Pending Missions",
  //   value: "3",
  //   icon: MdBarChart,
  // },
];

export default function UserReports() {
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
        {/* <MiniStatistics
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
          name="Earnings"
          value="$350.4"
        />
        <MiniStatistics
          startContent={
            <IconBox
              w="56px"
              h="56px"
              bg={boxBg}
              icon={
                <Icon w="32px" h="32px" as={MdAttachMoney} color={brandColor} />
              }
            />
          }
          name="Spend this month"
          value="$642.39"
        />
        <MiniStatistics growth="+23%" name="Sales" value="$574.34" /> */}

        {statisticsData.map((stat, index) => (
          <MiniStatistics
            key={index}
            startContent={
              <IconBox
                w="56px"
                h="56px"
                bg={boxBg}
                icon={
                  <Icon w="32px" h="32px" as={stat.icon} color={brandColor} />
                }
              />
            }
            name={stat.name}
            value={stat.value}
          />
        ))}
      </SimpleGrid>

      <SimpleGrid
        
        gap="20px"
        mb="20px"
        w="100%"
      >
        <ComplexTable
          columnsData={columnsDataComplex}
          tableData={tableDataComplex}
        />
      </SimpleGrid>
    </Box>
  );
}
