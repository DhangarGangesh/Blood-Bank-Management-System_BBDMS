const bcrypt = require('bcryptjs');

// Deterministic realistic demo dataset for Blood Bank Donor Management System (BBDMS)
// Default password for all demo accounts is 'password123'
const DEFAULT_PASSWORD_HASH = bcrypt.hashSync('password123', 10);

// 1. Staff & Admin Accounts
const staffUsers = [
  {
    id: 1,
    name: 'Dr. Sunita Rao',
    email: 'admin@lifesave.org',
    password: DEFAULT_PASSWORD_HASH,
    role: 'admin',
    created_at: '2026-01-01T08:00:00Z'
  },
  {
    id: 2,
    name: 'Nurse Anita Desai',
    email: 'nurse.anita@lifesave.org',
    password: DEFAULT_PASSWORD_HASH,
    role: 'staff',
    created_at: '2026-01-05T09:00:00Z'
  },
  {
    id: 3,
    name: 'Vikram Mehta',
    email: 'lab.vikram@lifesave.org',
    password: DEFAULT_PASSWORD_HASH,
    role: 'staff',
    created_at: '2026-01-10T10:00:00Z'
  },
  {
    id: 4,
    name: 'Kavita Reddy',
    email: 'coordinator.kavita@lifesave.org',
    password: DEFAULT_PASSWORD_HASH,
    role: 'staff',
    created_at: '2026-01-15T11:00:00Z'
  }
];

