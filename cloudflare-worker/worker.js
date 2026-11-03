export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

    const apiKey = (env.GEMINI_API_KEY || '').trim();

    if (request.method === 'GET') {
      let modelList = [];
      let listError = null;
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await res.json();
        if (data.models) {
          modelList = data.models.map(m => m.name);
        } else {
          listError = data.error || data;
        }
      } catch (e) {
        listError = e.message;
      }

      return new Response(JSON.stringify({ 
        status: 'online', 
        service: 'Attendance Timetable Scanner',
        key_configured: Boolean(apiKey),
        available_models: modelList,
        list_error: listError
      }, null, 2), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    try {
      if (!apiKey) {
        return new Response(JSON.stringify({ error: 'GEMINI_API_KEY secret is not set in Cloudflare.' }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const { imageBase64, mimeType } = await request.json().catch(() => ({}));
      if (!imageBase64) {
        return new Response(JSON.stringify({ error: 'Missing imageBase64 payload.' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const SYSTEM_PROMPT = `You are an expert college timetable extractor. Examine the timetable photo and extract ALL classes into a weekly schedule.
Rules:
1. Day: One of "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday".
2. Times: Strict 24-hr HH:MM (e.g. "11:10","12:00","13:40","14:20","15:10","16:00","16:50"). Hours 1, 2, 3, 4, 5, 6 after noon MUST be PM (1:40->13:40, 3:10->15:10).
3. Multi-period Labs: Merge consecutive practicals (e.g. 03:10-04:00 and 04:00-04:50 -> 15:10 to 16:50).
4. Parallel Electives: Extract each elective as an individual entry.
5. Rooms: Put room in "room" field (e.g. "V124","LV303").
6. Exclude: Skip "LUNCH","BREAK","Activities","Sports".
Return JSON strictly matching this schema:
{ "schedule": [ { "day": "Monday", "subject": "Computer Networks (CN)", "startTime": "12:00", "endTime": "12:50", "room": "V124" } ] }`;

      // 1. Discover models directly from Google
      let modelsToTry = [];
      try {
        const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        if (listRes.ok) {
          const listJson = await listRes.json();
          const valid = (listJson.models || []).filter(m => 
            Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent')
          );
          modelsToTry = valid.map(m => m.name);
        }
      } catch (_) {}

      // Fallbacks if list failed
      if (modelsToTry.length === 0) {
        modelsToTry = [
          'models/gemini-2.0-flash',
          'models/gemini-1.5-flash-latest',
          'models/gemini-1.5-flash-8b',
          'models/gemini-1.5-pro-latest'
        ];
      }

      // Prioritize flash models
      modelsToTry.sort((a, b) => {
        const aFlash = a.includes('flash') ? 0 : 1;
        const bFlash = b.includes('flash') ? 0 : 1;
        return aFlash - bFlash;
      });

      let lastErrorDetail = '';

      for (const fullModelName of modelsToTry) {
        const cleanModel = fullModelName.replace(/^models\//, '');
        try {
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [
                  { text: SYSTEM_PROMPT },
                  { inlineData: { mimeType: mimeType || 'image/jpeg', data: imageBase64 } }
                ]
              }],
              generationConfig: {
                temperature: 0.1,
                responseMimeType: 'application/json'
              }
            })
          });

          if (!res.ok) {
            const errJson = await res.json().catch(() => ({}));
            lastErrorDetail = errJson.error?.message || `${res.status} ${res.statusText}`;
            continue;
          }

          const data = await res.json();
          let text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
          if (text.startsWith('```')) {
            text = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
          }

          const parsed = JSON.parse(text);
          if (parsed && Array.isArray(parsed.schedule) && parsed.schedule.length > 0) {
            return new Response(JSON.stringify({ success: true, schedule: parsed.schedule }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }
        } catch (e) {
          lastErrorDetail = e.message;
        }
      }

      return new Response(JSON.stringify({ 
        success: false, 
        error: lastErrorDetail || 'Could not extract classes from image.' 
      }), {
        status: 400,
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
