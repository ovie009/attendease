import { StyleSheet, TextInput, TextInputProps } from 'react-native';
import React, { FC } from 'react';

interface InputProps extends TextInputProps {
	value: string;
	onChangeText: (text: string) => void;
	error?: string;
	onInputEmpty?: (message: string) => void;
	isPasswordInput?: boolean;
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
	);
};

export default Input;

const styles = StyleSheet.create({
	input: {
		width: '100%',
		height: 50,
		padding: 10,
		borderWidth: 1,
		borderRadius: 5,
		borderColor: 'gray',
	}
});