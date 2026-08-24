import { supabase } from "./supabaseClient";

/* ---------------- auth ---------------- */

export async function signUp({ email, password, realName, username }) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;

  const userId = data.user?.id;
  if (!userId) throw new Error("Sign-up didn't return a user — check your email to confirm, then log in.");

  const { error: profileErr } = await supabase.from("profiles").insert({
    id: userId,
    username: username.trim(),
    real_name: realName.trim(),
    role: "unset",
  });
  if (profileErr) {
    if (profileErr.code === "23505") throw new Error("That username is taken.");
    throw profileErr;
  }

  return data.user;
}

export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error("Email or password doesn't match anything on file.");
  return data.user;
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export function onAuthChange(callback) {
  const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => callback(session));
  return () => sub.subscription.unsubscribe();
}

/* ---------------- profiles ---------------- */

export async function getMyProfile(userId) {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
  if (error) throw error;
  return data;
}

export async function listProfiles() {
  const { data, error } = await supabase.from("profiles").select("*");
  if (error) throw error;
  return data;
}

export async function updateProfile(userId, patch) {
  const { error } = await supabase.from("profiles").update(patch).eq("id", userId);
  if (error) throw error;
}

export async function setRole(userId, role) {
  const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);
  if (error) throw error;
}

/* ---------------- avatar / banner uploads ---------------- */

export async function uploadAvatar(userId, file) {
  const path = `${userId}/avatar-${Date.now()}.${file.name.split(".").pop()}`;
  const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadStoryImage(userId, blob) {
  const path = `${userId}/story-${Date.now()}.png`;
  const { error } = await supabase.storage.from("stories").upload(path, blob, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from("stories").getPublicUrl(path);
  return data.publicUrl;
}

/* ---------------- connections / message requests ---------------- */

export async function sendMessageRequest(fromId, toId) {
  const { error } = await supabase.from("message_requests").insert({ from_id: fromId, to_id: toId });
  if (error && error.code !== "23505") throw error; // ignore duplicate request
}

export async function listIncomingRequests(myId) {
  const { data, error } = await supabase
    .from("message_requests")
    .select("*, from_profile:profiles!message_requests_from_id_fkey(username, real_name, pfp_url)")
    .eq("to_id", myId)
    .eq("status", "pending");
  if (error) throw error;
  return data;
}

export async function acceptMessageRequest(requestId, fromId, toId) {
  const [a, b] = fromId < toId ? [fromId, toId] : [toId, fromId];
  const { error: connErr } = await supabase.from("connections").insert({ user_a: a, user_b: b });
  if (connErr && connErr.code !== "23505") throw connErr;

  const { error: reqErr } = await supabase
    .from("message_requests")
    .update({ status: "accepted" })
    .eq("id", requestId);
  if (reqErr) throw reqErr;
}

export async function listMyConnections(myId) {
  const { data, error } = await supabase
    .from("connections")
    .select("user_a, user_b")
    .or(`user_a.eq.${myId},user_b.eq.${myId}`);
  if (error) throw error;
  return data.map((row) => (row.user_a === myId ? row.user_b : row.user_a));
}

/* ---------------- messages ---------------- */

export async function fetchThread(myId, otherId) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .or(
      `and(from_id.eq.${myId},to_id.eq.${otherId}),and(from_id.eq.${otherId},to_id.eq.${myId})`
    )
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

export async function sendMessage(fromId, toId, text) {
  const { error } = await supabase.from("messages").insert({ from_id: fromId, to_id: toId, text });
  if (error) throw error;
}

export function subscribeToThread(myId, otherId, onInsert) {
  const channel = supabase
    .channel(`thread-${[myId, otherId].sort().join("-")}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages" },
      (payload) => {
        const m = payload.new;
        const involved =
          (m.from_id === myId && m.to_id === otherId) || (m.from_id === otherId && m.to_id === myId);
        if (involved) onInsert(m);
      }
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
}

/* ---------------- stories ---------------- */

export async function listStories() {
  const { data, error } = await supabase
    .from("stories")
    .select("*, profiles(username, pfp_url)")
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function postStory(ownerId, imageUrl) {
  const { error } = await supabase.from("stories").insert({ owner_id: ownerId, image_url: imageUrl });
  if (error) throw error;
}

/* ---------------- announcements ---------------- */

export async function listAnnouncements() {
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data;
}

export async function postAnnouncement(text, kind = "info") {
  const { error } = await supabase.from("announcements").insert({ text, kind });
  if (error) throw error;
}

export function subscribeToAnnouncements(onInsert) {
  const channel = supabase
    .channel("announcements-feed")
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "announcements" }, (payload) =>
      onInsert(payload.new)
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
}

/* ---------------- reports ---------------- */

export async function listReports() {
  const { data, error } = await supabase
    .from("reports")
    .select("*, profiles(username)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function fileReport(fromId, issue, summary) {
  const { error } = await supabase.from("reports").insert({ from_id: fromId, issue, summary });
  if (error) throw error;
}

/* ---------------- suggestions ---------------- */

export async function listSuggestions() {
  const { data, error } = await supabase
    .from("suggestions")
    .select("*, profiles(username)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function postSuggestion(fromId, text) {
  const { error } = await supabase.from("suggestions").insert({ from_id: fromId, text });
  if (error) throw error;
}
