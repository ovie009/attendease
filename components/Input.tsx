import { StyleSheet, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
// Make sure React is imported
import React, { forwardRef, useState } from 'react';
import { colors } from '@/utilities/colors';
import InterText from './InterText';
import Flex from './Flex';
import { WIDTH } from '@/utilities/dimensions';

export interface InputProps extends TextInputProps {
	defaultValue: string;
	onChangeText: (text: string) => void;
	error?: string;
	onInputEmpty?: (message: string) => void;
	isPasswordInput?: boolean;
	label?: string | undefined;
	width?: number | undefined;
	height?: number | undefined;
	// Note: 'ref' should NOT be part of InputProps when using forwardRef
}

// Use React.forwardRef
// Generic types:
// 1. TextInput: The type of the element the ref will point to
// 2. InputProps: The type of the props your component accepts
const Input = forwardRef<TextInput, InputProps>(({
    defaultValue,
    onChangeText,
    error, // Note: The error prop is defined but not visually used yet
    onInputEmpty,
    isPasswordInput = false,
    keyboardType,
    onSubmitEditing,
    returnKeyType = 'next',
	editable = true,
	width,
	height,
	label,
	...rest
}, ref) => { // Receive 'ref' as the second argument

	const [isSecure, setIsSecure] = useState(isPasswordInput ? true : false);

	const handleBlur = () => {
		// Handle blur event
	};

	const handleFocus = () => {
		// Handle focus event
	};

	const handleChangeText = (text: string) => {
		onChangeText(text); // Call the passed handler first

		// Simpler check for becoming empty
		if (defaultValue.length > 0 && text.length === 0) {
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
			<Flex
				width={width || (WIDTH - 40)}
				height={height || 40}
				paddingHorizontal={9}
				flexDirection='row'
				gap={10}
				alignItems='center'
				style={{
					borderWidth: 1,
					borderColor: colors.inputBorder,
					borderRadius: 9,
				}}
			>
				<TextInput
					ref={ref} // <-- Pass the forwarded ref here
					{...rest}
					style={[
						styles.input,
						!editable && {backgroundColor: colors.lightGrey}
					]} // Use combined style
					defaultValue={defaultValue}
					onChangeText={handleChangeText}
					onBlur={handleBlur}
					onFocus={handleFocus}
					keyboardType={keyboardType}
					secureTextEntry={isSecure}
					onSubmitEditing={onSubmitEditing}
					editable={editable}
					returnKeyType={returnKeyType}
					placeholderTextColor={colors.placeholder} // Example: Add placeholder color
				/>
				{isPasswordInput && (
					<TouchableOpacity
						onPress={() => setIsSecure(!isSecure)}
					>
						<Feather name="eye-off" size={16} color={colors.subtext} />
					</TouchableOpacity>
				)}
			</Flex>
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
		borderRadius: 9,
		flex: 1,
		color: colors.black
	}
});