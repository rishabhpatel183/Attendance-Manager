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
      return new Response(JSON.stringify({ 
        status: 'online', 
        service: 'Attendance Timetable Scanner',
        key_configured: Boolean(apiKey)
      }), {
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

CRITICAL EXTRACTION RULES:
1. CLEAN PURE SUBJECT NAMES (No Clutter):
   - The "subject" field MUST contain ONLY the standardized subject name.
   - Strictly STRIP OUT and REMOVE:
     * Batch and Section codes: e.g. "5CSE-O", "5CSE-O1", "5CSE-O2", "5CSE O+P", "5CSE M+N+O+P", "CSE-O", "O1", "O2", "Batch 1", etc.
     * Teacher / Faculty initials: e.g. "(MPC)", "[ASH]", "(KJ)", "(SY)", "(M3)", "[AJK]", "(AG)", "(DIS)", "(ABJ)", "[SSF3]".
     * Room numbers: e.g. "[V124]", "[LV303]", "[V026]", "Room 101". Put room numbers in the "room" field, NOT in the subject name.
   - Example Bad: "CN 5CSE-O (MPC) [V124]" -> Example Good: subject: "Computer Networks (CN)", room: "V124"
   - Example Bad: "SE 5CSE-O [ASH] [V124]" -> Example Good: subject: "Software Engineering (SE)", room: "V124"

2. PRACTICAL / LAB CLASSES WITH (P):
   - Any class with "(P)", "[P]", "(Lab)", or "Lab" in its cell (e.g. "SE(P)", "CN(P)", "DSC(P)", "IOT(P)", "AI(P)", "NO SQL(P)", "CC(P)", "ES(P)"):
     * It is a PRACTICAL LAB class.
     * It MUST have "(P)" in the subject name (e.g. "Software Engineering (P)" or "Computer Networks (P)") so it is tracked separately from theory lectures in attendance.
     * Practicals in college always span 2 consecutive periods (e.g. Period IX 03:10-04:00 and Period X 04:00-04:50, or Period III 10:20-11:10 and Period IV 11:10-12:00).
     * You MUST COMBINE the 2 periods into a SINGLE entry from the start time of the first period to the end time of the second period (e.g. startTime: "15:10", endTime: "16:50", or startTime: "10:20", endTime: "12:00"). Do NOT split a practical into two separate 50-minute entries!

3. THEORY LECTURES (WITHOUT (P)):
   - Any class without "(P)" is a regular Theory lecture (e.g. "Computer Networks (CN)", "Software Engineering (SE)").
   - Do NOT add "(P)" to theory lectures.

4. STRICT 24-HOUR TIME FORMAT (HH:MM):
   - "startTime" and "endTime" must be 24-hour HH:MM strings.
   - Hours 1, 2, 3, 4, 5, 6 after 12:00 noon MUST be converted to PM:
     * 1:40 -> "13:40"
     * 2:20 -> "14:20"
     * 3:10 -> "15:10"
     * 4:00 -> "16:00"
     * 4:50 -> "16:50"
   - Hours 8, 9, 10, 11 are AM ("08:30", "09:20", "10:20", "11:10"). 12 is "12:00" to "12:50".

5. PARALLEL ELECTIVES:
   - If a cell has multiple elective options (e.g. AT / NoSQL / CC), list each elective subject as a separate entry with the same time slot so the student can easily delete the ones they are not taking.

6. EXCLUDE NON-CLASS SLOTS:
   - Skip "LUNCH", "BREAK", "RECESS", "Activities", "Sports", "Library", "Mentor", or empty slots.

Return pure JSON matching this schema:
{
  "schedule": [
    {
      "day": "Monday",
      "subject": "Computer Networks (CN)",
      "startTime": "12:00",
      "endTime": "12:50",
      "room": "V124"
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

      // Fastest verified models in priority order
      const modelsToTry = [
        'gemini-2.5-flash',
        'gemini-flash-latest',
        'gemini-1.5-flash'
      ];

      let lastErrorDetail = '';

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
