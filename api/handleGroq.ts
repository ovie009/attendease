import extractJsonPayload from "@/utilities/extractJsonPayload";
import { groq } from "../lib/qroq";

const processCourses = async (imageUri: string): Promise<Array<{course_title: string, course_code: string}> | null> => {
    try {
        const chatCompletion = await groq.chat.completions.create({
          "messages": [
            {
              "role": "user",
              "content": [
                {
                  "type": "text",
                  "text": `For the images provided, extract an array of course title and course code, reply with an array of JSON {course_title: string, course_code: string}[]
                    Response format (JSON array only):
                    dont list steps or add any paragraph or text`
                },
                {
                  "type": "image_url",
                  "image_url": {
                    "url": imageUri
                  }
                }
              ]
            }
          ],
          "model": "meta-llama/llama-4-scout-17b-16e-instruct",
          "temperature": 1,
          "max_completion_tokens": 1024,
          "top_p": 1,
          "stream": false,
          "stop": null
        });
      
        const response: string | null = chatCompletion.choices[0].message.content;

        if (!response) return null;
        
        return extractJsonPayload(response);
        
    } catch (error) {
        throw error;
    }
}


export default {
    processCourses,
}