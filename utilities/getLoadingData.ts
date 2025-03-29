// No longer need to import loadingData.json for this function's core logic
// import loadingData from '../data/loading_data.json';

// Define the FINAL intended structure of the items returned by the function.
// It MUST have 'id' (string) and 'is_loading' (boolean).
// It CAN have any other string keys with string or number values from dynamicProps.
type ResultItem = {
    id: string;
    is_loading: boolean;
    // Index signature for the combined object, allowing the dynamic props
    [key: string]: string | number | boolean; // boolean is needed for is_loading
};

export const getLoadingData = (
    fieldNames: string[],
    values: (string | number)[],
    length: number = 4 // Added length parameter with default value 4
): Array<ResultItem> => { // Function returns an array of these ResultItems

    // Validate input arrays (optional but recommended)
    if (fieldNames.length !== values.length) {
        console.error("getLoadingData: fieldNames and values arrays must have the same length.");
        // Decide how to handle mismatch: throw error, return empty array, etc.
        return []; // Example: return empty array on mismatch
    }

    // Build the dynamic properties object ONCE outside the loop/map
    const dynamicProps: Record<string, string | number> = {};
    fieldNames.forEach((fieldName: string, index: number) => {
        dynamicProps[fieldName] = values[index];
    });

    // Generate an array of the specified 'length'
    // Use Array.from for a concise way to create and map an array of a given length
    const resultArray = Array.from({ length }, (_, index): ResultItem => {
        // Construct the final object for each item in the new array
        const result: ResultItem = {
            // ID is now the current index converted to a string
            id: String(index),
            // is_loading is always true for this function's purpose
            is_loading: true,
            // Spread the pre-calculated dynamic properties
            ...dynamicProps,
        };
        return result;
    });

    return resultArray;
};
