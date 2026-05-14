import { supabase } from "./supabase";

// Profiles
export async function getProfile(userId) {
  return supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
}

export async function listClients(trainerId) {
  return supabase
    .from("profiles")
    .select("*")
    .eq("trainer_id", trainerId)
    .eq("role", "client")
    .order("full_name");
}

// Client notes
export async function getClientNotes(trainerId, clientId) {
  return supabase
    .from("client_notes")
    .select("*")
    .eq("trainer_id", trainerId)
    .eq("client_id", clientId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
}

export async function upsertClientNotes(trainerId, clientId, content, existingId) {
  if (existingId) {
    return supabase
      .from("client_notes")
      .update({ content, updated_at: new Date().toISOString() })
      .eq("id", existingId)
      .select()
      .single();
  }
  return supabase
    .from("client_notes")
    .insert({ trainer_id: trainerId, client_id: clientId, content })
    .select()
    .single();
}

// Schedule
export async function getSchedule(clientId) {
  return supabase
    .from("training_schedule")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at");
}

export async function addScheduleEntry(entry) {
  return supabase.from("training_schedule").insert(entry).select().single();
}

export async function deleteScheduleEntry(id) {
  return supabase.from("training_schedule").delete().eq("id", id);
}

// Programs
export async function listPrograms(trainerId, { templatesOnly = false } = {}) {
  let q = supabase.from("programs").select("*").eq("trainer_id", trainerId).order("created_at", { ascending: false });
  if (templatesOnly) q = q.eq("is_template", true);
  return q;
}

export async function getProgram(programId) {
  return supabase.from("programs").select("*").eq("id", programId).maybeSingle();
}

export async function createProgram(program) {
  return supabase.from("programs").insert(program).select().single();
}

export async function updateProgram(id, fields) {
  return supabase.from("programs").update(fields).eq("id", id).select().single();
}

export async function deleteProgram(id) {
  return supabase.from("programs").delete().eq("id", id);
}

// Program exercises
export async function listProgramExercises(programId) {
  return supabase
    .from("program_exercises")
    .select("*")
    .eq("program_id", programId)
    .order("order_index");
}

export async function addProgramExercise(row) {
  return supabase.from("program_exercises").insert(row).select().single();
}

export async function updateProgramExercise(id, fields) {
  return supabase.from("program_exercises").update(fields).eq("id", id).select().single();
}

export async function deleteProgramExercise(id) {
  return supabase.from("program_exercises").delete().eq("id", id);
}

// Client programs (assignments)
export async function listClientPrograms(clientId) {
  return supabase
    .from("client_programs")
    .select("id, assigned_at, program:programs(*)")
    .eq("client_id", clientId)
    .order("assigned_at", { ascending: false });
}

export async function assignProgram(clientId, programId) {
  return supabase
    .from("client_programs")
    .insert({ client_id: clientId, program_id: programId })
    .select()
    .single();
}

export async function unassignProgram(id) {
  return supabase.from("client_programs").delete().eq("id", id);
}

// Invites
export async function createInvite(email, trainerId) {
  return supabase
    .from("invites")
    .insert({ email, trainer_id: trainerId })
    .select()
    .single();
}

export async function getInviteByToken(token) {
  return supabase.from("invites").select("*").eq("token", token).maybeSingle();
}

export async function markInviteUsed(id) {
  return supabase.from("invites").update({ used: true }).eq("id", id);
}

// Sessions
export async function listSessions(clientId, { limit = 100 } = {}) {
  return supabase
    .from("sessions")
    .select("*")
    .eq("client_id", clientId)
    .order("date", { ascending: false })
    .limit(limit);
}

export async function getSession(id) {
  return supabase.from("sessions").select("*").eq("id", id).maybeSingle();
}

export async function createSession(row) {
  return supabase.from("sessions").insert(row).select().single();
}

export async function updateSession(id, fields) {
  return supabase.from("sessions").update(fields).eq("id", id).select().single();
}

export async function deleteSession(id) {
  return supabase.from("sessions").delete().eq("id", id);
}

// Session sets
export async function listSessionSets(sessionId) {
  return supabase
    .from("session_sets")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at");
}

export async function bulkInsertSets(rows) {
  return supabase.from("session_sets").insert(rows).select();
}

// Body metrics
export async function listMetrics(clientId) {
  return supabase
    .from("body_metrics")
    .select("*")
    .eq("client_id", clientId)
    .order("date", { ascending: false });
}

export async function addMetric(row) {
  return supabase.from("body_metrics").insert(row).select().single();
}

export async function deleteMetric(id) {
  return supabase.from("body_metrics").delete().eq("id", id);
}

// Aggregate helpers
export async function getClientStats(clientId) {
  const { data: sessions } = await supabase
    .from("sessions")
    .select("id, date, total_volume")
    .eq("client_id", clientId);
  const totalSessions = sessions?.length || 0;
  const totalVolume = (sessions || []).reduce((s, x) => s + Number(x.total_volume || 0), 0);
  const lastDate = sessions?.length
    ? sessions.map((s) => s.date).sort().reverse()[0]
    : null;
  return { totalSessions, totalVolume, lastDate };
}
