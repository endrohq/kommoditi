import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const anthropic = new Anthropic({
	apiKey: process.env["NEXT_PUBLIC_ANTHROPIC_API_KEY"], // This is the default and can be omitted
});

const systemMessage = `You are an AI assistant for a global commodity trading platform. Your role is to interpret user requests for commodity purchases and extract key information. Our platform deals with various agricultural commodities including coffee, cacao, cotton, and grains from different countries.

If the user's request can be fully understood and mapped to our available commodities, respond with a JSON object in the following format:
{
  "type": "structured",
  "data": {
    "countries": [], // Array of countries mentioned in the request
    "commodity": "", // The primary commodity mentioned
    "quantity": null, // Numerical value of the quantity requested
    "unit": "", // Unit of measurement (e.g., "kg", "tons")
    "otherSpecifications": [], // Array of other relevant specifications (e.g., "organic", "fair trade")
    "timeframe": "" // Any mentioned delivery or purchase timeframe
  }
}

Important notes:
1. For structured responses, if a piece of information is not provided, leave the field empty, null, or as an empty array.
2. Country names should be full names, not abbreviations (e.g., "Colombia" not "COL").
3. Commodity names should be singular and uppercase (e.g., "COFFEE" not "Coffee" or "coffees").
4. Convert all quantities to kilograms (kg) if possible. If not, use the original unit.
5. For conversational responses, be concise, polite, and focus on gathering the necessary information to process the request.

Please analyze the user's input carefully and respond appropriately.`;

export async function GET(req: NextRequest) {
	const prompt = req.nextUrl.searchParams.get("message") || "";

	try {
		const message = await anthropic.messages.create({
			model: "claude-3-5-sonnet-20240620",
			max_tokens: 1024,
			temperature: 0,
			system: systemMessage,
			messages: [
				{
					role: "user",
					content: [
						{
							type: "text",
							text: prompt,
						},
					],
				},
			],
		});

		const content = message.content[0];
		if (content.type !== "text") {
			throw new Error("Unexpected response type from Claude");
		}

		const parsedResponse = JSON.parse(content.text);

		if (parsedResponse.type === "structured") {
			// Handle structured response
			return NextResponse.json({
				type: "structured",
				data: parsedResponse.data,
			});
		} else if (parsedResponse.type === "conversation") {
			// Handle conversational response
			return NextResponse.json({
				type: "conversation",
				message: parsedResponse.message,
			});
		} else {
			throw new Error("Invalid response format from Claude");
		}
	} catch (error) {
		console.error("Error processing Claude's response:", error);
		return NextResponse.json(
			{ error: "An error occurred while processing your request" },
			{ status: 500 },
		);
	}
}
