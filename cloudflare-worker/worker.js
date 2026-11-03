/**
 * Cloudflare Worker: 100% Free AI Timetable Scanner
 * 
 * Provides a secure serverless backend proxy for Attendance Manager.
 * Students can upload timetable photos without needing any API key or Google account!
 * 
 * Setup in 2 minutes:
 * 1. Log in to https://dash.cloudflare.com (Free)
 * 2. Workers & Pages -> Create Worker -> Deploy
 * 3. Edit Code -> Paste this file -> Save & Deploy
 * 4. Settings -> Variables and Secrets -> Add Secret "GEMINI_API_KEY"
 */

export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method === 'GET') {
      return new Response(JSON.stringify({ 
        status: 'online', 
        service: 'Attendance Manager Timetable AI Scanner',
        version: '1.0'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    try {
      const apiKey = env.GEMINI_API_KEY;
      if (!apiKey) {
        return new Response(JSON.stringify({ 
          error: 'GEMINI_API_KEY secret is not set in Cloudflare Worker settings.' 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const body = await request.json().catch(() => ({}));
      const { imageBase64, mimeType } = body;

      if (!imageBase64) {
        return new Response(JSON.stringify({ error: 'Missing imageBase64 payload.' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const SYSTEM_PROMPT = `You are an expert college and university timetable schedule extractor.
Your job is to examine the provided timetable image and extract ALL classes into a structured weekly schedule.

Rules:
1. Day: Must be one of "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday". Normalize abbreviations (MON -> Monday, TUE -> Tuesday, etc.).
2. Times: Must be 24-hour HH:MM format (e.g. "08:30", "11:10", "12:00", "13:40", "14:20", "15:10", "16:00", "16:50").
   - VERY IMPORTANT: College afternoon hours starting with 1, 2, 3, 4, 5, 6 MUST be converted to PM (e.g. 1:40 -> "13:40", 2:20 -> "14:20", 3:10 -> "15:10", 4:00 -> "16:00", 4:50 -> "16:50").
3. Multi-period Labs/Practicals: When a lab or practical (e.g. "SE(P)", "CN(P)", "DSC(P)", "Lab") spans 2 or more consecutive period slots (e.g. Period 9 at 03:10-04:00 and Period 10 at 04:00-04:50), merge them into a single entry from the start of the first period to the end of the last period (e.g. "15:10" to "16:50").
4. Parallel Elective Subjects: If a time slot has multiple elective subjects listed (e.g. "AT", "NO SQL", "CC"), extract EACH elective subject as its own separate class in the list so the student can easily tap ✕ to delete the ones they aren't taking.
5. Rooms: Extract room or lab codes (e.g. "V124", "LV303", "Room 201") into the "room" field. Remove room codes from the subject name.
6. Clean Subject Names: Remove teacher initials (e.g. "(MPC)", "[ASH]") and batch tags (e.g. "5CSE-O") from the subject name.
7. Exclude: Strictly skip non-class slots like "LUNCH", "RECESS", "BREAK", "Activities", "Sports", "Library", "Mentor", or empty cells.

Return a JSON object strictly matching this schema:
{
  "schedule": [
    {
      "day": "Monday",
      "subject": "Computer Networks (CN)",
      "startTime": "12:00",
      "endTime": "12:50",
      "room": "V124"
    }
  ]
}`;

      // Candidates in priority order
      const modelsToTry = [
        { ver: 'v1beta', model: 'gemini-2.0-flash' },
        { ver: 'v1beta', model: 'gemini-1.5-flash-latest' },
        { ver: 'v1', model: 'gemini-1.5-flash' },
        { ver: 'v1beta', model: 'gemini-2.0-flash-exp' }
      ];

      let extractedSchedule = null;
      let lastErrorMessage = '';

      for (const { ver, model } of modelsToTry) {
        try {
          const url = `https://generativelanguage.googleapis.com/${ver}/models/${model}:generateContent?key=${encodeURIComponent(apiKey.trim())}`;
          const geminiRes = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [
                  { text: SYSTEM_PROMPT },
                  {
                    inlineData: {
                      mimeType: mimeType || 'image/jpeg',
                      data: imageBase64
                    }
                  }
                ]
              }],
              generationConfig: {
                temperature: 0.1,
                responseMimeType: 'application/json'
              }
            })
          });

          if (!geminiRes.ok) {
            const errJson = await geminiRes.json().catch(() => ({}));
            lastErrorMessage = errJson.error?.message || `${geminiRes.status} ${geminiRes.statusText}`;
            continue;
          }

          const geminiData = await geminiRes.json();
          let rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
          if (rawText.startsWith('```')) {
            rawText = rawText.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
          }

          const parsed = JSON.parse(rawText);
          if (parsed && Array.isArray(parsed.schedule)) {
            extractedSchedule = parsed.schedule;
            break;
          }
        } catch (e) {
          lastErrorMessage = e.message;
        }
      }

      if (!extractedSchedule) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: lastErrorMessage || 'AI could not read any classes from this timetable.' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ success: true, schedule: extractedSchedule }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (err) {
      return new Response(JSON.stringify({ success: false, error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};
