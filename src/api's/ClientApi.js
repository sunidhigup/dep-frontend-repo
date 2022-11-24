import axios from 'axios';
import { useContext } from 'react';
import BASEURL from '../BaseUrl';
import { logoutApi } from './AuthApi';

// const parseToken = JSON.parse(localStorage.getItem("jwtToken"));

export const createClientApi = async (data) => {
  try {
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));

    return await axios.post(`${BASEURL}/client/create-client`, data, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      // await logoutApi();
    }

    throw error;
  }
};

export const getClientBatchJobByUserIdApi = async (userId) => {
  try {
    // return await  axios.post(`${BASEURL}/client/create-client`, data , {
    //   withCredentials: true,
    // });

    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));

    return await axios.get(`${BASEURL}/client/get-info/${userId}`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const getClientByIdApi = async (id) => {
  try {
    // return await axios.get(`${BASEURL}/client/get-all-client` , {
    //   withCredentials: true,
    // });
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));

    return await axios.get(`${BASEURL}/client/get-by-id/${id}`, { headers: { Authorization: `Bearer ${parseToken}` } });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};
export const getClientApi = async () => {
  try {
    // return await axios.get(`${BASEURL}/client/get-all-client` , {
    //   withCredentials: true,
    // });
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));

    return await axios.get(`${BASEURL}/client/get-all-client`, { headers: { Authorization: `Bearer ${parseToken}` } });

    // return await axios.get(`${BASEURL}/client/get-all-client`);
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};
export const getApprovedClientApi = async () => {
  try {
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));

    return await axios.get(`${BASEURL}/client/get-approved-client`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const getClientByName = async (clientName) => {
  try {
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(`${BASEURL}/client/get-by-name/${clientName}`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const updateClientDetail = async (data, userId) => {
  try {
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.put(`${BASEURL}/client/update-client-detail/${userId}`, data, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const deleteClientApi = async (client_id) => {
  try {
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.delete(`${BASEURL}/client/delete-client-detail`, {
      params: { client_id },
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const getClientByUsername = async (user) => {
  try {
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(`${BASEURL}/client/get-client-by-username/${user}`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const getClientByUserId = async (userId) => {
  try {
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(`${BASEURL}/client/get-client-by-userid/${userId}`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const getApprovedClientApiByUserId = async (userId) => {
  try {
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));

    return await axios.get(`${BASEURL}/client/get-approved-client/${userId}`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const createClientByUserIdApi = async (data, id) => {
  try {
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));

    return await axios.post(`${BASEURL}/client/create-client/${id}`, data, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const grantClientAccessToUser = async (email, clientId) => {
  try {
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));

    return await axios.post(
      `${BASEURL}/client/approve-client/${email}/${clientId}`,
      {},
      {
        headers: { Authorization: `Bearer ${parseToken}` },
      }
    );
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }
    console.log(error);
    throw error;
  }
};
