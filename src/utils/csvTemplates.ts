export const downloadCSVTemplate = (type: 'teacher' | 'student') => {
  let csvContent = '';
  let filename = '';

  if (type === 'teacher') {
    csvContent = `firstname,lastname,email,phone,teacherid,subject,qualification,experience,password
John,Doe,john.doe@school.com,+1234567890,T001,Mathematics,M.Ed,5,SecurePass123!
Jane,Smith,jane.smith@school.com,+1987654321,T002,Science,B.Sc,3,SecurePass456!`;
    filename = 'teacher-template.csv';
  } else if (type === 'student') {
    csvContent = `firstname,lastname,email,grade,section,phone,studentid,assignedto,password
Alice,Johnson,alice.j@school.com,10,A,+1234567890,S001,John Doe,SecurePass789!
Bob,Williams,bob.w@school.com,11,B,+1987654321,S002,Jane Smith,SecurePass012!`;
    filename = 'student-template.csv';
  }

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const getTeacherCSVColumns = () => [
  { name: 'firstname', required: true, description: 'Teacher first name' },
  { name: 'lastname', required: true, description: 'Teacher last name' },
  { name: 'email', required: true, description: 'Teacher email address' },
  { name: 'phone', required: false, description: 'Phone number' },
  { name: 'teacherid', required: false, description: 'Teacher ID' },
  { name: 'subject', required: false, description: 'Subject specialization' },
  { name: 'qualification', required: false, description: 'Educational qualification' },
  { name: 'experience', required: false, description: 'Years of experience' },
  { name: 'password', required: false, description: 'Password (auto-generated if empty)' }
];

export const getStudentCSVColumns = () => [
  { name: 'firstname', required: true, description: 'Student first name' },
  { name: 'lastname', required: true, description: 'Student last name' },
  { name: 'email', required: true, description: 'Student email address' },
  { name: 'grade', required: true, description: 'Grade level' },
  { name: 'section', required: false, description: 'Class section (defaults to A)' },
  { name: 'phone', required: false, description: 'Phone number' },
  { name: 'studentid', required: false, description: 'Student ID' },
  { name: 'assignedto', required: false, description: 'Assigned teacher name' },
  { name: 'password', required: false, description: 'Password (auto-generated if empty)' }
];
