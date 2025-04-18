import { StyleSheet, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import React, { FC } from 'react';
import { colors } from '@/utilities/colors';
import InterText from './InterText';
import RightArrowIcon from '../assets/svg/RIghtArrowIcon.svg';

interface InputProps extends TouchableOpacityProps {
	value?: string | undefined;
	placeholder?: string | undefined;
	label?: string | undefined,
}

const SelectInput: FC<InputProps> = ({
    value,
    placeholder,
	label,
	...rest
}) => {

	return (
		<TouchableOpacity style={styles.container} {...rest}>
			{label !== undefined && (
				<InterText
					fontSize={13}
					lineHeight={15}
					color={colors?.label}
				>
					{label}
				</InterText>
			)}
			<View
				style={styles.input}
            >
				<View style={styles.textWrapper}>
					<InterText
						fontSize={12.5}
						lineHeight={15}
						color={(value !== undefined && value !== '') ? colors.black : colors.label}
						numberOfLines={1}
					>
						{(value === undefined || value === '') && placeholder !== undefined && placeholder}
						{(value !== undefined && value !== '') && value}
					</InterText>
				</View>
				<View style={styles.arrowIcon}>
					<RightArrowIcon />
				</View>
            </View>
		</TouchableOpacity>
	);
};

export default SelectInput;

const styles = StyleSheet.create({
	container: {
		display: 'flex',
		justifyContent: 'flex-start',
		alignItems: 'flex-start',
		gap: 8,
	},
	input: {
		width: '100%',
		height: 40,
		paddingHorizontal: 9,
		borderWidth: 1,
		borderColor: colors.inputBorder,
		borderRadius: 9,
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		flexDirection: 'row',
	},
	textWrapper: {
		flex: 1,
		display: 'flex',
		alignItems: 'flex-start',
		justifyContent: 'center',
	},
	arrowIcon: {
		transform: [{rotate: '90deg'}]
	}
});