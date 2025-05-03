// ./app/(app)/(tabs)/home.tsx
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { ReactNode, useState } from 'react'
import { colors } from '@/utilities/colors'
import InterText from '@/components/InterText'
import CollegeIcon from '@/assets/svg/CollegeIcon.svg';
import DepartmentIcon from '@/assets/svg/DepartmentIcon.svg';
import SolidArrowIcon from '@/assets/svg/SolidArrowIcon.svg';
import AddCircleLargeIcon from '@/assets/svg/AddCircleLargeIcon.svg';
import { WIDTH } from '@/utilities/dimensions';
import LinkText from '@/components/LinkText';
import moment from 'moment';
import TicketListItem from '@/components/TicketLIstItem';
import Flex from '@/components/Flex';
import { useRouter } from 'expo-router';

const Home = () => {

	const router = useRouter();

	const [stats, setStats] = useState<Array<{stat_name: string, value: number, Icon: ReactNode}>>([
		{
			stat_name: 'Colleges',
			value: 4,
			Icon: <CollegeIcon width={20} height={20} />
		},
		{
			stat_name: 'Departments',
			value: 23,
			Icon: <DepartmentIcon width={20} height={20} />
		},
	])

	const [tickets, setTickets] = useState([
		{
			id: '1',
			title: 'Card change',
			ticket_id: 1234,
			created_at: moment().subtract(200, 'minutes').toISOString(),
		},
		{
			id: '2',
			title: 'Access issues',
			ticket_id: 1234,
			created_at: moment().subtract(270, 'minutes').toISOString(),
		},
	]) 

	return (
		<ScrollView
			contentContainerStyle={styles.contentContainer}
		>
			<View style={styles.main}>
				<View style={styles.statSection}>
					<InterText
						fontSize={14}
						lineHeight={17}
					>
						Stats
					</InterText>
					<View style={styles.statsContainer}>
						{stats.map(item => (
							<View key={item?.stat_name} style={styles.stat}>
								<InterText
									fontSize={24}
									lineHeight={29}
									fontWeight={600}
								>
									{item.value}
								</InterText>
								<View style={styles.statDescription}>
									{item.Icon}
									<View style={styles.statName}>
										<InterText
											numberOfLines={1}
											fontWeight={600}
											color={colors.subtext}
											// fontSize={10}
										>
											{item?.stat_name}
										</InterText>
									</View>
								</View>
							</View>
						))}
					</View>
				</View>
				<View style={styles.ticketSection}>
					<View style={styles.ticketHeader}>
						<InterText>
							Open Tickets
						</InterText>
						<SolidArrowIcon />
					</View>
					<View style={styles.tickets}>
						<View style={styles.ticketList}>
							{tickets.map((item, index) => (
								<TicketListItem
									key={item.id}
									index={index}
									title={item?.title}
									ticketId={item?.ticket_id}
									timestamp={item?.created_at}
								/>
							))}
						</View>
						<LinkText
							onPress={() => {}}
						>
							View all
						</LinkText>
					</View>
				</View>
				<TouchableOpacity
					style={styles.scanCardButton}
					onPress={() => {
						router.push('/(root)/(app)/(card)/scanCard')
					}}
				>
					<Flex
						style={styles.scanCardButtonContent}
						gap={34}
						justifyContent='center'
						alignItems='center'
						flexDirection='row'
					>
						<View style={styles.addIconWrapper}>
							<AddCircleLargeIcon />
						</View>
						<InterText
							fontSize={24}
							lineHeight={24}
							color={colors.label}
						>
							Scan New Card
						</InterText>
					</Flex>
				</TouchableOpacity>
			</View>
		</ScrollView>
	)
}

export default Home

const styles = StyleSheet.create({
	contentContainer: {
		backgroundColor: colors.white,
		flexGrow: 1,
		paddingHorizontal: 20,
	},
	main: {
		paddingTop: 50,
		display: 'flex',
		gap: 50,
		width: '100%',
	},
	statSection: {
		display: 'flex',
		justifyContent: 'flex-start',
		alignItems: 'flex-start',
		gap: 7,
	},
	statsContainer: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'flex-start',
		flexDirection: 'row',
		gap: 20,
	},
	stat: {
		width: (WIDTH - 60)/2,
		height: 96,
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'flex-start',
		paddingHorizontal: 22,
		backgroundColor: colors.accentLight,
		borderRadius: 10,
		gap: 7,
	},
	statDescription: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'flex-start',
		alignItems: 'center',
		gap: 10,
	},
	statName: {
		flex: 1,
	},
	ticketSection: {
		display: 'flex',
		width: '100%',
		gap: 13,
	},
	ticketHeader: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		backgroundColor: colors.lightGrey,
		borderRadius: 10,
		flexDirection: 'row',
		paddingVertical: 4,
		paddingHorizontal: 5,
	},
	tickets: {
		display: 'flex',
		gap: 7,
		justifyContent: 'flex-start',
		alignItems: 'flex-end',
	},
	ticketList: {
		width: '100%',
		borderRadius: 11,
		borderWidth: 1,
		borderColor: colors.lightGrey,
		padding: 10,
		gap: 11,
		display: 'flex',
	},
	scanCardButton: {
		borderRadius: 11,
		width: '100%',
		elevation: 5,
		backgroundColor: colors.white,
		shadowOpacity: 0.4,
		shadowRadius: 30,
		shadowColor: colors.label,
	},
	scanCardButtonContent: {
		paddingVertical: 38,
		borderWidth: 1,
		borderColor: colors.lightGrey,
		borderRadius: 11,
		width: '100%',
		position: 'relative',
	},
	addIconWrapper: {
		position: 'absolute',
		left: 24,
	}
	
})