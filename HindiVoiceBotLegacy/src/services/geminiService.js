import { GEMINI_API_KEY } from '@env';

/**
 * Sends the user's text (Hindi/Tamil) to Gemini and gets a reply.
 * @param {string} prompt - The full prompt (includes prefix from UI)
 * @param {string} language - Optional language code like 'hi-IN' or 'ta-IN'
 * @returns {Promise<string>} - Gemini-generated reply text
 */
export async function getGeminiResponse(prompt, language ) {
  if (!prompt || !prompt.trim()) return 'कृपया कुछ बोलिए।';

  try {
    console.log(`🔗 Sending prompt to Gemini (${language}):`, prompt);

    const languageHint =
      language === 'ta-IN'
        ? 'இனி வரும் அனைத்து பதில்களும் முழுமையாக தமிழ் மொழியில் இருக்க வேண்டும். எளிய தமிழ் வார்த்தைகளில் மட்டும் பதிலளி.'
        : 'अब से सभी उत्तर केवल हिंदी में दीजिए। सरल हिंदी शब्दों का प्रयोग करें।';

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${languageHint}\nபயனர் கூறியது / उपयोगकर्ता ने कहा:\n${prompt}`,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      console.error('❌ Gemini API HTTP error:', response.status, await response.text());
      return language === 'ta-IN'
        ? 'சர்வரில் இருந்து சரியான பதில் இல்லை.'
        : 'सर्वर से सही उत्तर नहीं मिला।';
    }

    const data = await response.json();
    console.log('✅ Gemini raw response:', JSON.stringify(data, null, 2));

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      (language === 'ta-IN'
        ? 'எனக்கு புரியவில்லை. மீண்டும் சொல்லவும்.'
        : 'मुझे समझ में नहीं आया। कृपया दोबारा कहें।');

    return text;
  } catch (error) {
    console.error('❌ Gemini API error:', error);
    return language === 'ta-IN'
      ? 'சர்வர் இணைப்பில் சிக்கல் ஏற்பட்டது.'
      : 'सर्वर से कनेक्शन में समस्या हुई।';
  }
}
