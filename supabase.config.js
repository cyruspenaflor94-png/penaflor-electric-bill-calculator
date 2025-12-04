// Supabase Configuration
// Update YOUR_SUPABASE_ANON_KEY with your actual key from: https://fidhdpftqdfqkxhxrutu.supabase.co
const supabaseUrl = "https://fidhdpftqdfqkxhxrutu.supabase.co";
const supabaseKey = "sb_publishable_TiIZelPx05ZlHaisB1TcAg_fi4KxVe-"; // Your actual anon key

// Create Supabase client - requires Supabase CDN to be loaded in HTML
let supabaseClient = null;

// Initialize Supabase client after page loads
function initializeSupabase() {
    if (typeof supabase === 'undefined') {
        console.error('Supabase library not loaded. Make sure to include the CDN script in HTML.');
        return false;
    }
    const { createClient } = supabase;
    supabaseClient = createClient(supabaseUrl, supabaseKey);
    return true;
}

// Authentication helper functions
async function checkAuth() {
    if (!supabaseClient) initializeSupabase();
    
    const {
        data: { session },
        error,
    } = await supabaseClient.auth.getSession();
    
    if (error) {
        console.error("Error checking auth:", error);
        return null;
    }
    return session;
}

async function getCurrentUser() {
    if (!supabaseClient) initializeSupabase();
    
    const {
        data: { user },
        error,
    } = await supabaseClient.auth.getUser();
    
    if (error) {
        console.error("Error getting user:", error);
        return null;
    }
    return user;
}

async function signUp(email, password, fullName) {
    if (!supabaseClient) initializeSupabase();
    
    try {
        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: fullName,
                }
            }
        });

        if (error) {
            console.error("Signup error:", error.message);
            return { success: false, error: error.message };
        }

        return { success: true, user: data.user };
    } catch (err) {
        console.error("Unexpected error during signup:", err);
        return { success: false, error: err.message };
    }
}

async function signIn(email, password) {
    if (!supabaseClient) initializeSupabase();
    
    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            console.error("Login error:", error.message);
            return { success: false, error: error.message };
        }

        return { success: true, user: data.user };
    } catch (err) {
        console.error("Unexpected error during login:", err);
        return { success: false, error: err.message };
    }
}

async function signOut() {
    if (!supabaseClient) initializeSupabase();
    
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
        console.error("Error signing out:", error);
        return false;
    }
    return true;
}

// Redirect to login if not authenticated
async function requireAuth() {
    const user = await getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Save calculation to database
async function saveCalculation(hours, power, costPerKwh, totalCost) {
    if (!supabaseClient) initializeSupabase();
    
    const user = await getCurrentUser();
    if (!user) {
        alert("You must be logged in to save calculations");
        return false;
    }

    try {
        const { data, error } = await supabaseClient
            .from('calculations')
            .insert([
                {
                    user_id: user.id,
                    hours: parseFloat(hours),
                    power: parseFloat(power),
                    cost_per_kwh: parseFloat(costPerKwh),
                    total_cost: parseFloat(totalCost),
                }
            ]);

        if (error) {
            console.error("Error saving calculation:", error.message);
            return false;
        }

        return true;
    } catch (err) {
        console.error("Unexpected error saving calculation:", err);
        return false;
    }
}

// Fetch user's calculations from database
async function fetchCalculations() {
    if (!supabaseClient) initializeSupabase();
    
    const user = await getCurrentUser();
    if (!user) {
        return [];
    }

    try {
        const { data, error } = await supabaseClient
            .from('calculations')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching calculations:", error.message);
            return [];
        }

        return data || [];
    } catch (err) {
        console.error("Unexpected error fetching calculations:", err);
        return [];
    }
}