
// Initialize Supabase Client
// REPLACE with your actual Supabase URL and Logic
const SUPABASE_URL = 'sb_publishable_so26fUecpMp_T3vyzJJnXQ_T0wEkOyU';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxrZ3F6aWV2aXF0cnNvZWZmYm5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2Mzc0NDMsImV4cCI6MjA4NjIxMzQ0M30.GCRZALURGsMl3mX94JpCV7v-zr2Yl70zzLBWK_-JmH8';

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Auth Helpers
async function signUp(email, password, fullName) {
    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                full_name: fullName
            }
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

// Data Helpers
async function fetchCourses() {
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

    // Flatten structure for easier consumption
    const courses = data ? data.map(e => e.course) : [];
    return { data: courses, error };
}

async function enrollUser(courseId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not logged in' };

    const { data, error } = await supabase
        .from('enrollments')
        .insert([
            { user_id: user.id, course_id: courseId }
        ]);

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
        .single();

    return !!data; // True if enrollment exists
}

