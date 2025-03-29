import { Dispatch, SetStateAction } from 'react';

// Corrected Generic handleDisableDataLoading function
export const handleDisableDataLoading = <
    // T is the type of the state object (e.g., { colleges: boolean })
    // K is the type of the keys within that state object (e.g., 'colleges')
    T extends Record<K, boolean>,
    K extends string
>(
    fieldName: K, // Ensure fieldName is a valid key of T
    setDataLoading: Dispatch<SetStateAction<T>> // Use React's specific type
) => {
    // Pass the updater function directly to the React state setter
    setDataLoading((prevValue) => {
        // Handle potential undefined initial state
        const currentPrevValue = prevValue || {} as T; // Assert as T if starting potentially undefined
        return {
            ...currentPrevValue,
            [fieldName]: false, // Use the specific key K
        };
    });
};