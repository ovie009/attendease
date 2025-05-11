const getFileExtension = (filePath: string) => {
    if (!filePath) return '';

    // Find the position of the last dot in the file
    const lastDotIndex = filePath?.lastIndexOf('.');

    // If the dot is found, return the substring from the dot to the end
    if (lastDotIndex !== -1) {
        return filePath?.substring(lastDotIndex + 1);
    }

    // If not dot is found return an empty string
    return '';
}


export default getFileExtension;