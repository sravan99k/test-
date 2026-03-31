// Enhanced email validation with domain validation
export interface EmailValidationResult {
  isValid: boolean;
  error?: string;
  domain?: string;
  isEducational?: boolean;
}

// List of common educational domains that are typically allowed
const ALLOWED_EDUCATIONAL_DOMAINS = [
  '.edu',
  '.ac.',
  '.school',
  '.k12',
  '.sch.'
];

// List of commonly blocked personal email domains (optional)
const BLOCKED_PERSONAL_DOMAINS = [
  'tempmail.com',
  '10minutemail.com',
  'guerrillamail.com',
  'mailinator.com',
  'throwaway.email'
];

export const validateEmail = (email: string): EmailValidationResult => {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email is required' };
  }

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, error: 'Invalid email format' };
  }

  const trimmedEmail = email.trim().toLowerCase();
  
  // Extract domain
  const domainMatch = trimmedEmail.match(/@([^@]+)$/);
  if (!domainMatch) {
    return { isValid: false, error: 'Invalid email domain' };
  }

  const domain = domainMatch[1];

  // Check for blocked domains
  if (BLOCKED_PERSONAL_DOMAINS.some(blocked => domain.includes(blocked))) {
    return { 
      isValid: false, 
      error: 'Temporary or disposable email addresses are not allowed',
      domain 
    };
  }

  // Check if it's an educational domain (optional enhancement)
  const isEducational = ALLOWED_EDUCATIONAL_DOMAINS.some(edu => domain.includes(edu));
  
  // You can choose to enforce educational domains only
  // For now, we'll allow all valid domains but flag educational ones
  return { 
    isValid: true, 
    domain,
    isEducational
  };
};

export const validateEmailDomain = (domain: string): boolean => {
  if (!domain || typeof domain !== 'string') {
    return false;
  }

  // Basic domain validation
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])*$/;
  return domainRegex.test(domain.toLowerCase());
};

export const getEmailDomainInfo = (email: string) => {
  const validation = validateEmail(email);
  if (!validation.isValid) {
    return null;
  }

  const domain = validation.domain!;
  const isEducational = ALLOWED_EDUCATIONAL_DOMAINS.some(edu => domain.includes(edu));
  const isCommonProvider = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'].includes(domain);

  return {
    domain,
    isEducational,
    isCommonProvider,
    isCustom: !isEducational && !isCommonProvider
  };
};
