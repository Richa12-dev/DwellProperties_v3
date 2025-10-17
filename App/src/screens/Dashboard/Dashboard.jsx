import React from 'react';
import { ScrollView, StatusBar } from 'react-native';
import { Box, Text, VStack, HStack, Button, Divider } from 'native-base';
import CollectionNavBar from '../../components/CollectionNavBar/CollectionNavBar';
import {Colors} from '../../Theme';

const Dashboard = () => {
  return (
    <>
     <StatusBar
        backgroundColor={Colors.black || "#FF0000"}
        barStyle="light-content"
        translucent={false}
     />
     <CollectionNavBar />
     <ScrollView 
       style={{ flex: 1, backgroundColor: '#f5f5f5' }}
       showsVerticalScrollIndicator={false}
       contentContainerStyle={{ paddingBottom: 20 }}
     >
       <VStack space={3} p={3} mt={1}>
                        
         {/* Rental Overview */}
         <Box bg="white" p={4} rounded="xl" shadow={2}>
           <Text fontSize="lg" bold>Rent Collection</Text>
           <Text fontSize="3xl" bold mt={2}>$7,500</Text>
           <Text color="gray.500">Rent Collected This Month</Text>
           <Box mt={2} h={2} bg="gray.200" rounded="md">
             <Box h={2} bg="green.500" w="100%" rounded="md" />
           </Box>
           <Text textAlign="right" color="gray.600">100%</Text>
         </Box>

         {/* Maintenance Requests */}
         <Box bg="white" p={4} rounded="xl" shadow={2}>
           <Text fontSize="lg" bold>Requests Help</Text>
           <VStack mt={2} space={2}>
             <HStack justifyContent="space-between">
               <Text>New</Text>
               <Text bold>1</Text>
             </HStack>
             <HStack justifyContent="space-between">
               <Text>In Progress</Text>
               <Text bold>2</Text>
             </HStack>
             <HStack justifyContent="space-between">
               <Text>Completed</Text>
               <Text bold>3</Text>
             </HStack>
           </VStack>
           <Button mt={3}>View Details</Button>
         </Box>

         {/* Upcoming Maintenance */}
         <Box bg="white" p={4} rounded="xl" shadow={2}>
           <Text fontSize="lg" bold>Upcoming Maintenance</Text>
           <VStack space={3} mt={2}>
             <HStack justifyContent="space-between">
               <VStack>
                 <Text bold>Faucet leaking</Text>
                 <Text fontSize="xs" color="gray.500">Austin, TX · ABC-Pluing</Text>
               </VStack>
               <Text color="gray.600">Apr 22</Text>
             </HStack>
             <Divider />
             <HStack justifyContent="space-between">
               <VStack>
                 <Text bold>Smoke detector</Text>
                 <Text fontSize="xs" color="gray.500">San Diego, CA · Safelectric</Text>
               </VStack>
               <Text color="gray.600">Apr 24</Text>
             </HStack>
             <Divider />
             <HStack justifyContent="space-between">
               <VStack>
                 <Text bold>Door repair</Text>
                 <Text fontSize="xs" color="gray.500">Dallas, TX · Prusion Carpentry</Text>
               </VStack>
               <Text color="gray.600">Apr 25</Text>
             </HStack>
           </VStack>
         </Box>
       </VStack>
     </ScrollView>
     </>
  );
};

export default Dashboard;