// Raw template list of 60 diverse, realistic fictional donors
const donorTemplates = [
  { name: 'Aarav Sharma', gender: 'Male', blood_group: 'O+', city: 'Mumbai, MH', phone: '+91 9876543210', dob: '1995-04-12', eligible: true, weight: 72.5, last_donation: '2026-05-10', illness: 'None', meds: 'None' },
  { name: 'Priya Patel', gender: 'Female', blood_group: 'A+', city: 'Kolkata, WB', phone: '+91 9812345678', dob: '1998-09-23', eligible: true, weight: 58.0, last_donation: '2026-01-15', illness: 'None', meds: 'None' },
  { name: 'Rohan Verma', gender: 'Male', blood_group: 'AB-', city: 'Bengaluru, KA', phone: '+91 9988776655', dob: '1992-11-05', eligible: false, weight: 65.0, last_donation: '2026-09-01', illness: 'Cold & Fever', meds: 'Antibiotics' },
  { name: 'Ananya Iyer', gender: 'Female', blood_group: 'B+', city: 'Chennai, TN', phone: '+91 9845012345', dob: '1996-03-18', eligible: true, weight: 62.0, last_donation: '2026-06-12', illness: 'None', meds: 'None' },
  { name: 'Vikram Malhotra', gender: 'Male', blood_group: 'O-', city: 'New Delhi, DL', phone: '+91 9811223344', dob: '1990-07-29', eligible: true, weight: 78.0, last_donation: '2026-04-05', illness: 'None', meds: 'None' },
  { name: 'Neha Gupta', gender: 'Female', blood_group: 'A-', city: 'Jaipur, RJ', phone: '+91 9723456789', dob: '1999-12-14', eligible: true, weight: 54.5, last_donation: '2026-02-20', illness: 'None', meds: 'None' },
  { name: 'Rahul Nair', gender: 'Male', blood_group: 'B-', city: 'Kochi, KL', phone: '+91 9447123456', dob: '1993-08-08', eligible: false, weight: 48.0, last_donation: null, illness: 'None', meds: 'None' }, // Underweight!
  { name: 'Sneha Joshi', gender: 'Female', blood_group: 'AB+', city: 'Pune, MH', phone: '+91 9822334455', dob: '1997-05-30', eligible: true, weight: 56.0, last_donation: '2026-03-11', illness: 'None', meds: 'None' },
  { name: 'Arjun Reddy', gender: 'Male', blood_group: 'O+', city: 'Hyderabad, TS', phone: '+91 9848012345', dob: '1991-10-15', eligible: true, weight: 81.0, last_donation: '2026-07-22', illness: 'None', meds: 'None' },
  { name: 'Meera Mukherjee', gender: 'Female', blood_group: 'A+', city: 'Kolkata, WB', phone: '+91 9831098765', dob: '1994-02-25', eligible: true, weight: 59.0, last_donation: '2026-05-30', illness: 'None', meds: 'None' },
  { name: 'Siddharth Rao', gender: 'Male', blood_group: 'B+', city: 'Bengaluru, KA', phone: '+91 9880123456', dob: '1989-06-19', eligible: false, weight: 74.0, last_donation: '2026-09-15', illness: 'Throat Infection', meds: 'Azithromycin' },
  { name: 'Pooja Kapoor', gender: 'Female', blood_group: 'O-', city: 'Chandigarh, CH', phone: '+91 9814012345', dob: '2001-01-10', eligible: true, weight: 53.0, last_donation: '2026-06-01', illness: 'None', meds: 'None' },
  { name: 'Devendra Deshmukh', gender: 'Male', blood_group: 'A-', city: 'Nagpur, MH', phone: '+91 9823012345', dob: '1988-12-03', eligible: true, weight: 76.5, last_donation: '2026-03-18', illness: 'None', meds: 'None' },
  { name: 'Kavita Nambiar', gender: 'Female', blood_group: 'AB-', city: 'Thiruvananthapuram, KL', phone: '+91 9446012345', dob: '1995-09-09', eligible: true, weight: 57.0, last_donation: null, illness: 'None', meds: 'None' },
  { name: 'Aditya Bose', gender: 'Male', blood_group: 'B-', city: 'Kolkata, WB', phone: '+91 9830012345', dob: '1997-11-21', eligible: true, weight: 69.0, last_donation: '2026-02-14', illness: 'None', meds: 'None' },
  { name: 'Swati Kulkarni', gender: 'Female', blood_group: 'AB+', city: 'Nashik, MH', phone: '+91 9822012345', dob: '1993-04-04', eligible: true, weight: 61.5, last_donation: '2026-05-18', illness: 'None', meds: 'None' },
  { name: 'Rajesh Singhania', gender: 'Male', blood_group: 'O+', city: 'Lucknow, UP', phone: '+91 9415012345', dob: '1985-08-17', eligible: true, weight: 83.0, last_donation: '2026-04-28', illness: 'None', meds: 'None' },
  { name: 'Tanvi Bhat', gender: 'Female', blood_group: 'A+', city: 'Mangaluru, KA', phone: '+91 9844012345', dob: '2000-07-07', eligible: false, weight: 47.5, last_donation: null, illness: 'None', meds: 'None' }, // Underweight!
  { name: 'Karan Chawla', gender: 'Male', blood_group: 'B+', city: 'Gurugram, HR', phone: '+91 9810012345', dob: '1992-05-14', eligible: true, weight: 77.0, last_donation: '2026-06-25', illness: 'None', meds: 'None' },
  { name: 'Divya Menon', gender: 'Female', blood_group: 'O-', city: 'Coimbatore, TN', phone: '+91 9842012345', dob: '1996-10-31', eligible: true, weight: 55.0, last_donation: '2026-01-19', illness: 'None', meds: 'None' },
  { name: 'Manish Tiwari', gender: 'Male', blood_group: 'A-', city: 'Varanasi, UP', phone: '+91 9450012345', dob: '1994-01-26', eligible: true, weight: 71.0, last_donation: '2026-05-05', illness: 'None', meds: 'None' },
  { name: 'Ritu Agarwal', gender: 'Female', blood_group: 'AB-', city: 'Indore, MP', phone: '+91 9826012345', dob: '1998-03-12', eligible: false, weight: 52.0, last_donation: '2026-09-20', illness: 'Mild Flu', meds: 'Paracetamol' },
  { name: 'Gautam Sen', gender: 'Male', blood_group: 'B-', city: 'Bhubaneswar, OD', phone: '+91 9437012345', dob: '1991-09-03', eligible: true, weight: 75.0, last_donation: '2026-03-08', illness: 'None', meds: 'None' },
  { name: 'Ishita Roy', gender: 'Female', blood_group: 'AB+', city: 'Siliguri, WB', phone: '+91 9733012345', dob: '2002-06-15', eligible: true, weight: 54.0, last_donation: null, illness: 'None', meds: 'None' },
  { name: 'Nikhil Saxena', gender: 'Male', blood_group: 'O+', city: 'Bhopal, MP', phone: '+91 9827012345', dob: '1987-11-28', eligible: true, weight: 80.0, last_donation: '2026-07-10', illness: 'None', meds: 'None' },
  { name: 'Sunil Chettri', gender: 'Male', blood_group: 'A+', city: 'Gangtok, SK', phone: '+91 9734012345', dob: '1993-02-17', eligible: true, weight: 68.0, last_donation: '2026-04-12', illness: 'None', meds: 'None' },
  { name: 'Deepika Padukone', gender: 'Female', blood_group: 'O+', city: 'Bengaluru, KA', phone: '+91 9886012345', dob: '1995-01-05', eligible: true, weight: 59.0, last_donation: '2026-06-20', illness: 'None', meds: 'None' },
  { name: 'Harsh Vardhan', gender: 'Male', blood_group: 'B+', city: 'Patna, BR', phone: '+91 9431012345', dob: '1990-12-22', eligible: true, weight: 73.5, last_donation: '2026-02-01', illness: 'None', meds: 'None' },
  { name: 'Shreya Ghoshal', gender: 'Female', blood_group: 'O-', city: 'Mumbai, MH', phone: '+91 9820012345', dob: '1994-03-12', eligible: true, weight: 56.5, last_donation: '2026-05-15', illness: 'None', meds: 'None' },
  { name: 'Amitabh Sen', gender: 'Male', blood_group: 'AB+', city: 'Ranchi, JH', phone: '+91 9430012345', dob: '1996-08-20', eligible: false, weight: 66.0, last_donation: '2026-08-25', illness: 'Dental extraction', meds: 'Painkillers' },
  { name: 'Bhavna Rathore', gender: 'Female', blood_group: 'A-', city: 'Udaipur, RJ', phone: '+91 9829012345', dob: '1999-04-16', eligible: true, weight: 53.0, last_donation: null, illness: 'None', meds: 'None' },
  { name: 'Farhan Akhtar', gender: 'Male', blood_group: 'B-', city: 'Bandra, Mumbai, MH', phone: '+91 9821012345', dob: '1986-01-09', eligible: true, weight: 79.0, last_donation: '2026-03-30', illness: 'None', meds: 'None' },
  { name: 'Geeta Phogat', gender: 'Female', blood_group: 'O+', city: 'Rohtak, HR', phone: '+91 9812012345', dob: '1997-12-15', eligible: true, weight: 64.0, last_donation: '2026-06-18', illness: 'None', meds: 'None' },
  { name: 'Jaspreet Bumrah', gender: 'Male', blood_group: 'A+', city: 'Ahmedabad, GJ', phone: '+91 9825012345', dob: '1993-12-06', eligible: true, weight: 75.0, last_donation: '2026-07-04', illness: 'None', meds: 'None' },
  { name: 'Kareena Kapoor', gender: 'Female', blood_group: 'B+', city: 'Juhu, Mumbai, MH', phone: '+91 9820112345', dob: '1991-09-21', eligible: true, weight: 58.0, last_donation: '2026-01-28', illness: 'None', meds: 'None' },
  { name: 'Lokesh Rahul', gender: 'Male', blood_group: 'AB-', city: 'Mangaluru, KA', phone: '+91 9845112345', dob: '1992-04-18', eligible: true, weight: 74.0, last_donation: '2026-04-22', illness: 'None', meds: 'None' },
  { name: 'Mallika Sarabhai', gender: 'Female', blood_group: 'O-', city: 'Ahmedabad, GJ', phone: '+91 9824012345', dob: '1990-05-09', eligible: true, weight: 57.0, last_donation: '2026-05-25', illness: 'None', meds: 'None' },
  { name: 'Naveen Jindal', gender: 'Male', blood_group: 'A-', city: 'Raigarh, CG', phone: '+91 9425012345', dob: '1989-03-09', eligible: true, weight: 82.0, last_donation: '2026-02-18', illness: 'None', meds: 'None' },
  { name: 'Oindrila Roy', gender: 'Female', blood_group: 'B-', city: 'Asansol, WB', phone: '+91 9832012345', dob: '1998-10-24', eligible: false, weight: 46.0, last_donation: null, illness: 'None', meds: 'None' }, // Underweight!
  { name: 'Pranav Mistry', gender: 'Male', blood_group: 'AB+', city: 'Palanpur, GJ', phone: '+91 9825112345', dob: '1988-05-14', eligible: true, weight: 76.0, last_donation: '2026-06-08', illness: 'None', meds: 'None' },
  { name: 'Radhika Apte', gender: 'Female', blood_group: 'O+', city: 'Vellore, TN', phone: '+91 9841012345', dob: '1995-09-07', eligible: true, weight: 55.5, last_donation: '2026-03-14', illness: 'None', meds: 'None' },
  { name: 'Sachin Tendulkar', gender: 'Male', blood_group: 'A+', city: 'Bandra East, Mumbai, MH', phone: '+91 9820212345', dob: '1987-04-24', eligible: true, weight: 72.0, last_donation: '2026-05-02', illness: 'None', meds: 'None' },
  { name: 'Tara Sutaria', gender: 'Female', blood_group: 'B+', city: 'Colaba, Mumbai, MH', phone: '+91 9820312345', dob: '2001-11-19', eligible: true, weight: 52.0, last_donation: null, illness: 'None', meds: 'None' },
  { name: 'Uday Kotak', gender: 'Male', blood_group: 'O-', city: 'Nariman Point, Mumbai, MH', phone: '+91 9820412345', dob: '1986-03-15', eligible: true, weight: 78.0, last_donation: '2026-04-18', illness: 'None', meds: 'None' },
  { name: 'Vidya Balan', gender: 'Female', blood_group: 'A-', city: 'Chembur, Mumbai, MH', phone: '+91 9820512345', dob: '1993-01-01', eligible: true, weight: 63.0, last_donation: '2026-07-15', illness: 'None', meds: 'None' },
  { name: 'Waseem Jaffer', gender: 'Male', blood_group: 'AB-', city: 'Worli, Mumbai, MH', phone: '+91 9820612345', dob: '1989-02-16', eligible: false, weight: 70.0, last_donation: '2026-09-10', illness: 'Sinusitis', meds: 'Antibiotics' },
  { name: 'Yamini Krishnamurthy', gender: 'Female', blood_group: 'B-', city: 'Mylapore, Chennai, TN', phone: '+91 9840012345', dob: '1996-12-20', eligible: true, weight: 54.0, last_donation: '2026-01-22', illness: 'None', meds: 'None' },
  { name: 'Zakir Khan', gender: 'Male', blood_group: 'AB+', city: 'Indore, MP', phone: '+91 9826112345', dob: '1992-08-20', eligible: true, weight: 84.0, last_donation: '2026-06-14', illness: 'None', meds: 'None' },
  { name: 'Aakash Chopra', gender: 'Male', blood_group: 'O+', city: 'Noida, UP', phone: '+91 9811012345', dob: '1988-09-19', eligible: true, weight: 75.0, last_donation: '2026-05-19', illness: 'None', meds: 'None' },
  { name: 'Bipasha Basu', gender: 'Female', blood_group: 'A+', city: 'Salt Lake, Kolkata, WB', phone: '+91 9831112345', dob: '1994-01-07', eligible: true, weight: 60.0, last_donation: '2026-03-22', illness: 'None', meds: 'None' },
  { name: 'Chetan Bhagat', gender: 'Male', blood_group: 'B+', city: 'Vasant Vihar, New Delhi, DL', phone: '+91 9810112345', dob: '1987-04-22', eligible: true, weight: 81.0, last_donation: '2026-04-10', illness: 'None', meds: 'None' },
  { name: 'Dia Mirza', gender: 'Female', blood_group: 'O-', city: 'Banjara Hills, Hyderabad, TS', phone: '+91 9849012345', dob: '1995-12-09', eligible: true, weight: 53.5, last_donation: '2026-06-30', illness: 'None', meds: 'None' },
  { name: 'Esha Deol', gender: 'Female', blood_group: 'A-', city: 'Juhu Scheme, Mumbai, MH', phone: '+91 9820712345', dob: '1996-11-02', eligible: true, weight: 56.0, last_donation: null, illness: 'None', meds: 'None' },
  { name: 'Fardeen Khan', gender: 'Male', blood_group: 'AB-', city: 'Santacruz, Mumbai, MH', phone: '+91 9820812345', dob: '1991-03-08', eligible: true, weight: 77.0, last_donation: '2026-05-27', illness: 'None', meds: 'None' },
  { name: 'Govinda Ahuja', gender: 'Male', blood_group: 'B-', city: 'Virar, Mumbai, MH', phone: '+91 9820912345', dob: '1986-12-21', eligible: true, weight: 83.0, last_donation: '2026-02-11', illness: 'None', meds: 'None' },
  { name: 'Huma Qureshi', gender: 'Female', blood_group: 'AB+', city: 'Kalkaji, New Delhi, DL', phone: '+91 9810212345', dob: '1997-07-28', eligible: true, weight: 62.0, last_donation: '2026-06-10', illness: 'None', meds: 'None' },
  { name: 'Irani Boman', gender: 'Male', blood_group: 'O+', city: 'Dadar, Mumbai, MH', phone: '+91 9821112345', dob: '1985-12-02', eligible: true, weight: 85.0, last_donation: '2026-04-15', illness: 'None', meds: 'None' },
  { name: 'Juhi Chawla', gender: 'Female', blood_group: 'A+', city: 'Malabar Hill, Mumbai, MH', phone: '+91 9821212345', dob: '1992-11-13', eligible: true, weight: 57.0, last_donation: '2026-07-01', illness: 'None', meds: 'None' },
  { name: 'Kapil Dev', gender: 'Male', blood_group: 'B+', city: 'Sector 17, Chandigarh, CH', phone: '+91 9814112345', dob: '1984-01-06', eligible: true, weight: 80.0, last_donation: '2026-03-05', illness: 'None', meds: 'None' },
  { name: 'Lara Dutta', gender: 'Female', blood_group: 'O-', city: 'Indiranagar, Bengaluru, KA', phone: '+91 9845212345', dob: '1996-04-16', eligible: true, weight: 58.0, last_donation: '2026-05-12', illness: 'None', meds: 'None' }
];

