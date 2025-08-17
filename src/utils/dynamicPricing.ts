export interface PricingParams {
    reportType: 'person' | 'device' | 'vehicle' | 'account' | 'reputation' | 'household' | 'personal';
    deviceType?: string;
    year?: number;
    age?: number;
    brand?: string;
  }
  
  export const calculatePrice = (params: PricingParams): number => {
    const { reportType, deviceType, year, age, brand } = params;
  
    switch (reportType) {
      case 'person':
        if (!age) return 500; // Default $5.00 if age not provided
        if (age >= 1 && age <= 7) return 0; // Free for ages 1-7
        if (age >= 8 && age <= 14) return 400; // $4.00 for ages 8-14
        return 500; // $5.00 for ages 15+
  
      case 'device':
        if (!deviceType || !year) return 250; // Default $2.50 if info missing
        
        if (deviceType === 'mobile_phone') {
          const isIphone = brand?.toLowerCase().includes('apple') || brand?.toLowerCase().includes('iphone');
          
          if (isIphone) {
            if (year < 2017) return 250; // $2.50
            if (year >= 2017 && year <= 2020) return 400; // $4.00
            return 500; // $5.00 for 2021+
          } else {
            // Android phones
            if (year < 2017) return 150; // $1.50
            if (year >= 2017 && year <= 2020) return 200; // $2.00
            return 250; // $2.50 for 2021+
          }
        }
        
        if (deviceType === 'laptop') {
          if (year < 2015) return 200; // $2.00
          if (year >= 2015 && year <= 2020) return 350; // $3.50
          return 500; // $5.00 for 2021+
        }
        
        // Other devices default
        return 250; // $2.50
  
      case 'vehicle':
        if (!year) return 450; // Default $4.50 if year not provided
        if (year < 2010) return 300; // $3.00
        if (year >= 2010 && year <= 2015) return 350; // $3.50
        if (year >= 2016 && year <= 2020) return 450; // $4.50
        return 640; // $6.40 for 2021+
  
      case 'account':
        return 400; // $4.00 for compromised social media accounts
  
      case 'reputation':
        return 400; // $4.00 for business reputation reports
  
      case 'household':
      case 'personal':
        // Use same pricing logic as devices
        if (!deviceType || !year) return 250; // Default $2.50 if info missing
        
        if (year < 2015) return 150; // $1.50
        if (year >= 2015 && year <= 2020) return 200; // $2.00
        return 500; // $5.00 for 2021+
  
      default:
        return 800; // Default fallback
    }
  };
  
  export const formatPrice = (priceInCents: number): string => {
    return `$${(priceInCents / 100).toFixed(2)}`;
  };
  