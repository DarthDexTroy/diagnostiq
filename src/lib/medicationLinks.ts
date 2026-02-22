/**
 * Smart Medication Hyperlinking Utility
 * Generates Amazon search links for medications
 */

export interface MedicationCard {
  label: string;
  url: string;
  animation: string;
}

/**
 * Generates an Amazon search link for a medication
 * Automatically appends "Childrens+" prefix in pediatric mode
 */
export function generateMedicationCard(
  medName: string,
  isPediatric: boolean = false
): MedicationCard {
  // Prepend "Childrens+" for pediatric mode
  const searchTerm = isPediatric ? `Childrens+ ${medName}` : medName;
  
  // Replace spaces with '+' for URL encoding
  const encodedTerm = searchTerm.replace(/\s+/g, '+');
  
  // Generate Amazon search URL
  const searchUrl = `https://www.amazon.com/s?k=${encodedTerm}`;
  
  return {
    label: `Order ${medName}`,
    url: searchUrl,
    animation: "bounce-in"
  };
}

/**
 * Generates multiple pharmacy search links for a medication
 */
export function generatePharmacyLinks(medName: string, isPediatric: boolean = false) {
  const searchTerm = isPediatric ? `Childrens+ ${medName}` : medName;
  const encoded = searchTerm.replace(/\s+/g, '+');
  
  return {
    amazon: `https://www.amazon.com/s?k=${encoded}`,
    walgreens: `https://www.walgreens.com/search/results.jsp?Ntt=${encoded}`,
    cvs: `https://www.cvs.com/search?searchTerm=${encoded}`,
    walmart: `https://www.walmart.com/search?q=${encoded}`
  };
}