// Helper to assemble full donor and user objects
const generatedUsers = [];
const generatedDonors = [];
const generatedScreenings = [];

// Starting user id after staff users (id 5 onwards)
donorTemplates.forEach((t, idx) => {
  const userId = idx + 5;
  const donorId = idx + 1;
  const emailName = t.name.toLowerCase().replace(/[^a-z0-9]/g, '.');
  const email = `${emailName}@example.com`;

  generatedUsers.push({
    id: userId,
    name: t.name,
    email,
    password: DEFAULT_PASSWORD_HASH,
    role: 'donor',
    created_at: new Date(Date.now() - (idx * 3 * 24 * 60 * 60 * 1000)).toISOString()
  });

  const eligibilityStatus = t.eligible ? 'Eligible' : 'Not Eligible';

  generatedDonors.push({
    id: donorId,
    user_id: userId,
    name: t.name,
    email,
    phone: t.phone,
    date_of_birth: t.dob,
    gender: t.gender,
    blood_group: t.blood_group,
    address: `${100 + idx} Healthcare Way, ${t.city}`,
    eligibility_status: eligibilityStatus,
    last_donation_date: t.last_donation,
    created_at: new Date(Date.now() - (idx * 3 * 24 * 60 * 60 * 1000)).toISOString(),
    updated_at: new Date().toISOString()
  });

  // Calculate age from dob
  const birthYear = parseInt(t.dob.split('-')[0]);
  const currentAge = 2026 - birthYear;

  generatedScreenings.push({
    id: donorId,
    donor_id: donorId,
    age: currentAge,
    weight: t.weight,
    recent_illness: t.illness,
    medication: t.meds,
    recent_donation: t.last_donation ? 'Within 6 months' : 'None',
    eligible: t.eligible,
    screening_date: t.last_donation 
      ? `${t.last_donation} 10:00:00` 
      : new Date(Date.now() - (idx * 2 * 24 * 60 * 60 * 1000)).toISOString()
  });
});

