import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import React, { FC } from 'react';
import { colors } from '@/utilities/colors';
import InterText from './InterText';

export interface InputProps extends TextInputProps {
	value: string;
	onChangeText: (text: string) => void;
	error?: string;
	onInputEmpty?: (message: string) => void;
	isPasswordInput?: boolean;
	label?: string | undefined,
}

const Input: FC<InputProps> = ({
    value,
    onChangeText,
    error,
    onInputEmpty,
    isPasswordInput = false,
    keyboardType,
    onSubmitEditing,
    returnKeyType = 'next',
	label,
	...rest
}) => {
	const previousValue = React.useRef(value);

	const handleBlur = () => {
		// Handle blur event
	};

	const handleFocus = () => {
		// Handle focus event
	};

	const handleChangeText = (text: string) => {
		if (onChangeText) onChangeText(text);

		if (previousValue.current.length === 1 && text.length === 0) {
		onInputEmpty && onInputEmpty("empty fields");
		}
		previousValue.current = text;
	};

	return (
		<View style={styles.container}>
			{label !== undefined && (
				<InterText
					fontSize={13}
					lineHeight={15}
					color={colors?.label}
				>
					{label}
				</InterText>
			)}
			<TextInput
				{...rest}
				style={styles.input}
				value={value}
				onChangeText={handleChangeText}
				onBlur={handleBlur}
				onFocus={handleFocus}
				keyboardType={keyboardType}
				secureTextEntry={isPasswordInput}
				onSubmitEditing={onSubmitEditing}
				returnKeyType={returnKeyType}
			/>
		</View>
	);
};

export default Input;

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
	}
});