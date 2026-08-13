import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to manually parse .env if process.env values aren't populated
function loadEnv() {
  const envPaths = [
    path.join(__dirname, '.env'),
    path.join(__dirname, 'pos-service-repo', '.env'),
    path.join(__dirname, '..', '.env')
  ];

  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      const lines = envContent.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const [key, ...valueParts] = trimmed.split('=');
          const val = valueParts.join('=').trim();
          if (!process.env[key.trim()]) {
            process.env[key.trim()] = val;
          }
        }
      }
    }
  }
}

loadEnv();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = 
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 
  process.env.SUPABASE_PUBLISHABLE_KEY || 
  process.env.VITE_SUPABASE_ANON_KEY || 
  process.env.SUPABASE_ANON_KEY;

console.log('--------------------------------------------------');
console.log('  🔍 SUPABASE CONNECTION TEST');
console.log('--------------------------------------------------');

if (!supabaseUrl || supabaseUrl.includes('your-project-ref')) {
  console.error('❌ ERROR: Supabase URL is missing or set to placeholder!');
  console.error('   Please edit .env file and set VITE_SUPABASE_URL with your actual Supabase URL.');
  process.exit(1);
}

if (!supabaseKey || supabaseKey.includes('your-anon-public-key-here')) {
  console.error('❌ ERROR: Supabase Anon/Publishable Key is missing or set to placeholder!');
  console.error('   Please edit .env file and set VITE_SUPABASE_PUBLISHABLE_KEY or VITE_SUPABASE_ANON_KEY.');
  process.exit(1);
}

console.log(`📡 Target Supabase URL: ${supabaseUrl}`);
console.log(`🔑 Using Key Prefix: ${supabaseKey.substring(0, 15)}...`);

async function testConnection() {
  try {
    // 1. Ping REST API root or items table endpoint
    const restEndpoint = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/items?select=*&limit=5`;
    
    console.log(`⏳ Sending test query to endpoint: /rest/v1/items...`);

    const response = await fetch(restEndpoint, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ SUCCESS: Connected to Supabase REST API successfully!');
      console.log(`📊 Response from 'items' table:`, data);
      console.log('--------------------------------------------------');
      console.log('🎉 Supabase connection is VERIFIED and active!');
    } else {
      const errorText = await response.text();
      console.log('--------------------------------------------------');
      console.error(`⚠️ HTTP Status ${response.status}: ${response.statusText}`);
      console.error(`📄 Details: ${errorText}`);
      
      if (response.status === 401 || response.status === 403) {
        console.error('💡 Diagnosis: Authentication failed. Please check your publishable / anon key.');
      } else if (response.status === 404 || errorText.includes('relation "public.items" does not exist')) {
        console.log('✅ Connected to Supabase project successfully!');
        console.log('💡 Note: The "items" table has not been created yet in your Supabase project.');
        console.log('👉 Next Step: Open Supabase SQL Editor and run the SQL code from "supabase/schema.sql" to create the tables.');
      }
    }
  } catch (err) {
    console.error('❌ Network Connection Failed!');
    console.error(`   Error Message: ${err.message}`);
    console.error('💡 Diagnosis: Check your internet connection or verify the VITE_SUPABASE_URL.');
  }
}

testConnection();
