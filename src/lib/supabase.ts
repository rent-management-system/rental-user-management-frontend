import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://spdwbxirjclmafdwzkvu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwZHdieGlyamNsbWFmZHd6a3Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNDk5NTcsImV4cCI6MjA3NjcyNTk1N30.lcoi0iksJ18jMOYZXmPyNDEFiIhNmIzv9-yiSuEHXL4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
