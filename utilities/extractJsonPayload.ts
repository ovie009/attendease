const extractJsonPayload = (input: string): Array<any> => {
  // Find the first occurrence of '{'
    const startIndex = input.indexOf('[');
    // Find the last occurrence of '}'
    const endIndex = input.lastIndexOf(']');
    
    // Ensure both indices exist in the input string
    if (startIndex === -1 || endIndex === -1 || startIndex > endIndex) {
      throw new Error("Invalid input: No JSON payload found.");
    }

    // Extract and parse the JSON substring
    const jsonString = input.slice(startIndex, endIndex + 1);
    console.log("🚀 ~ extractJsonPayload ~ jsonString:", jsonString)
    try {
  		return JSON.parse(jsonString);
    } catch (error) {
      // return jsonString
	  	throw new Error("Invalid JSON format.");
    }
}

export default extractJsonPayload
