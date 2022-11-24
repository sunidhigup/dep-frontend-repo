import axios from 'axios';
import BASEURL from '../BaseUrl';
import { logoutApi } from './AuthApi';

export const getFlowBuilderLogStreamApi = async (prefix) => {
  try {
    // return await axios.get(`${BASEURL}/logs/step-logs/${prefix}`, {
    //   withCredentials: true,
    // });

    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(`${BASEURL}/logs/get-prefixlog/dataProcessor/${prefix}`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};
export const getFlowBuilderLogStreamApiStatus = async (execution_id) => {
  try {
    // return await axios.get(`${BASEURL}/logs/step-logs/${prefix}`, {
    //   withCredentials: true,
    // });

    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(`${BASEURL}/logs/dataProcessor/status`, {
      params: { id: execution_id },
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const getFlowBuilderLogEventApi = async (logstream) => {
  try {
    // return await axios.get(`${BASEURL}/logs/step-logs-events/${logstream}`, {
    //   withCredentials: true,
    // });

    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(`${BASEURL}/logs/get-logs/dataProcessor/${logstream}`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const getFlowBuilderEmrLogListApi = async (batch, Job) => {
  try {
    // return await axios.get(`${BASEURL}/logs/emr-log-list/${batch}/${Job}`, {
    //   withCredentials: true,
    // });

    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(`${BASEURL}/logs/emr-log-list/${batch}/${Job}`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const getFlowBuilderEmrLogClustersApi = async (logPath) => {
  try {
    // return await axios.post(`${BASEURL}/logs/emr-log-cluster`,logPath, {
    //   withCredentials: true,
    // });

    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.post(`${BASEURL}/logs/emr-log-cluster`, logPath, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const getRuleEngineLogStreamApi = async (prefix) => {
  try {
    // return await axios.get(`${BASEURL}/logs/rule-engine-logs/${prefix}`, {
    //   withCredentials: true,
    // });

    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(`${BASEURL}/logs/get-prefixlog/ruleEngine/${prefix}`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const getRuleEngineLogStreamApiStatus = async (execution_id) => {
  try {
    // return await axios.get(`${BASEURL}/logs/rule-engine-logs/${prefix}`, {
    //   withCredentials: true,
    // });

    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(`${BASEURL}/logs/ruleEngine/status`, {
      params: { id: execution_id },
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const fetchJobStatus = async (id) => {
  try {
    // return await axios.get(`${BASEURL}/logs/rule-engine-logs/${prefix}`, {
    //   withCredentials: true,
    // });

    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(`${BASEURL}/pre-processor/fetch-preprocess/${id}`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 403) {
      await logoutApi();
    }

    throw error;
  }
};

export const getRuleEngineLogEventApi = async (logstream) => {
  try {
    // return await axios.get(`${BASEURL}/logs/rule-engine-logs/${logstream}`, {
    //   withCredentials: true,
    // });

    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(`${BASEURL}/logs/get-logs/ruleEngine/${logstream}`, {
      params: { lambdaLog: false },
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const getPreprocessLogStreamApi = async (prefix) => {
  try {
    // return await axios.get(`${BASEURL}/logs/rule-engine-logs/${prefix}`, {
    //   withCredentials: true,
    // });
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));

    return await axios.get(`${BASEURL}/logs/get-prefixlog/preprocessor/${prefix}`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const getPreprocessLogEventApi = async (logstream) => {
  try {
    // return await axios.get(`${BASEURL}/logs/rule-engine-logs/${logstream}`, {
    //   withCredentials: true,
    // });
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));

    return await axios.get(`${BASEURL}/logs/get-logs/preprocessor/${logstream}`, {
      params: { lambdaLog: false },
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const getPreprocessLambdaLogEventApi = async (logstream) => {
  try {
    // return await axios.get(`${BASEURL}/logs/rule-engine-logs/${logstream}`, {
    //   withCredentials: true,
    // });
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));

    return await axios.get(`${BASEURL}/logs/get-logs/preprocessor/${logstream}`, {
      params: { lambdaLog: true },
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const getPreprocessContentLogEventApi = async (logstream) => {
  try {
    // return await axios.get(`${BASEURL}/logs/rule-engine-logs/${logstream}`, {
    //   withCredentials: true,
    // });
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));

    return await axios.get(`${BASEURL}/logs/get-logs/preprocessor/${logstream}`, {
      params: { contentLog: true },
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const getPreprocessStructureLogEventApi = async (logstream) => {
  try {
    // return await axios.get(`${BASEURL}/logs/rule-engine-logs/${logstream}`, {
    //   withCredentials: true,
    // });
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));

    return await axios.get(`${BASEURL}/logs/get-logs/preprocessor/${logstream}`, {
      params: { structurLog: true },
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const getPreprocessorLogStreamApiStatus = async (executionid) => {
  try {
    // return await axios.get(`${BASEURL}/logs/rule-engine-logs/${logstream}`, {
    //   withCredentials: true,
    // });
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));

    return await axios.get(`${BASEURL}/logs/preProcessor/status`, {
      params: { id: executionid },
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};
