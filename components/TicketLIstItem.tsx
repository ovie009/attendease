import { StyleSheet, TextInput, TextInputProps, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import React, { FC } from 'react';
import { colors } from '@/utilities/colors';
import InterText from './InterText';
import Flex from './Flex';
import moment from 'moment';

export interface TicketListItemProps extends TouchableOpacityProps {
    index: number,
    title: string,
    ticketId: number,
    timestamp: string, 
}

const TicketListItem: FC<TicketListItemProps> = ({
    index,
    title,
    ticketId,
    timestamp,
	...rest
}) => {

	return (
		<TouchableOpacity style={styles.container} {...rest}>
            <Flex
                flexDirection='row'
                justifyContent='space-between'
                alignItems='center'
                style={{gap: 11}}
            >
                <Flex
                    justifyContent='center'
                    alignItems='center'
                    style={styles.number}
                >
                    <InterText
                        fontSize={20}
                        color={colors.white}
                        fontWeight={700}
                        lineHeight={23}
                    >
                        {index + 1}
                    </InterText>
                </Flex>
                <Flex style={{flex: 1}}>
                    <InterText
                        color={colors.black}
                        fontSize={16}
                        lineHeight={16}
                        numberOfLines={1}
                    >
                        {title} - ID{ticketId}
                    </InterText>
                </Flex>
                <Flex>
                    <InterText
                        fontSize={14}
                        lineHeight={14}
                        color={colors.label}
                    >
                        {moment(timestamp).format('hh:mm a')}
                    </InterText>
                </Flex>
            </Flex>
		</TouchableOpacity>
	);
};

export default TicketListItem;

const styles = StyleSheet.create({
	container: {
		display: 'flex',
		justifyContent: 'flex-start',
		alignItems: 'flex-start',
		gap: 8,
	},
    number: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.primary,
    }
});