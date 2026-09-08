const DEMO_TRANSCRIPT = "During today's product meeting, Rahul will prepare the market analysis by Friday. Priya will complete the presentation before Monday. The team will review the final materials on Tuesday. Arjun will prepare the technical roadmap by next Wednesday.";

function parseJson(content) {
  const clean = content.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
  return JSON.parse(clean);
}

function demoAnalysis(transcript) {
  const lower = transcript.toLowerCase();
  const tasks = [];
  if (lower.includes('rahul')) tasks.push({ title: 'Prepare market analysis', description: 'Prepare the agreed market analysis.', owner: 'Rahul', ownerEmail: null, deadline: '2026-09-12', priority: 'High' });
  if (lower.includes('priya')) tasks.push({ title: 'Complete presentation', description: 'Complete the presentation before the team review.', owner: 'Priya', ownerEmail: null, deadline: '2026-09-14', priority: 'Medium' });
  if (lower.includes('review')) tasks.push({ title: 'Final review', description: 'Review the final materials with the team.', owner: 'Team', ownerEmail: null, deadline: '2026-09-15', priority: 'High' });
  if (lower.includes('arjun')) tasks.push({ title: 'Prepare technical roadmap', description: 'Prepare the technical roadmap discussed in the meeting.', owner: 'Arjun', ownerEmail: null, deadline: '2026-09-16', priority: 'High' });
  return { summary: 'The team aligned on deliverables, owners, and a shared review point.', decisions: ['The final materials will be reviewed by the team.', 'Owners are responsible for completing their assigned deliverables.'], tasks, mode: 'demo' };
}

async function analyzeTranscript(transcript) {
  if (!process.env.AI_API_KEY) return demoAnalysis(transcript);
  const response = await fetch(process.env.AI_API_URL || 'https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.AI_API_KEY}` }, body: JSON.stringify({ model: process.env.AI_MODEL || 'gpt-4o-mini', temperature: 0.1, response_format: { type: 'json_object' }, messages: [{ role: 'system', content: 'You are MeetFlow AI, an exacting meeting operations assistant. Return only valid JSON with summary (string), decisions (array of strings), and tasks (array of objects with title, description, owner, ownerEmail, deadline in ISO format or null, priority as Low/Medium/High). Understand context, identify explicit commitments, owners, deadlines, and priority. Do not invent tasks or owners; use null when unavailable.' }, { role: 'user', content: `Analyze this meeting transcript:\n\n${transcript}` }] }) });
  if (!response.ok) throw new Error(`AI provider returned ${response.status}`);
  const payload = await response.json();
  const result = parseJson(payload.choices?.[0]?.message?.content || '');
  if (!result.summary || !Array.isArray(result.decisions) || !Array.isArray(result.tasks)) throw new Error('AI returned an invalid analysis format.');
  return { ...result, mode: 'live' };
}

module.exports = { analyzeTranscript, DEMO_TRANSCRIPT };
