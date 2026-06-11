exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return json(500, { error: 'GEMINI_API_KEY is missing in Netlify Environment Variables.' });
  }

  let input;
  try {
    input = JSON.parse(event.body || '{}');
  } catch (error) {
    return json(400, { error: 'Invalid JSON body.' });
  }

  const safe = (value, fallback = '') => String(value || fallback).slice(0, 600);
  const benefits = Array.isArray(input.benefits) ? input.benefits.slice(0, 4).map(x => safe(x, '')) : [];
  const language = safe(input.language, 'English');
  const videoType = safe(input.videoType, 'product');

  const prompt = `
You are creating short TikTok/Reels content for a real pharmacy brand called "${safe(input.brandName, 'Self Care Pharmacy')}" in Hurghada, Egypt.
Create a safe, compliant short-form video script in ${language}.

Video type: ${videoType}
Product/topic: ${safe(input.productName, 'Pharmacy essentials')}
Price/offer line: ${safe(input.priceLine, '')}
Existing hook: ${safe(input.hook, '')}
Core points: ${benefits.join(' | ')}
Website/order link: ${safe(input.website, '')}
Duration: ${safe(input.duration, '15')} seconds

Safety rules:
- Do not diagnose disease.
- Do not give dosage instructions.
- Do not promise cures or guaranteed results.
- Do not suggest prescription medicine without a doctor/pharmacist.
- Keep claims general and safe.
- For health/medicine topics, include a short safety note such as ask a pharmacist/doctor when needed.
- Make it catchy, simple, tourist-friendly, and suitable for TikTok.

Return JSON only with this exact shape:
{
  "hook": "max 9 words",
  "benefits": ["short point 1", "short point 2", "short point 3"],
  "priceLine": "short price/offer/delivery line",
  "cta": "short call to action",
  "voiceover": ["line for scene 1", "line for scene 2", "line for scene 3", "line for scene 4", "line for scene 5"],
  "caption": "social caption",
  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3", "#hashtag4"],
  "safetyNote": "short safety note"
}`;

  try {
    const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.85,
          responseMimeType: 'application/json'
        }
      })
    });

    const raw = await response.json();
    if (!response.ok) {
      return json(response.status, { error: raw.error?.message || 'Gemini API request failed.' });
    }

    const text = raw.candidates?.[0]?.content?.parts?.map(part => part.text || '').join('\n') || '{}';
    const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
    let data;
    try {
      data = JSON.parse(cleaned);
    } catch (error) {
      data = {
        hook: safe(input.hook, 'Need pharmacy delivery?'),
        benefits: benefits.length ? benefits : ['Hotel delivery', 'Easy online order', 'WhatsApp follow-up'],
        priceLine: safe(input.priceLine, 'Order online'),
        cta: 'Order now from the website',
        voiceover: cleaned.split('\n').filter(Boolean).slice(0, 5),
        caption: cleaned,
        hashtags: ['#SelfCarePharmacy', '#Hurghada', '#PharmacyDelivery'],
        safetyNote: 'Ask a pharmacist or doctor when needed.'
      };
    }

    data.benefits = Array.isArray(data.benefits) ? data.benefits.slice(0, 4) : [];
    data.voiceover = Array.isArray(data.voiceover) ? data.voiceover.slice(0, 5) : [];
    data.hashtags = Array.isArray(data.hashtags) ? data.hashtags.slice(0, 8) : [];

    return json(200, { data });
  } catch (error) {
    return json(500, { error: error.message || 'Unexpected server error.' });
  }
};

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    },
    body: JSON.stringify(body)
  };
}
