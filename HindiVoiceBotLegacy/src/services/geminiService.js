import { GEMINI_API_KEY } from '@env';
console.log('🔑 Loaded Gemini Key:', GEMINI_API_KEY);

// ✅ Unified Gemini request with language-aware prompt hint
export async function getGeminiResponse(spokenText, language = 'en-US') {
  if (!spokenText || !spokenText.trim()) return 'Please say something.';

  try {
    console.log(`🔗 Sending prompt to Gemini (${language}):`, spokenText);

    // 💡 Add a proper hint for each language
    const languageHint = {
      'hi-IN': 'अब से सभी उत्तर केवल हिंदी (देवनागरी लिपि) में दीजिए। सरल शब्दों का प्रयोग करें।',
      'ta-IN': 'இனி வரும் அனைத்து பதில்களும் தமிழ் மொழியில் இருக்க வேண்டும். எளிய தமிழ் வார்த்தைகளைப் பயன்படுத்துங்கள்.',
      'si-LK': 'ඔබේ සියලු පිළිතුරු සිංහල භාෂාවෙන් (සිංහල අකුරු වලින්) ලබා දෙන්න.',
      'ms-MY': 'Sila jawab dalam Bahasa Melayu sahaja, dengan ayat mudah difahami.',
      'zh-CN': '请仅使用中文（简体）回答，使用简单的句子表达。',
      'en-US': 'Reply only in English, using clear and short sentences.',
    }[language] || 'Reply naturally in the same language as the user.';

    const prompt = `
You are a multilingual assistant.
User may speak Sinhala, Tamil, Hindi, Malay, Chinese, or English.
Their text might contain mixed or distorted words.
1️⃣ Detect the intended language.
2️⃣ Reply naturally in that same language — short, friendly, and contextually appropriate.
3️⃣ Use the native script.

${languageHint}

User said:
${spokenText}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!response.ok) {
      console.error('❌ Gemini HTTP error:', response.status, await response.text());
      return getFallbackError(language);
    }

    const data = await response.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      getFallbackText(language);

    console.log('✅ Gemini raw response:', text);
    return text;
  } catch (error) {
    console.error('❌ Gemini API error:', error);
    return getFallbackError(language);
  }
}

function getFallbackError(language) {
  const fallback = {
    'hi-IN': 'सर्वर से कनेक्शन में समस्या हुई।',
    'ta-IN': 'சர்வர் இணைப்பில் சிக்கல் ஏற்பட்டது.',
    'si-LK': 'සර්වර් සම්බන්ධතාවයේ ගැටලුවක් ඇතිව ඇත.',
    'ms-MY': 'Terdapat masalah sambungan pelayan.',
    'zh-CN': '服务器连接出现问题。',
    'en-US': 'There was a problem connecting to the server.',
  };
  return fallback[language] || fallback['en-US'];
}

function getFallbackText(language) {
  const fallback = {
    'hi-IN': 'मुझे समझ में नहीं आया। कृपया दोबारा कहें।',
    'ta-IN': 'எனக்கு புரியவில்லை. மீண்டும் சொல்லவும்.',
    'si-LK': 'මට තේරෙන්නේ නැහැ. කරුණාකර නැවත කියන්න.',
    'ms-MY': 'Saya tidak faham. Sila ulang semula.',
    'zh-CN': '我不明白。请再说一遍。',
    'en-US': "I didn't understand. Please repeat.",
  };
  return fallback[language] || fallback['en-US'];
}
