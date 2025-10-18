// src/services/geminiService.js
// Gemini AI Service Layer (Free API ready)

/**
 * This module provides a single function getGeminiResponse(prompt)
 * that sends a text prompt (Hindi or English) to the Gemini API
 * and returns the model's generated reply as plain text.
 */

import { GEMINI_API_KEY } from '@env';

/**
 * Sends the user's text (Hindi/English) to Gemini and gets a reply.
 * @param {string} prompt - The text the user spoke
 * @returns {Promise<string>} - Gemini-generated reply
 */
export async function getGeminiResponse(prompt) {
  if (!prompt || !prompt.trim()) return 'कृपया कुछ बोलिए।';

  try {
    console.log('🔗 Sending prompt to Gemini:', prompt);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );


    if (!response.ok) {
      console.error('❌ Gemini API HTTP error:', response.status, await response.text());
      return 'सर्वर से सही उत्तर नहीं मिला।';
    }

    const data = await response.json();
    console.log('✅ Gemini raw response:', JSON.stringify(data, null, 2));

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      'मुझे समझ में नहीं आया। कृपया दोबारा कहें।';

    return text;
  } catch (error) {
    console.error('❌ Gemini API error:', error);
    return 'सर्वर से कनेक्शन में समस्या हुई।';
  }
}
