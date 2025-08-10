import { StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Lecturer, Student, Ticket } from '@/types/api'
import handleTickets from '@/api/handleTickets'
import { handleDisableDataLoading } from '@/utilities/handleDisableDataLoading'
import { useAppStore } from '@/stores/useAppStore'
import { getLoadingData } from '@/utilities/getLoadingData'
import { FlashList, ListRenderItem } from '@shopify/flash-list'
import TicketCard from '@/components/TicketCard'
import handleStudents from '@/api/handleStudents'
import handleLecturers from '@/api/handleLecturers'
import Container from '@/components/Container'
import { HEIGHT, WIDTH } from '@/utilities/dimensions'
import { colors } from '@/utilities/colors'
import Flex from '@/components/Flex'
import Ionicons from '@expo/vector-icons/Ionicons';
import InterText from '@/components/InterText'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import CustomBottomSheet from '@/components/CustomBottomSheet'
import CustomButton from '@/components/CustomButton'

const Tickets = () => {

    const {
        displayToast
    } = useAppStore.getState()

    const [tickets, setTickets] = useState<Ticket[]>([])
    const [students, setStudents] = useState<Student[]>([]);
    const [lecturers, setLecturers] = useState<Lecturer[]>([]);

    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)

    const [dataLoading, setDataLoading] = useState({
        students: true,
        lecturers: true,
        tickets: true
    })

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const ticketResponse = await handleTickets.getAllOpenTickets(2);
                // console.log("🚀 ~ fetchTickets ~ ticketResponse:", ticketResponse)

                setTickets(ticketResponse.data);

                if (ticketResponse.data.length === 0) {
                    handleDisableDataLoading('lecturers', setDataLoading)
                    handleDisableDataLoading('students', setDataLoading)
                }

                handleDisableDataLoading('tickets', setDataLoading)
            } catch (error:any) {
                displayToast('ERROR', error?.message)
            }
        }
        
        fetchTickets()
    }, [])

    useEffect(() => {
        if (tickets.length === 0) return;

        const fetchStudents = async (): Promise<void> => {
            try {
                const ids = tickets.filter(item => item.student_id !== null)?.map(item => item.student_id!);

                if (ids.length !== 0) {
                    const studentsResponse = await handleStudents.getByIds(ids)
                    setStudents(studentsResponse.data)
                }

                handleDisableDataLoading('students', setDataLoading)
            } catch (error:any) {
                displayToast('ERROR', error?.message)
            }
        }
        
        fetchStudents()
    }, [tickets])

    useEffect(() => {
        if (tickets.length === 0) return;

        const fetchLecturers = async (): Promise<void> => {
            try {
                const ids = tickets.filter(item => item.lecturer_id !== null)?.map(item => item.lecturer_id!);

                if (ids.length !== 0) {
                    const lecturersResponse = await handleLecturers.getByIds(ids)
                    console.log("🚀 ~ fetchLecturers ~ lecturersResponse:", lecturersResponse)
                    setLecturers(lecturersResponse.data)
                }

                handleDisableDataLoading('lecturers', setDataLoading)
            } catch (error:any) {
                displayToast('ERROR', error?.message)
            }
        }
        
        fetchLecturers()
    }, [tickets])

    const data = useMemo((): Array<Ticket & {is_loading?: boolean, student?: Student, lecturer?: Lecturer}> => {
        if (dataLoading.lecturers || dataLoading.students || dataLoading.tickets) {
            return getLoadingData(['title'], [''], 2)
        }

        return tickets.map(item => {
            return {
                ...item,
                student: students.find(student => student.id === item.student_id),
                lecturer: lecturers.find(lecturer => lecturer.id === item.lecturer_id),
            }
        });
    }, [tickets, students, lecturers, dataLoading])

    const sheetRef = useRef<BottomSheetModal>(null);

    const openBottomSheet = () => {
        sheetRef?.current?.present()
    }
    
    const closeBottomSheet = () => {
        sheetRef?.current?.close()
    }
    

    const renderItem: ListRenderItem<Ticket & { is_loading?: boolean, student?: Student, lecturer?: Lecturer }> = useCallback(({ item }) => (
        <TicketCard
            title={item.title}
            description={item.description}
            student={item?.student}
            lecturer={item?.lecturer}
            isLoading={item?.is_loading}
            timestamp={item?.created_at}
            isActive={item.is_active}
            onPressEdit={() => {
                setSelectedTicket(item)
                openBottomSheet()
            }}
        />
    ), [])

    const handleCloseTicket = async () => {
        try {
            if (!selectedTicket?.id) {
                throw new Error("Cannot find selected ticket")
            }
            await handleTickets.closeTicket(selectedTicket.id);

            setTickets(prevState => {
                return prevState.map(item => {
                    return {
                        ...item,
                        is_active: item.id === selectedTicket.id ? false : item.is_active,
                    }
                })
            })

            displayToast('SUCCESS', 'Ticket closed successfully')
            closeBottomSheet()
        } catch (error:any) {
            displayToast('ERROR', error?.message)
        }
    }   
    

    return (
        <React.Fragment>
            <Container
                width={WIDTH}
                height={HEIGHT}
                backgroundColor={colors.white}
                paddingHorizontal={20}
            >
                <FlashList
                    data={data}
                    contentContainerStyle={{paddingTop: 30}}
                    keyExtractor={(item) => item.id}
                    estimatedItemSize={100}
                    renderItem={renderItem}
                    ListEmptyComponent={(
                        <Flex
                            gap={20}
                            justifyContent='center'
                            alignItems='center'
                            height={HEIGHT/2}
                        >
                            <Ionicons name="ticket-outline" size={60} color={colors.primary} />
                            <Flex
                                gap={10}
                                justifyContent='center'
                                alignItems='center'
                            >
                                <InterText
                                    fontWeight={500}
                                    fontSize={18}
                                >
                                    No tickets
                                </InterText>
                                <InterText
                                    color={colors.subtext}
                                >
                                    Your open tickets would appear here
                                </InterText>
                            </Flex>
                        </Flex>
                    )}
                />
            </Container>
            <CustomBottomSheet
                ref={sheetRef}
                closeBottomSheet={closeBottomSheet}
                snapPoints={[250]}
                sheetTitle='Close ticket'
            >
                <Flex
                    paddingTop={60}
                    paddingBottom={50}
                    flex={1}
                    justifyContent='space-between'
                >
                    <InterText
                        fontSize={16}
                    >
                        Are you sure you want to close this ticket?
                    </InterText>
                    <Flex
                        flexDirection='row'
                        gap={16}
                        alignItems='center'
                    >
                        <CustomButton
                            width={(WIDTH - 40 - 16)/2}
                            text='Cancel'
                            isSecondary={true}
                            onPress={closeBottomSheet}
                        />
                        <CustomButton
                            width={(WIDTH - 40 - 16)/2}
                            text='Yes, close'
                            onPress={handleCloseTicket}
                        />
                    </Flex>
                </Flex>
            </CustomBottomSheet>
        </React.Fragment>
    )
}

export default Tickets

const styles = StyleSheet.create({})