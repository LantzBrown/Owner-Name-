import Papa from 'papaparse';
import { BusinessRow } from '../types';

export const parseCSV = (file: File): Promise<BusinessRow[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data.map((row: any, index) => ({
          id: `row-${index}-${Date.now()}`,
          // Flexible mapping based on common variations
          business_name: row['Name'] || row['name'] || row['Business Name'] || '',
          website: row['Website'] || row['website'] || '',
          google_my_business_url: row['Profile'] || row['profile'] || row['GMB'] || '',
          phone_number: row['Phone'] || row['phone'] || '',
          email: row['Emails'] || row['emails'] || row['Email'] || '',
          
          owner_first_name: '', 
          owner_last_name: '',
          confidence: '',
          source: ''
        }));
        resolve(rows);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};

export const generateCSV = (data: BusinessRow[]): string => {
  // Output columns strictly as requested
  const structuredData = data.map((row) => ({
    'First Name': row.owner_first_name || '',
    'Last Name': row.owner_last_name || '',
    'Name': row.business_name || '',
    'Profile': row.google_my_business_url || '',
    'Website': row.website || '',
    'Phone': row.phone_number || '',
    'Emails': row.email || '',
    'Source': row.source || '',
    'Confidence': row.confidence || ''
  }));

  return Papa.unparse(structuredData);
};

export const downloadCSV = (csvContent: string, filename: string) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};