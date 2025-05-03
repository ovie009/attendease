import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';
// Make sure React is imported
import React, { forwardRef } from 'react';
import { colors } from '@/utilities/colors';
import InterText from './InterText';

export interface InputProps extends TextInputProps {
	value: string;
	onChangeText: (text: string) => void;
	error?: string;
	onInputEmpty?: (message: string) => void;
	isPasswordInput?: boolean;
	label?: string | undefined;
	// Note: 'ref' should NOT be part of InputProps when using forwardRef
}

// Use React.forwardRef
// Generic types:
// 1. TextInput: The type of the element the ref will point to
// 2. InputProps: The type of the props your component accepts
const Input = forwardRef<TextInput, InputProps>(({
    value,
    onChangeText,
    error, // Note: The error prop is defined but not visually used yet
    onInputEmpty,
    isPasswordInput = false,
    keyboardType,
    onSubmitEditing,
    returnKeyType = 'next',
	editable = true,
	label,
	...rest
}, ref) => { // Receive 'ref' as the second argument

	const handleBlur = () => {
		// Handle blur event
	};

	const handleFocus = () => {
		// Handle focus event
	};

	const handleChangeText = (text: string) => {
		onChangeText(text); // Call the passed handler first

		// Simpler check for becoming empty
		if (value.length > 0 && text.length === 0) {
			onInputEmpty?.("empty fields"); // Use optional chaining
		}
	};

	return (
		<View style={styles.container}>
			{label !== undefined && (
				<InterText
					fontSize={13}
					lineHeight={15}
					color={colors.label}
				>
					{label}
				</InterText>
			)}
			<TextInput
				ref={ref} // <-- Pass the forwarded ref here
				{...rest}
				style={[
					styles.input,
					!editable && {backgroundColor: colors.lightGrey}
				]} // Use combined style
				value={value}
				onChangeText={handleChangeText}
				onBlur={handleBlur}
				onFocus={handleFocus}
				keyboardType={keyboardType}
				secureTextEntry={isPasswordInput}
				onSubmitEditing={onSubmitEditing}
				editable={editable}
				returnKeyType={returnKeyType}
				// placeholderTextColor={colors?.placeholder} // Example: Add placeholder color
			/>
			{/* Optionally display the error message */}
			{/* {error && (
				<InterText style={styles.errorText}>
					{error}
				</InterText>
			)} */}
		</View>
	);
});

// Optional: Add a display name for better debugging
Input.displayName = 'Input';

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