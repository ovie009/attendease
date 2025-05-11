import Groq from "groq-sdk";

export const groq = new Groq({ apiKey: process.env.EXPO_PUBLIC_GROQ_API_KEY });