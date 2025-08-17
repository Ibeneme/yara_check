import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Verify the requesting user is a super admin
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Check if user is super admin
    const { data: profile, error: profileCheckError } = await supabaseAdmin
      .from('profiles')
      .select('role, admin_role')
      .eq('id', user.id)
      .single()

    if (profileCheckError || !profile || profile.role !== 'super_admin') {
      throw new Error('Insufficient permissions')
    }

    const { 
      email, 
      firstName, 
      lastName, 
      phone, 
      adminRole, 
      countryId, 
      provinceId,
      geographicAccess 
    } = await req.json()

    // Generate temporary password
    const { data: tempPassword, error: passwordError } = await supabaseAdmin.rpc('generate_secure_temp_password')
    if (passwordError) throw passwordError

    // Create user in auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
      }
    })

    if (authError || !authData.user) {
      throw new Error(`Failed to create user account: ${authError?.message}`)
    }

    // Prepare geographic access data
    const geographicAccessData = {
      view_all_countries: geographicAccess.viewAllCountries,
      allowed_countries: geographicAccess.allowedCountries,
      allowed_provinces: geographicAccess.allowedProvinces,
    }

    // Create profile
    const profileData = {
      id: authData.user.id,
      email: email.toLowerCase().trim(),
      first_name: firstName,
      last_name: lastName,
      phone: phone || null,
      role: 'admin' as const,
      admin_role: adminRole as any,
      country_id: countryId || null,
      province_id: provinceId || null,
      must_change_password: true,
      geographic_access: geographicAccessData,
      is_active: true,
    }

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert(profileData)

    if (profileError) {
      // Cleanup auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      throw new Error(`Failed to create admin profile: ${profileError.message}`)
    }

    // Log admin action
    try {
      await supabaseAdmin.rpc('log_admin_action', {
        action_text: 'Created new admin account',
        action_details: { 
          admin_email: email, 
          admin_role: adminRole,
          geographic_access: geographicAccessData 
        },
      })
    } catch (logError) {
      console.warn('Failed to log admin action:', logError)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        tempPassword, 
        email: email.toLowerCase().trim() 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error creating admin user:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})