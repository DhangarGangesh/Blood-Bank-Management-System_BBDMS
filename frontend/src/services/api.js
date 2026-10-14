const API_BASE_URL = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('bbdms_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const api = {
  // Auth API
  register: async (donorData) => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(donorData)
    });
    return res.json();
  },

  login: async (credentials) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(credentials)
    });
    return res.json();
  },

  // Donor API
  getAllDonors: async () => {
    const res = await fetch(`${API_BASE_URL}/donors`, {
      headers: getHeaders()
    });
    return res.json();
  },

  getDonor: async (id) => {
    const res = await fetch(`${API_BASE_URL}/donors/${id}`, {
      headers: getHeaders()
    });
    return res.json();
  },

  updateDonor: async (id, donorData) => {
    const res = await fetch(`${API_BASE_URL}/donors/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(donorData)
    });
    return res.json();
  },

  submitScreening: async (id, screeningData) => {
    const res = await fetch(`${API_BASE_URL}/donors/${id}/screening`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(screeningData)
    });
    return res.json();
  },

  getScreenings: async (id) => {
    const res = await fetch(`${API_BASE_URL}/donors/${id}/screening`, {
      headers: getHeaders()
    });
    return res.json();
  },

  // Inventory API
  getInventory: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.bloodGroup) params.append('bloodGroup', filters.bloodGroup);
    if (filters.componentType) params.append('componentType', filters.componentType);
    if (filters.status) params.append('status', filters.status);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE_URL}/inventory${queryString}`, {
      headers: getHeaders()
    });
    return res.json();
  },

  addBloodUnit: async (unitData) => {
    const res = await fetch(`${API_BASE_URL}/inventory`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(unitData)
    });
    return res.json();
  },

  updateInventory: async (id, updateData) => {
    const res = await fetch(`${API_BASE_URL}/inventory/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updateData)
    });
    return res.json();
  },

  deleteBloodUnit: async (id) => {
    const res = await fetch(`${API_BASE_URL}/inventory/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return res.json();
  }
};
