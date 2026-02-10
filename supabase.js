/ 1. PROJECT CONFIGURATION
// Be careful: URL must start with https:// and end in .supabase.co
const SB_URL = 'https://lkgqzieviqtrsoeffbnq.supabase.co'; 
const SB_KEY = 'sb_publishable_so26fUecpMp_T3vyzJJnXQ_T0wEkOyU';

// 2. INITIALIZE CLIENT (The CDN Method)
// We use window.supabase because the CDN script creates a global 'supabase' object
const { createClient } = window.supabase;
const supabase = createClient(SB_URL, SB_KEY);

// --- AUTH HELPERS ---
async function signUp(email, password, fullName) {
    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: { full_name: fullName }
        }
    });
    return { data, error };
}

async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });
    return { data, error };
}

async function signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
}

// --- DATA HELPERS ---
async function fetchCourses() {
    // IMPORTANT: Make sure you have a table named 'courses' in Supabase
    const { data, error } = await supabase.from('courses').select('*');
    return { data, error };
}

async function fetchEnrollments() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [], error: 'Not logged in' };

    const { data, error } = await supabase
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not logged in' };

    const { data, error } = await supabase
        .from('enrollments')
        .insert([{ user_id: user.id, course_id: courseId }]);

    return { data, error };
}

async function checkEnrollment(courseId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
        .from('enrollments')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .maybeSingle(); // maybeSingle is safer than .single() if no data exists

    return !!data; 
}
