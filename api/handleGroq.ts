import extractJsonPayload from "@/utilities/extractJsonPayload";
import { groq } from "../lib/qroq";

export type ProcessScheduleResponse = {
	course_code: string,
	course_id: string | null,
	venue: string,
	days_of_the_week: number[],
	lecture_hours: number[],
	lecture_start_time: number[],
	id: string,
}

const processSchedule = async (imageUri: string, courses: Array<{id: string, course_code: string}>, exclude_course_codes: string[]): Promise<Array<ProcessScheduleResponse> | null> => {
    try {
		// const payload = {
		// 	messages: [
		// 		{
		// 			"role": "user",
		// 			"content": [
		// 				{
		// 				"type": "text",
		// 				"text": `From the provided image, extract an array of lecture schedules in the following format:
		// 					[{ course_code: string, course_id: string | null, venue: string, days_of_the_week: number[], lecturer_hours: number[] }]
		// 					Match each course_code against this list to set course_id:
		// 					${JSON.stringify(courses)}
		// 					If no match is found, course_id should be null.
		// 					Extract venue from square brackets (e.g., [VENUE]) and return it without the brackets. If not found, set as an empty string.
		// 					Use numbers for days_of_the_week: Monday = 1, ..., Saturday = 6.
		// 					Ensure lecturer_hours[i] corresponds to days_of_the_week[i].
		// 					Return JSON array only — no explanation or extra text.`
		// 				},
		// 				{
		// 				"type": "image_url",
		// 				"image_url": {
		// 					"url": imageUri
		// 				}
		// 				}
		// 			]
		// 		}
		// 	],
		// 	model: "meta-llama/llama-4-scout-17b-16e-instruct",
		// 	temperature: 1,
		// 	max_completion_tokens: 5024,
		// 	top_p: 1,
		// 	stream: false,
		// 	stop: null
        // }

        const chatCompletion = await groq.chat.completions.create({
			"messages": [
				{
					"role": "user",
					"content": [
						{
						"type": "text",
						"text": `From the provided image, extract an array of lecture schedules for all course codes present in the timetable, using the format:
							[{ 
								course_code: string,  
								course_id: string | null,  
								venue: string,  
								days_of_the_week: number[],  
								lecture_hours: number[],  
								lecture_start_time: number[]  
							}]

							Use this list to set course_id by matching course_code:
							${JSON.stringify(courses)}
							If a match is not found, set course_id as null.
							Very Very Important!!!! Exclude the following course codes from your results/extraction: ${exclude_course_codes.join(',')}
							Extract venue from square brackets (e.g., [VENUE]), remove the brackets. If not found, use an empty string.
							Use the following mapping for days_of_the_week: Monday = 1, Tuesday = 2, ..., Saturday = 6.
							For each occurrence of a course, extract:
							where length of array equal to number days a course code appears in the timetable
							days_of_the_week[i]: the day it's held
							lecture_hours[i]: how many hours the lecture lasts
							lecture_start_time[i]: the starting hour (e.g., 8 for 8am)
							the lecture start time is at the first row of the table
							If the timetable header does not include times, assume each column represents 1 hour starting from 8 (i.e., first column = 8am, last = 4pm).
							Ensure all arrays align by index (e.g., lecture_start_time[i] corresponds to days_of_the_week[i]).
							Only return one entry of every course_code
							Respond with JSON array only — no extra text, explanation, or formatting.`
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
			"max_completion_tokens": 8000,
			"top_p": 1,
			"stream": false,
			"stop": null
        });
      
        const response: string | null = chatCompletion.choices[0].message.content;
        // console.log("🚀 ~ processSchedule ~ response:", response)

        if (!response) return null;
        // console.log("🚀 ~ processSchedule ~ response:", response)
        
        return extractJsonPayload(response);
        
    } catch (error) {
        throw error;
    }
}

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
	processSchedule
}