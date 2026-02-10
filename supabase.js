// 1. PROJECT CONFIGURATION
const SB_URL = 'https:/lkgqzieviqtrsoeffbnq.supabase.co'; 
const SB_KEY = 'sb_publishable_so26fUecpMp_T3vyzJJnXQ_T0wEkOyU';

// 2. INITIALIZE CLIENT
// Use window.supabase from the CDN to create the client
const { createClient } = window.supabase;

// We name it _supabase and attach to window so script.js can use it
window.supabase = createClient(SB_URL, SB_KEY);
const _supabase = window.supabase; 

// --- AUTH HELPERS ---
async function signUp(email, password, fullName) {
    const { data, error } = await _supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: { full_name: fullName }
        }
    });
    return { data, error };
}

async function signIn(email, password) {
    const { data, error } = await _supabase.auth.signInWithPassword({
        email: email,
        password: password
    });
    return { data, error };
}

async function signOut() {
    const { error } = await _supabase.auth.signOut();
    return { error };
}

// --- DATA HELPERS ---
async function fetchCourses() {
    const { data, error } = await _supabase.from('courses').select('*');
    return { data, error };
}

async function fetchEnrollments() {
    const { data: { user } } = await _supabase.auth.getUser();
    if (!user) return { data: [], error: 'Not logged in' };

    const { data, error } = await _supabase
        .from('enrollments')
        .select(`
            *,
            course:courses(*)
        `)
        .eq('user_id', user.id);

    const courses = data ? data.map(e => e.course) : [];
    return { data: courses, error };
}

async function enrollUser(courseId) {
    const { data: { user } } = await _supabase.auth.getUser();
    if (!user) return { error: 'Not logged in' };

    const { data, error } = await _supabase
        .from('enrollments')
        .insert([{ user_id: user.id, course_id: courseId }]);

    return { data, error };
}

async function checkEnrollment(courseId) {
    const { data: { user } } = await _supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await _supabase
        .from('enrollments')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .maybeSingle(); 

    return !!data; 
}

