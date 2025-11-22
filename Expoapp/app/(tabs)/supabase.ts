// supabase.ts
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vehvlnzoqpfxxjiwjaog.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlaHZsbnpvcXBmeHhqaXdqYW9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MjE4OTcsImV4cCI6MjA3ODE5Nzg5N30.dWZYcCRofQr_cRVfY6hruLs3tk81D3pRG9btNotQGyc'; // from Project Settings -> API

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabase;
