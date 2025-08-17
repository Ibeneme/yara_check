
// Types for our stored data
export interface VehicleReport {
    id: string;
    type: string;
    chassis: string;
    brand: string;
    model: string;
    color: string;
    year: string;
    location: string;
    description: string;
    contact: string;
    reportDate: string;
    status: 'pending' | 'verified' | 'found';
    photoUrl?: string;
  }
  
  export interface DeviceReport {
    id: string;
    type: string;
    imei: string;
    brand: string;
    model: string;
    color: string;
    location: string;
    description: string;
    contact: string;
    reportDate: string;
    status: 'pending' | 'verified' | 'found';
    photoUrl?: string;
  }
  
  export interface PersonReport {
    id: string;
    name: string;
    age: string;
    gender: string;
    description: string;
    outfit: string;
    location: string;
    dateMissing: string;
    contact: string;
    reportDate: string;
    status: 'missing' | 'found';
    photoUrl?: string;
  }
  
  export type Report = VehicleReport | DeviceReport | PersonReport;
  
  // Storage keys
  const STORAGE_KEYS = {
    VEHICLES: 'padiman_vehicles',
    DEVICES: 'padiman_devices',
    PERSONS: 'padiman_persons',
  };
  
  // Generate a unique ID
  export const generateId = (): string => {
    return 'PAD-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  };
  
  // Get all vehicles
  export const getVehicles = (): VehicleReport[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.VEHICLES);
    return stored ? JSON.parse(stored) : [];
  };
  
  // Save a vehicle
  export const saveVehicle = (vehicle: Omit<VehicleReport, 'id' | 'reportDate' | 'status'>): VehicleReport => {
    const vehicles = getVehicles();
    const newVehicle: VehicleReport = {
      ...vehicle,
      id: generateId(),
      reportDate: new Date().toISOString(),
      status: 'pending',
    };
    
    vehicles.push(newVehicle);
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles));
    return newVehicle;
  };
  
  // Get all devices
  export const getDevices = (): DeviceReport[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.DEVICES);
    return stored ? JSON.parse(stored) : [];
  };
  
  // Save a device
  export const saveDevice = (device: Omit<DeviceReport, 'id' | 'reportDate' | 'status'>): DeviceReport => {
    const devices = getDevices();
    const newDevice: DeviceReport = {
      ...device,
      id: generateId(),
      reportDate: new Date().toISOString(),
      status: 'pending',
    };
    
    devices.push(newDevice);
    localStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(devices));
    return newDevice;
  };
  
  // Get all persons
  export const getPersons = (): PersonReport[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.PERSONS);
    return stored ? JSON.parse(stored) : [];
  };
  
  // Save a person
  export const savePerson = (person: Omit<PersonReport, 'id' | 'reportDate' | 'status'>): PersonReport => {
    const persons = getPersons();
    const newPerson: PersonReport = {
      ...person,
      id: generateId(),
      reportDate: new Date().toISOString(),
      status: 'missing',
    };
    
    persons.push(newPerson);
    localStorage.setItem(STORAGE_KEYS.PERSONS, JSON.stringify(persons));
    return newPerson;
  };
  
  // Search by ID or other property
  export const searchReports = (query: string): Report[] => {
    const normalizedQuery = query.toLowerCase().trim();
    
    const vehicles = getVehicles().filter(v => 
      v.id.toLowerCase().includes(normalizedQuery) ||
      v.chassis.toLowerCase().includes(normalizedQuery) ||
      v.brand.toLowerCase().includes(normalizedQuery) ||
      v.model.toLowerCase().includes(normalizedQuery)
    );
    
    const devices = getDevices().filter(d => 
      d.id.toLowerCase().includes(normalizedQuery) ||
      d.imei.toLowerCase().includes(normalizedQuery) ||
      d.brand.toLowerCase().includes(normalizedQuery) ||
      d.model.toLowerCase().includes(normalizedQuery)
    );
    
    const persons = getPersons().filter(p => 
      p.id.toLowerCase().includes(normalizedQuery) ||
      p.name.toLowerCase().includes(normalizedQuery)
    );
    
    return [...vehicles, ...devices, ...persons];
  };
  
  // Get all reports
  export const getAllReports = (): Report[] => {
    return [
      ...getVehicles(),
      ...getDevices(),
      ...getPersons()
    ];
  };
  
  // Update report status
  export const updateReportStatus = (id: string, status: 'pending' | 'verified' | 'found' | 'missing'): boolean => {
    // Try to update in vehicles
    let vehicles = getVehicles();
    const vehicleIndex = vehicles.findIndex(v => v.id === id);
    if (vehicleIndex >= 0) {
      vehicles[vehicleIndex].status = status as 'pending' | 'verified' | 'found';
      localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles));
      return true;
    }
    
    // Try to update in devices
    let devices = getDevices();
    const deviceIndex = devices.findIndex(d => d.id === id);
    if (deviceIndex >= 0) {
      devices[deviceIndex].status = status as 'pending' | 'verified' | 'found';
      localStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(devices));
      return true;
    }
    
    // Try to update in persons
    let persons = getPersons();
    const personIndex = persons.findIndex(p => p.id === id);
    if (personIndex >= 0) {
      persons[personIndex].status = status as 'missing' | 'found';
      localStorage.setItem(STORAGE_KEYS.PERSONS, JSON.stringify(persons));
      return true;
    }
    
    return false;
  };
  
  // Delete a report
  export const deleteReport = (id: string): boolean => {
    // Try to delete from vehicles
    let vehicles = getVehicles();
    const vehicleIndex = vehicles.findIndex(v => v.id === id);
    if (vehicleIndex >= 0) {
      vehicles.splice(vehicleIndex, 1);
      localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles));
      return true;
    }
    
    // Try to delete from devices
    let devices = getDevices();
    const deviceIndex = devices.findIndex(d => d.id === id);
    if (deviceIndex >= 0) {
      devices.splice(deviceIndex, 1);
      localStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(devices));
      return true;
    }
    
    // Try to delete from persons
    let persons = getPersons();
    const personIndex = persons.findIndex(p => p.id === id);
    if (personIndex >= 0) {
      persons.splice(personIndex, 1);
      localStorage.setItem(STORAGE_KEYS.PERSONS, JSON.stringify(persons));
      return true;
    }
    
    return false;
  };
  