// 2. Complete Aggregated Blood Inventory (32 categories: 8 blood groups * 4 components)
const ALL_BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const COMPONENTS = ['Whole Blood', 'RBC', 'Plasma', 'Platelets'];

// Pre-defined realistic stock quantities ensuring proper variation and clear low-stock alerts (< 5 units)
const inventoryMap = {
  'O+_Whole Blood': { avail: 14, res: 3, quar: 1 },
  'O+_RBC': { avail: 18, res: 2, quar: 2 },
  'O+_Plasma': { avail: 12, res: 1, quar: 0 },
  'O+_Platelets': { avail: 8, res: 1, quar: 1 },

  'O-_Whole Blood': { avail: 2, res: 1, quar: 0 },   // LOW STOCK!
  'O-_RBC': { avail: 3, res: 2, quar: 1 },           // LOW STOCK!
  'O-_Plasma': { avail: 6, res: 0, quar: 0 },
  'O-_Platelets': { avail: 4, res: 0, quar: 1 },     // LOW STOCK!

  'A+_Whole Blood': { avail: 12, res: 2, quar: 0 },
  'A+_RBC': { avail: 16, res: 4, quar: 1 },
  'A+_Plasma': { avail: 10, res: 1, quar: 0 },
  'A+_Platelets': { avail: 7, res: 0, quar: 1 },

  'A-_Whole Blood': { avail: 5, res: 2, quar: 0 },
  'A-_RBC': { avail: 6, res: 1, quar: 1 },
  'A-_Plasma': { avail: 7, res: 0, quar: 0 },
  'A-_Platelets': { avail: 3, res: 1, quar: 1 },     // LOW STOCK!

  'B+_Whole Blood': { avail: 11, res: 2, quar: 1 },
  'B+_RBC': { avail: 15, res: 3, quar: 0 },
  'B+_Plasma': { avail: 9, res: 1, quar: 0 },
  'B+_Platelets': { avail: 6, res: 0, quar: 2 },

  'B-_Whole Blood': { avail: 3, res: 1, quar: 0 },   // LOW STOCK!
  'B-_RBC': { avail: 5, res: 1, quar: 0 },
  'B-_Plasma': { avail: 6, res: 0, quar: 0 },
  'B-_Platelets': { avail: 4, res: 0, quar: 1 },     // LOW STOCK!

  'AB+_Whole Blood': { avail: 8, res: 1, quar: 0 },
  'AB+_RBC': { avail: 10, res: 2, quar: 1 },
  'AB+_Plasma': { avail: 14, res: 2, quar: 0 },
  'AB+_Platelets': { avail: 5, res: 1, quar: 0 },

  'AB-_Whole Blood': { avail: 4, res: 1, quar: 0 },  // LOW STOCK!
  'AB-_RBC': { avail: 5, res: 1, quar: 1 },
  'AB-_Plasma': { avail: 7, res: 0, quar: 0 },
  'AB-_Platelets': { avail: 2, res: 0, quar: 3 },    // LOW STOCK!
};

