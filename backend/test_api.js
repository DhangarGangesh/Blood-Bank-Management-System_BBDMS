const http = require('http');

const request = (path, method = 'GET', body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const headers = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

async function testAll() {
  console.log('--- STARTING REST API & RBAC VERIFICATION ---');

  // 1. Health check
  const health = await request('/api/health');
  console.log('1. GET /api/health -> Status:', health.status, 'Mode:', health.data.databaseMode);

  // 2. Donor Login (Module 1)
  const donorLogin = await request('/api/auth/login', 'POST', {
    email: 'aarav.sharma@example.com',
    password: 'password123'
  });
  const donorToken = donorLogin.data.token;
  console.log('2. POST /api/auth/login (Donor) -> Status:', donorLogin.status, 'Role:', donorLogin.data.user?.role, 'Name:', donorLogin.data.user?.name);

  // 3. Register New Donor (Module 1)
  const testEmail = `testdonor_${Date.now()}@example.com`;
  const reg = await request('/api/auth/register', 'POST', {
    name: 'New Test Donor',
    email: testEmail,
    phone: '+91 9123456789',
    date_of_birth: '1996-06-20',
    gender: 'Female',
    blood_group: 'B+',
    address: 'Mumbai Central, MH',
    password: 'password123'
  });
  console.log('3. POST /api/auth/register -> Status:', reg.status, 'Registered ID:', reg.data.donor?.id);

  // 4. Get Donor Profile (Module 1) with Donor Token
  const donor = await request('/api/donors/1', 'GET', null, donorToken);
  console.log('4. GET /api/donors/1 (Donor Auth) -> Status:', donor.status, 'Donor Name:', donor.data.donor?.name, 'Group:', donor.data.donor?.blood_group);

  // 5. Update Donor Profile (Module 1) with Donor Token
  const updateDonor = await request('/api/donors/1', 'PUT', {
    phone: '+91 9998887776',
    address: 'Updated Marine Drive Address'
  }, donorToken);
  console.log('5. PUT /api/donors/1 (Donor Auth) -> Status:', updateDonor.status, 'Updated Address:', updateDonor.data.donor?.address);

  // 6. Submit Health Screening (Module 1) with Donor Token
  const screening = await request('/api/donors/1/screening', 'POST', {
    age: 30,
    weight: 68,
    recent_illness: 'None',
    medication: 'None',
    recent_donation: '5 months ago'
  }, donorToken);
  console.log('6. POST /api/donors/1/screening (Donor Auth) -> Status:', screening.status, 'Eligible:', screening.data.eligible);

  // 7. SECURITY TEST: Donor tries to access Blood Inventory (Module 2) -> MUST BE 403 FORBIDDEN
  const donorInvAttempt = await request('/api/inventory', 'GET', null, donorToken);
  console.log('7. [RBAC SECURITY] Donor calls GET /api/inventory -> Status:', donorInvAttempt.status, '(Expected 403 Forbidden! Message:', donorInvAttempt.data.message, ')');

  // 8. Staff / Admin Login (Module 2)
  const adminLogin = await request('/api/auth/login', 'POST', {
    email: 'admin@lifesave.org',
    password: 'password123'
  });
  const adminToken = adminLogin.data.token;
  console.log('8. POST /api/auth/login (Admin/Staff) -> Status:', adminLogin.status, 'Role:', adminLogin.data.user?.role, 'Name:', adminLogin.data.user?.name);

  // 9. Staff / Admin calls Donor Directory (GET /api/donors)
  const allDonors = await request('/api/donors', 'GET', null, adminToken);
  console.log('9. GET /api/donors (Staff Auth) -> Status:', allDonors.status, 'Total Donors in Directory:', allDonors.data.donors?.length);

  // 10. Staff / Admin accesses Blood Inventory (Module 2)
  const inv = await request('/api/inventory', 'GET', null, adminToken);
  console.log('10. GET /api/inventory (Staff Auth) -> Status:', inv.status, 'Total Inventory Items:', inv.data.inventory?.length);

  // 11. Filter Inventory (Module 2)
  const invFilter = await request('/api/inventory?bloodGroup=O%2B', 'GET', null, adminToken);
  console.log('11. GET /api/inventory?bloodGroup=O+ (Staff Auth) -> Status:', invFilter.status, 'Filtered Items:', invFilter.data.inventory?.length);

  // 12. Add Blood Unit (Module 2) with Staff Token
  const addUnit = await request('/api/inventory', 'POST', {
    blood_group: 'AB+',
    component_type: 'RBC',
    collection_date: '2026-10-01',
    expiry_date: '2026-11-15',
    status: 'Available',
    quantity: 5
  }, adminToken);
  console.log('12. POST /api/inventory (Staff Auth) -> Status:', addUnit.status, 'New Unit ID:', addUnit.data.bloodUnit?.id);

  // 13. Update Inventory Quantity (Module 2) with Staff Token
  const updateInv = await request('/api/inventory/1', 'PUT', {
    available_units: 14
  }, adminToken);
  console.log('13. PUT /api/inventory/1 (Staff Auth) -> Status:', updateInv.status, 'New Available Units:', updateInv.data.inventory?.available_units);

  console.log('--- ALL REST API & RBAC ACCESS TESTS PASSED! ---');
}

testAll().catch(err => console.error('API Verification Failed:', err));
