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
      let listErr = null;
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await res.json();
        if (data.models) {
          modelList = data.models
            .filter(m => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent'))
            .map(m => m.name.replace(/^models\//, ''));
        } else {
          listErr = data.error || data;
        }
      } catch (e) {
        listErr = e.message;
      }

      return new Response(JSON.stringify({ 
        status: 'online', 
        service: 'Attendance Timetable Scanner',
        key_configured: Boolean(apiKey),
        content_models: modelList,
        list_error: listErr
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

      const SYSTEM_PROMPT = `You are an expert college timetable schedule extractor.
Your job is to examine the provided timetable image and extract ALL classes into a clean weekly schedule.

CANONICAL COLLEGE PERIOD TIMINGS:
- Period I: "08:30" to "09:20"
- Period II: "09:20" to "10:10"
- Break: "10:10" to "10:20"
- Period III: "10:20" to "11:10"
- Period IV: "11:10" to "12:00"
- Period V: "12:00" to "12:50"
- Lunch Break: "12:50" to "13:40"
- Period VII: "13:40" to "14:20"
- Period VIII: "14:20" to "15:10"
- Period IX: "15:10" to "16:00"
- Period X: "16:00" to "16:50"
- Combined Lab (Periods IX & X): "15:10" to "16:50"
- Combined Lab (Periods III & IV): "10:20" to "12:00"

CRITICAL EXTRACTION RULES:
1. CLEAN PURE SUBJECT NAMES (No Clutter):
   - The "subject" field MUST contain ONLY the standardized subject name or code (e.g. "Computer Networks", "Software Engineering", "AI", "NO SQL", "CC", "Data Science", "Embedded Systems", "IoT", "PE", "BCA", "SS-III", "FMEA").
   - Strictly STRIP OUT and REMOVE:
     * Batch and Section codes: e.g. "5CSE-O", "5CSE-O1", "5CSE-O2", "5CSE O+P", "5CSE M+N+O+P", "CSE-O", "O1", "O2", etc.
     * Teacher / Faculty initials: e.g. "(MPC)", "[ASH]", "(KJ)", "(SY)", "(M3)", "[AJK]", "(AG)", "(DIS)", "(ABJ)", "[SSF3]", "[NF13]", "[AC]", "[LJ]", "[NIB]".
     * Room numbers: e.g. "[V124]", "[LV303]", "[V026]", "[LV203]". Put room numbers in the "room" field, NOT in the subject name.
   - Example Bad: "CN 5CSE-O (MPC) [V124]" -> Example Good: subject: "Computer Networks", room: "V124"
   - Example Bad: "SE 5CSE-O [ASH] [V124]" -> Example Good: subject: "Software Engineering", room: "V124"

2. PRACTICAL / LAB CLASSES WITH (P):
   - Any class with "(P)", "[P]", "(Lab)", or "Lab" in its cell (e.g. "SE(P)", "CN(P)", "DSC(P)", "IOT(P)", "AI(P)", "NO SQL(P)", "CC(P)", "ES(P)"):
     * It is a PRACTICAL LAB class.
     * It MUST end with " (P)" in the subject name (e.g. "Software Engineering (P)" or "Computer Networks (P)") so attendance is tracked separately from theory lectures.
     * Practicals in college always span 2 consecutive periods (e.g. Period IX & X: 15:10 to 16:50, or Period III & IV: 10:20 to 12:00).
     * COMBINE the 2 periods into a SINGLE entry from the start of the first period to the end of the second period (e.g. startTime: "15:10", endTime: "16:50", or startTime: "10:20", endTime: "12:00"). Do NOT split a practical lab into two separate 50-minute entries!

3. THEORY LECTURES (WITHOUT (P)):
   - Any class without "(P)" is a regular Theory lecture. Do NOT add "(P)" to theory lectures.

4. STRICT 24-HOUR TIME FORMAT (HH:MM) - NO 12-HOUR MISTAKES:
   - "startTime" and "endTime" must be 24-hour HH:MM strings.
   - Hours 1, 2, 3, 4, 5, 6 after 12:00 noon MUST be converted to PM:
     * 1:40 -> "13:40", 2:20 -> "14:20", 3:10 -> "15:10", 4:00 -> "16:00", 4:50 -> "16:50"
   - NEVER output "01:40" or "02:20" or "03:10" for afternoon classes.

5. PARALLEL ELECTIVES & LAB BATCHES:
   - If a cell has multiple elective options (e.g. AI vs NO SQL vs CC) or multiple lab batches (e.g. SE(P) in LV303 vs CN(P) in LV203), list EACH option as a separate entry with the same time slot so the app can ask the student which elective and lab they attend!

6. EXCLUDE NON-CLASS SLOTS:
   - Skip "LUNCH", "BREAK", "RECESS", "Activities", "Sports", "Library", "Mentor", or empty slots.

Return pure JSON matching this schema:
{
  "schedule": [
    {
      "day": "Monday",
      "subject": "NO SQL",
      "startTime": "11:10",
      "endTime": "12:00",
      "room": "V026"
    },
    {
      "day": "Monday",
      "subject": "Software Engineering (P)",
      "startTime": "15:10",
      "endTime": "16:50",
      "room": "LV303"
    }
  ]
}`;

      // 1. Discover models directly from Google that support generateContent
      let modelsToTry = [];
      try {
        const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        if (listRes.ok) {
          const listJson = await listRes.json();
          const valid = (listJson.models || []).filter(m => 
            Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent')
          );
          modelsToTry = valid.map(m => m.name.replace(/^models\//, ''));
        }
      } catch (_) {}

      // Sort: Put flash models first for maximum speed
      modelsToTry.sort((a, b) => {
        const aFlash = a.includes('flash') ? 0 : 1;
        const bFlash = b.includes('flash') ? 0 : 1;
        return aFlash - bFlash;
      });

      if (modelsToTry.length === 0) {
        modelsToTry = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-2.0-flash'];
      }

      const attemptErrors = [];

      for (const model of modelsToTry) {
        try {
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
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
            const errMsg = errJson.error?.message || `${res.status} ${res.statusText}`;
            attemptErrors.push(`[${model}] ${errMsg}`);
            continue;
          }

          const data = await res.json();
          let text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
          if (text.startsWith('```')) {
            text = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
          }

          const parsed = JSON.parse(text);
          if (parsed && Array.isArray(parsed.schedule) && parsed.schedule.length > 0) {
            return new Response(JSON.stringify({ 
              success: true, 
              usedModel: model, 
              schedule: parsed.schedule 
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }
        } catch (e) {
          attemptErrors.push(`[${model}] ${e.message}`);
        }
      }

      return new Response(JSON.stringify({ 
        success: false, 
        error: attemptErrors.join(' | ') || 'Could not extract classes from image.' 
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