const generatedInventory = [];
let invSeq = 1;

ALL_BLOOD_GROUPS.forEach(bg => {
  COMPONENTS.forEach(comp => {
    const key = `${bg}_${comp}`;
    const counts = inventoryMap[key] || { avail: 6, res: 1, quar: 0 };
    generatedInventory.push({
      id: invSeq++,
      blood_group: bg,
      component_type: comp,
      available_units: counts.avail,
      reserved_units: counts.res,
      quarantine_units: counts.quar
    });
  });
});

// 3. Itemized Blood Units (60+ detailed blood bag records)
const rawUnits = [
  { bg: 'O+', comp: 'Whole Blood', daysAgo: 5, expiryDays: 30, status: 'Available', qty: 4 },
  { bg: 'O+', comp: 'RBC', daysAgo: 8, expiryDays: 34, status: 'Available', qty: 6 },
  { bg: 'O+', comp: 'Plasma', daysAgo: 15, expiryDays: 350, status: 'Available', qty: 5 },
  { bg: 'O+', comp: 'Platelets', daysAgo: 1, expiryDays: 4, status: 'Available', qty: 3 },
  { bg: 'O+', comp: 'Whole Blood', daysAgo: 2, expiryDays: 33, status: 'Reserved', qty: 2 },
  { bg: 'O+', comp: 'RBC', daysAgo: 1, expiryDays: 41, status: 'Quarantine', qty: 2 },

  { bg: 'O-', comp: 'Whole Blood', daysAgo: 3, expiryDays: 32, status: 'Available', qty: 2 },
  { bg: 'O-', comp: 'RBC', daysAgo: 6, expiryDays: 36, status: 'Available', qty: 3 },
  { bg: 'O-', comp: 'RBC', daysAgo: 2, expiryDays: 40, status: 'Reserved', qty: 1 },
  { bg: 'O-', comp: 'Platelets', daysAgo: 2, expiryDays: 3, status: 'Available', qty: 2 },
  { bg: 'O-', comp: 'Whole Blood', daysAgo: 45, expiryDays: -5, status: 'Expired', qty: 1 }, // EXPIRED!

  { bg: 'A+', comp: 'Whole Blood', daysAgo: 4, expiryDays: 31, status: 'Available', qty: 5 },
  { bg: 'A+', comp: 'RBC', daysAgo: 9, expiryDays: 33, status: 'Available', qty: 7 },
  { bg: 'A+', comp: 'Plasma', daysAgo: 20, expiryDays: 345, status: 'Available', qty: 6 },
  { bg: 'A+', comp: 'Platelets', daysAgo: 1, expiryDays: 4, status: 'Available', qty: 4 },
  { bg: 'A+', comp: 'RBC', daysAgo: 3, expiryDays: 39, status: 'Reserved', qty: 3 },
  { bg: 'A+', comp: 'Whole Blood', daysAgo: 50, expiryDays: -10, status: 'Expired', qty: 2 }, // EXPIRED!

  { bg: 'A-', comp: 'Whole Blood', daysAgo: 7, expiryDays: 28, status: 'Available', qty: 3 },
  { bg: 'A-', comp: 'RBC', daysAgo: 10, expiryDays: 32, status: 'Available', qty: 4 },
  { bg: 'A-', comp: 'Platelets', daysAgo: 2, expiryDays: 3, status: 'Available', qty: 2 },
  { bg: 'A-', comp: 'Whole Blood', daysAgo: 4, expiryDays: 31, status: 'Reserved', qty: 2 },
  { bg: 'A-', comp: 'RBC', daysAgo: 1, expiryDays: 41, status: 'Quarantine', qty: 1 },

  { bg: 'B+', comp: 'Whole Blood', daysAgo: 6, expiryDays: 29, status: 'Available', qty: 4 },
  { bg: 'B+', comp: 'RBC', daysAgo: 11, expiryDays: 31, status: 'Available', qty: 6 },
  { bg: 'B+', comp: 'Plasma', daysAgo: 25, expiryDays: 340, status: 'Available', qty: 5 },
  { bg: 'B+', comp: 'Platelets', daysAgo: 2, expiryDays: 3, status: 'Available', qty: 3 },
  { bg: 'B+', comp: 'Whole Blood', daysAgo: 2, expiryDays: 33, status: 'Reserved', qty: 2 },
  { bg: 'B+', comp: 'Platelets', daysAgo: 1, expiryDays: 4, status: 'Quarantine', qty: 2 },

  { bg: 'B-', comp: 'Whole Blood', daysAgo: 4, expiryDays: 31, status: 'Available', qty: 2 },
  { bg: 'B-', comp: 'RBC', daysAgo: 8, expiryDays: 34, status: 'Available', qty: 3 },
  { bg: 'B-', comp: 'Platelets', daysAgo: 1, expiryDays: 4, status: 'Available', qty: 2 },
  { bg: 'B-', comp: 'Whole Blood', daysAgo: 1, expiryDays: 34, status: 'Reserved', qty: 1 },
  { bg: 'B-', comp: 'Plasma', daysAgo: 400, expiryDays: -30, status: 'Expired', qty: 1 }, // EXPIRED!

  { bg: 'AB+', comp: 'Whole Blood', daysAgo: 5, expiryDays: 30, status: 'Available', qty: 4 },
  { bg: 'AB+', comp: 'RBC', daysAgo: 7, expiryDays: 35, status: 'Available', qty: 5 },
  { bg: 'AB+', comp: 'Plasma', daysAgo: 18, expiryDays: 347, status: 'Available', qty: 8 },
  { bg: 'AB+', comp: 'Platelets', daysAgo: 2, expiryDays: 3, status: 'Available', qty: 3 },
  { bg: 'AB+', comp: 'Plasma', daysAgo: 3, expiryDays: 362, status: 'Reserved', qty: 2 },

  { bg: 'AB-', comp: 'Whole Blood', daysAgo: 6, expiryDays: 29, status: 'Available', qty: 2 },
  { bg: 'AB-', comp: 'RBC', daysAgo: 9, expiryDays: 33, status: 'Available', qty: 3 },
  { bg: 'AB-', comp: 'Platelets', daysAgo: 1, expiryDays: 4, status: 'Available', qty: 1 },
  { bg: 'AB-', comp: 'Platelets', daysAgo: 1, expiryDays: 4, status: 'Quarantine', qty: 3 },
  { bg: 'AB-', comp: 'RBC', daysAgo: 2, expiryDays: 40, status: 'Reserved', qty: 1 },
  { bg: 'AB-', comp: 'Platelets', daysAgo: 10, expiryDays: -3, status: 'Expired', qty: 2 } // EXPIRED!
];

const generatedBloodUnits = [];
let unitSeq = 1;

rawUnits.forEach((u) => {
  const colDate = new Date(Date.now() - (u.daysAgo * 24 * 60 * 60 * 1000));
  const expDate = new Date(Date.now() + (u.expiryDays * 24 * 60 * 60 * 1000));

  generatedBloodUnits.push({
    id: unitSeq++,
    blood_group: u.bg,
    component_type: u.comp,
    collection_date: colDate.toISOString().split('T')[0],
    expiry_date: expDate.toISOString().split('T')[0],
    status: u.status,
    quantity: u.qty,
    created_at: colDate.toISOString()
  });
});

module.exports = {
  DEFAULT_PASSWORD_HASH,
  staffUsers,
  generatedUsers,
  allUsers: [...staffUsers, ...generatedUsers],
  generatedDonors,
  generatedScreenings,
  generatedInventory,
  generatedBloodUnits
};
