import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { 
  VehicleReport, 
  DeviceReport, 
  PersonReport, 
  Report 
} from "./storage";

// Helper function to handle errors
const handleError = (error: any) => {
  console.error("Database error:", error);
  toast({
    title: "Error",
    description: "There was a problem with the database operation",
    variant: "destructive",
  });
  return null;
};

// Helper function to upload image to storage
export const uploadImageToStorage = async (file: File, folder: string): Promise<string | null> => {
  try {
    console.log("uploadImageToStorage called with:", {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      folder: folder
    });
    
    const fileName = `${folder}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    console.log("Generated file path:", fileName);
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('reports')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (uploadError) {
      console.error('Image upload error:', uploadError);
      toast({
        title: "Upload failed",
        description: `Failed to upload image: ${uploadError.message}`,
        variant: "destructive",
      });
      return null;
    }
    
    console.log("Upload successful:", uploadData);
    
    const { data: urlData } = supabase.storage
      .from('reports')
      .getPublicUrl(fileName);
    
    console.log("Generated public URL:", urlData.publicUrl);
    return urlData.publicUrl;
  } catch (error) {
    console.error('Image upload error:', error);
    toast({
      title: "Upload failed",
      description: "An unexpected error occurred during upload.",
      variant: "destructive",
    });
    return null;
  }
};

// Vehicle reports
export const fetchVehicles = async (): Promise<VehicleReport[]> => {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*');

    if (error) throw error;
    
    // Convert DB format to app format
    return data.map(vehicle => ({
      id: vehicle.id,
      type: vehicle.type,
      chassis: vehicle.chassis,
      brand: vehicle.brand,
      model: vehicle.model,
      color: vehicle.color,
      year: vehicle.year.toString(),
      location: vehicle.location,
      description: vehicle.description || "",
      contact: vehicle.contact || "",
      reportDate: vehicle.report_date,
      status: vehicle.status as 'pending' | 'verified' | 'found',
      photoUrl: vehicle.image_url,
    }));
  } catch (error) {
    handleError(error);
    return [];
  }
};

export const saveVehicleToSupabase = async (
  vehicle: Omit<VehicleReport, 'id' | 'reportDate' | 'status'>,
  imageFile?: File,
  trackingCode?: string
): Promise<VehicleReport | null> => {
  try {
    let imageUrl = null;
    
    if (imageFile) {
      imageUrl = await uploadImageToStorage(imageFile, 'vehicles');
    }

    const user = supabase.auth.getUser();
    const { data, error } = await supabase
      .from('vehicles')
      .insert({
        type: vehicle.type,
        chassis: vehicle.chassis,
        brand: vehicle.brand,
        model: vehicle.model,
        color: vehicle.color,
        year: parseInt(vehicle.year),
        location: vehicle.location,
        description: vehicle.description,
        contact: vehicle.contact, // Fixed: use proper contact field
        image_url: imageUrl,
        user_id: (await user).data.user?.id,
        tracking_code: trackingCode
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      type: data.type,
      chassis: data.chassis,
      brand: data.brand,
      model: data.model,
      color: data.color,
      year: data.year.toString(),
      location: data.location,
      description: data.description || "",
      contact: data.contact || "",
      reportDate: data.report_date,
      status: data.status as 'pending' | 'verified' | 'found',
      photoUrl: data.image_url,
    };
  } catch (error) {
    handleError(error);
    return null;
  }
};

// Device reports
export const fetchDevices = async (): Promise<DeviceReport[]> => {
  try {
    const { data, error } = await supabase
      .from('devices')
      .select('*');

    if (error) throw error;
    
    return data.map(device => ({
      id: device.id,
      type: device.type,
      imei: device.imei,
      brand: device.brand,
      model: device.model,
      color: device.color,
      location: device.location,
      description: device.description || "",
      contact: device.contact || "",
      reportDate: device.report_date,
      status: device.status as 'pending' | 'verified' | 'found',
      photoUrl: device.image_url,
    }));
  } catch (error) {
    handleError(error);
    return [];
  }
};

export const saveDeviceToSupabase = async (
  device: Omit<DeviceReport, 'id' | 'reportDate' | 'status'>,
  imageFile?: File,
  trackingCode?: string
): Promise<DeviceReport | null> => {
  try {
    let imageUrl = null;
    
    if (imageFile) {
      imageUrl = await uploadImageToStorage(imageFile, 'devices');
    }

    const user = supabase.auth.getUser();
    const { data, error } = await supabase
      .from('devices')
      .insert({
        type: device.type,
        imei: device.imei,
        brand: device.brand,
        model: device.model,
        color: device.color,
        location: device.location,
        description: device.description,
        contact: device.contact, // Fixed: use proper contact field
        image_url: imageUrl,
        user_id: (await user).data.user?.id,
        tracking_code: trackingCode
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      type: data.type,
      imei: data.imei,
      brand: data.brand,
      model: data.model,
      color: data.color,
      location: data.location,
      description: data.description || "",
      contact: data.contact || "",
      reportDate: data.report_date,
      status: data.status as 'pending' | 'verified' | 'found',
      photoUrl: data.image_url,
    };
  } catch (error) {
    handleError(error);
    return null;
  }
};

// Person reports
export const fetchPersons = async (): Promise<PersonReport[]> => {
  try {
    const { data, error } = await supabase
      .from('persons')
      .select('*');

    if (error) throw error;
    
    return data.map(person => ({
      id: person.id,
      name: person.name,
      age: person.age.toString(),
      gender: person.gender,
      description: person.description || "",
      outfit: person.physical_attributes || "",
      location: person.location,
      dateMissing: person.date_missing,
      contact: person.contact,
      reportDate: person.report_date,
      status: person.status as 'missing' | 'found',
      photoUrl: person.image_url,
    }));
  } catch (error) {
    handleError(error);
    return [];
  }
};

export const savePersonToSupabase = async (
  person: Omit<PersonReport, 'id' | 'reportDate' | 'status'>,
  imageFile?: File,
  trackingCode?: string
): Promise<PersonReport | null> => {
  try {
    console.log("savePersonToSupabase called with:", { 
      personName: person.name, 
      hasImageFile: !!imageFile, 
      imageFileName: imageFile?.name,
      imageFileSize: imageFile?.size,
      trackingCode 
    });
    
    let imageUrl = person.photoUrl;
    
    if (imageFile) {
      console.log("Attempting to upload person image:", imageFile.name);
      imageUrl = await uploadImageToStorage(imageFile, 'persons');
      console.log("Upload result:", imageUrl);
      if (!imageUrl) {
        console.log("Image upload failed, continuing without image");
        // Note: toast not available in utility function, will be handled by component
      }
    }

    const user = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('persons')
      .insert({
        name: person.name,
        age: parseInt(person.age),
        gender: person.gender,
        description: person.description,
        physical_attributes: person.outfit,
        location: person.location,
        date_missing: person.dateMissing,
        contact: person.contact,
        image_url: imageUrl,
        user_id: user.data.user?.id,
        tracking_code: trackingCode
      })
      .select()
      .single();
    
    if (error) {
      console.error("Database insert error:", error);
      throw error;
    }
    
    console.log("Database insert successful:", data);
    console.log(imageUrl ? "Person report saved successfully with photo!" : "Person report saved successfully!");
    
    return {
      id: data.id,
      name: data.name,
      age: data.age.toString(),
      gender: data.gender,
      description: data.description || "",
      outfit: data.physical_attributes || "",
      location: data.location,
      dateMissing: data.date_missing,
      contact: data.contact,
      reportDate: data.report_date,
      status: data.status as 'missing' | 'found',
      photoUrl: data.image_url,
    };
  } catch (error) {
    console.error("savePersonToSupabase error:", error);
    handleError(error);
    return null;
  }
};

// Update report status
export const updateReportStatusInSupabase = async (
  id: string, 
  status: 'pending' | 'verified' | 'found' | 'missing',
  type: 'vehicle' | 'device' | 'person'
): Promise<boolean> => {
  try {
    let table;
    let statusField;
    
    switch (type) {
      case 'vehicle':
        table = 'vehicles';
        statusField = status === 'missing' ? 'pending' : status;
        break;
      case 'device':
        table = 'devices';
        statusField = status === 'missing' ? 'pending' : status;
        break;
      case 'person':
        table = 'persons';
        statusField = status === 'pending' || status === 'verified' ? 'missing' : status;
        break;
      default:
        throw new Error('Invalid report type');
    }
    
    const { error } = await supabase
      .from(table)
      .update({ status: statusField })
      .eq('id', id);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    handleError(error);
    return false;
  }
};

// Delete a report
export const deleteReportFromSupabase = async (
  id: string,
  type: 'vehicle' | 'device' | 'person'
): Promise<boolean> => {
  try {
    let table;
    
    switch (type) {
      case 'vehicle':
        table = 'vehicles';
        break;
      case 'device':
        table = 'devices';
        break;
      case 'person':
        table = 'persons';
        break;
      default:
        throw new Error('Invalid report type');
    }
    
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    handleError(error);
    return false;
  }
};

// Search reports across all tables
export const searchReportsInSupabase = async (query: string): Promise<Report[]> => {
  const normalizedQuery = query.toLowerCase().trim();
  
  try {
    // Search in vehicles
    const { data: vehicles, error: vehiclesError } = await supabase
      .from('vehicles')
      .select('*')
      .or(`id.ilike.%${normalizedQuery}%,chassis.ilike.%${normalizedQuery}%,brand.ilike.%${normalizedQuery}%,model.ilike.%${normalizedQuery}%`);
    
    if (vehiclesError) throw vehiclesError;
    
    // Search in devices
    const { data: devices, error: devicesError } = await supabase
      .from('devices')
      .select('*')
      .or(`id.ilike.%${normalizedQuery}%,imei.ilike.%${normalizedQuery}%,brand.ilike.%${normalizedQuery}%,model.ilike.%${normalizedQuery}%`);
    
    if (devicesError) throw devicesError;
    
    // Search in persons
    const { data: persons, error: personsError } = await supabase
      .from('persons')
      .select('*')
      .or(`id.ilike.%${normalizedQuery}%,name.ilike.%${normalizedQuery}%`);
    
    if (personsError) throw personsError;
    
    // Convert and combine results
    const vehicleReports = vehicles.map(v => ({
      id: v.id,
      type: v.type,
      chassis: v.chassis,
      brand: v.brand,
      model: v.model,
      color: v.color,
      year: v.year.toString(),
      location: v.location,
      description: v.description || "",
      contact: v.contact || "",
      reportDate: v.report_date,
      status: v.status as 'pending' | 'verified' | 'found',
      photoUrl: v.image_url,
    })) as VehicleReport[];
    
    const deviceReports = devices.map(d => ({
      id: d.id,
      type: d.type,
      imei: d.imei,
      brand: d.brand,
      model: d.model,
      color: d.color,
      location: d.location,
      description: d.description || "",
      contact: d.contact || "",
      reportDate: d.report_date,
      status: d.status as 'pending' | 'verified' | 'found',
      photoUrl: d.image_url,
    })) as DeviceReport[];
    
    const personReports = persons.map(p => ({
      id: p.id,
      name: p.name,
      age: p.age.toString(),
      gender: p.gender,
      description: p.description || "",
      outfit: p.physical_attributes || "",
      location: p.location,
      dateMissing: p.date_missing,
      contact: p.contact,
      reportDate: p.report_date,
      status: p.status as 'missing' | 'found',
      photoUrl: p.image_url,
    })) as PersonReport[];
    
    return [...vehicleReports, ...deviceReports, ...personReports];
  } catch (error) {
    handleError(error);
    return [];
  }
};

// Fetch all reports from all tables
export const getAllReportsFromSupabase = async (): Promise<Report[]> => {
  try {
    // Fetch from vehicles
    const { data: vehicles, error: vehiclesError } = await supabase
      .from('vehicles')
      .select('*');
    
    if (vehiclesError) throw vehiclesError;
    
    // Fetch from devices
    const { data: devices, error: devicesError } = await supabase
      .from('devices')
      .select('*');
    
    if (devicesError) throw devicesError;
    
    // Fetch from persons
    const { data: persons, error: personsError } = await supabase
      .from('persons')
      .select('*');
    
    if (personsError) throw personsError;
    
    // Convert and combine results
    const vehicleReports = vehicles.map(v => ({
      id: v.id,
      type: v.type,
      chassis: v.chassis,
      brand: v.brand,
      model: v.model,
      color: v.color,
      year: v.year.toString(),
      location: v.location,
      description: v.description || "",
      contact: v.contact || "",
      reportDate: v.report_date,
      status: v.status as 'pending' | 'verified' | 'found',
      photoUrl: v.image_url,
    })) as VehicleReport[];
    
    const deviceReports = devices.map(d => ({
      id: d.id,
      type: d.type,
      imei: d.imei,
      brand: d.brand,
      model: d.model,
      color: d.color,
      location: d.location,
      description: d.description || "",
      contact: d.contact || "",
      reportDate: d.report_date,
      status: d.status as 'pending' | 'verified' | 'found',
      photoUrl: d.image_url,
    })) as DeviceReport[];
    
    const personReports = persons.map(p => ({
      id: p.id,
      name: p.name,
      age: p.age.toString(),
      gender: p.gender,
      description: p.description || "",
      outfit: p.physical_attributes || "",
      location: p.location,
      dateMissing: p.date_missing,
      contact: p.contact,
      reportDate: p.report_date,
      status: p.status as 'missing' | 'found',
      photoUrl: p.image_url,
    })) as PersonReport[];
    
    return [...vehicleReports, ...deviceReports, ...personReports];
  } catch (error) {
    handleError(error);
    return [];
  }
};

// Save household item report
export const saveHouseholdToSupabase = async (
  householdData: any,
  imageFile?: File,
  trackingCode?: string
): Promise<any> => {
  try {
    let imageUrl = null;
    
    if (imageFile) {
      imageUrl = await uploadImageToStorage(imageFile, 'household');
    }

    const user = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('household_items')
      .insert({
        type: householdData.type,
        brand: householdData.brand,
        model: householdData.model,
        color: householdData.color,
        year: householdData.year ? parseInt(householdData.year) : new Date().getFullYear(),
        imei: householdData.imei || householdData.serial || 'N/A',
        location: householdData.location,
        description: householdData.description || "",
        contact: householdData.contact,
        image_url: imageUrl,
        user_id: user.data.user?.id,
        tracking_code: trackingCode
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    handleError(error);
    return null;
  }
};

// Save personal belonging report
export const savePersonalToSupabase = async (
  personalData: any,
  imageFile?: File,
  trackingCode?: string
): Promise<any> => {
  try {
    let imageUrl = null;
    
    if (imageFile) {
      imageUrl = await uploadImageToStorage(imageFile, 'personal');
    }

    const user = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('personal_belongings')
      .insert({
        type: personalData.type,
        brand: personalData.brand,
        model: personalData.model,
        color: personalData.color,
        year: personalData.year ? parseInt(personalData.year) : new Date().getFullYear(),
        imei: personalData.imei || personalData.serial || 'N/A',
        location: personalData.location,
        description: personalData.description || "",
        contact: personalData.contact,
        image_url: imageUrl,
        user_id: user.data.user?.id,
        tracking_code: trackingCode
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    handleError(error);
    return null;
  }
};

// Save account report
export const saveAccountToSupabase = async (
  accountData: any,
  imageFile?: File,
  trackingCode?: string
): Promise<any> => {
  try {
    let imageUrl = null;
    
    if (imageFile) {
      imageUrl = await uploadImageToStorage(imageFile, 'accounts');
    }

    const user = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('hacked_accounts')
      .insert({
        account_type: accountData.account_type || accountData.type,
        account_identifier: accountData.account_identifier || accountData.username || accountData.email,
        description: accountData.description || "",
        contact: accountData.contact,
        date_compromised: accountData.date_compromised || new Date().toISOString().split('T')[0],
        image_url: imageUrl,
        user_id: user.data.user?.id,
        tracking_code: trackingCode
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    handleError(error);
    return null;
  }
};

// Save reputation report
export const saveReputationToSupabase = async (
  reputationData: any,
  imageFile?: File,
  trackingCode?: string
): Promise<any> => {
  try {
    let imageUrl = null;
    
    if (imageFile) {
      imageUrl = await uploadImageToStorage(imageFile, 'reputation');
    }

    const user = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('business_reputation_reports')
      .insert({
        reported_person_name: reputationData.reported_person_name || reputationData.name,
        reported_person_contact: reputationData.reported_person_contact || reputationData.contact,
        business_type: reputationData.business_type || reputationData.type,
        transaction_amount: reputationData.transaction_amount || reputationData.amount,
        reputation_status: reputationData.reputation_status || 'negative',
        description: reputationData.description || "",
        evidence: reputationData.evidence || "",
        reporter_name: reputationData.reporter_name || "",
        reporter_email: reputationData.reporter_email || "",
        reporter_phone: reputationData.reporter_phone || "",
        transaction_date: reputationData.transaction_date || new Date().toISOString().split('T')[0],
        user_id: user.data.user?.id,
        tracking_code: trackingCode
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    handleError(error);
    return null;
  }
};

// Create transaction record
export const createTransactionRecord = async (
  trackingCode: string,
  reportType: string,
  paymentProvider: string,
  paymentReference: string,
  amount: number
): Promise<boolean> => {
  try {
    const user = await supabase.auth.getUser();
    const { error } = await supabase
      .from('transactions')
      .insert({
        tracking_code: trackingCode,
        report_type: reportType,
        payment_provider: paymentProvider,
        payment_reference: paymentReference,
        amount: amount,
        status: 'paid',
        paid_at: new Date().toISOString(),
        user_id: user.data.user?.id,
        report_data: {}, // Will be populated with actual report data
        currency: 'usd'
      });
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    handleError(error);
    return false;
  }
};

// Get report by tracking code
export const getReportByTrackingCode = async (trackingCode: string): Promise<any> => {
  try {
    // Check each table individually for the tracking code
    let result = null;
    
    // Check persons table
    const { data: personData } = await supabase
      .from('persons')
      .select('*')
      .eq('tracking_code', trackingCode)
      .maybeSingle();
    
    if (personData) {
      return { ...personData, table: 'persons', reportType: 'person' };
    }
    
    // Check devices table
    const { data: deviceData } = await supabase
      .from('devices')
      .select('*')
      .eq('tracking_code', trackingCode)
      .maybeSingle();
    
    if (deviceData) {
      return { ...deviceData, table: 'devices', reportType: 'device' };
    }
    
    // Check vehicles table
    const { data: vehicleData } = await supabase
      .from('vehicles')
      .select('*')
      .eq('tracking_code', trackingCode)
      .maybeSingle();
    
    if (vehicleData) {
      return { ...vehicleData, table: 'vehicles', reportType: 'vehicle' };
    }
    
    // Check household_items table
    const { data: householdData } = await supabase
      .from('household_items')
      .select('*')
      .eq('tracking_code', trackingCode)
      .maybeSingle();
    
    if (householdData) {
      return { ...householdData, table: 'household_items', reportType: 'household' };
    }
    
    // Check personal_belongings table
    const { data: personalData } = await supabase
      .from('personal_belongings')
      .select('*')
      .eq('tracking_code', trackingCode)
      .maybeSingle();
    
    if (personalData) {
      return { ...personalData, table: 'personal_belongings', reportType: 'personal' };
    }
    
    // Check hacked_accounts table
    const { data: accountData } = await supabase
      .from('hacked_accounts')
      .select('*')
      .eq('tracking_code', trackingCode)
      .maybeSingle();
    
    if (accountData) {
      return { ...accountData, table: 'hacked_accounts', reportType: 'account' };
    }
    
    // Check business_reputation_reports table
    const { data: reputationData } = await supabase
      .from('business_reputation_reports')
      .select('*')
      .eq('tracking_code', trackingCode)
      .maybeSingle();
    
    if (reputationData) {
      return { ...reputationData, table: 'business_reputation_reports', reportType: 'reputation' };
    }
    
    return null;
  } catch (error) {
    handleError(error);
    return null;
  }
};
