import axios from "axios";
import DATAMESH_BASEURL from "../DataMeshUrl";
import { logoutApi } from './AuthApi';

export const getSalesToken = async (email, password) => {
    try {
        // const parseToken = JSON.parse(localStorage.getItem("jwtToken"));
        const data = { email, password }
        return axios.post(`${DATAMESH_BASEURL}/salesuser/get/token`, data)
    } catch (error) {
        if (error.response.status === 401) {
            await logoutApi();
        }

        throw error;
    }
};

export const getCustomersToken = async (email, password) => {
    try {
        // const parseToken = JSON.parse(localStorage.getItem("jwtToken"));
        const data = { email, password }
        return await axios.post(`${DATAMESH_BASEURL}/customeruser/get/token`, data)
    } catch (error) {
        if (error.response.status === 401) {
            await logoutApi();
        }

        throw error;
    }
};



export const getSalesSecretToken = async (secret_key) => {
    try {
        // const parseToken = JSON.parse(localStorage.getItem("jwtToken"));
        const data = { secret: secret_key }
        return await axios.post(`${DATAMESH_BASEURL}/salesuser/get/secrettoken`, data);
    } catch (error) {
        if (error.response.status === 401) {
            await logoutApi();
        }

        throw error;
    }
};

export const getCustomersSecretToken = async (secret_key) => {
    try {
        // const parseToken = JSON.parse(localStorage.getItem("jwtToken"));
        const data = { secret: secret_key }
        return await axios.post(`${DATAMESH_BASEURL}/customeruser/get/secrettoken`, data);
    } catch (error) {
        if (error.response.status === 401) {
            await logoutApi();
        }

        throw error;
    }
};

export const getSalesMetaData = async (DomainType, Db, Table, token) => {
    try {
        // const parseToken = JSON.parse(localStorage.getItem("jwtToken"));
        const res = await axios.get(`${DATAMESH_BASEURL}/${DomainType}/${Db}/${Table}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

        console.log(res.data)
        return res
    } catch (error) {
        if (error.response.status === 401) {
            await logoutApi();
        }
        throw error;
    }
};

export const getCustomersMetaData = async (DomainType, Db, Table, token) => {
    try {
        // const parseToken = JSON.parse(localStorage.getItem("jwtToken"));
        return await axios.get(`${DATAMESH_BASEURL}/${DomainType}/${Db}/${Table}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
    } catch (error) {
        if (error.response.status === 401) {
            await logoutApi();
        }
        throw error;
    }
};

export const getDatabaseByDomain = async (DomainType, Acc_token) => {
    try {
        // const parseToken = JSON.parse(localStorage.getItem("jwtToken"));
        return await axios.get(`${DATAMESH_BASEURL}/${DomainType}/databases`, {
            headers: {
                Authorization: `Bearer ${Acc_token}`
            }
        })
    } catch (error) {
        if (error.response.status === 401) {
            await logoutApi();
        }
        throw error;
    }
};

export const getTableByDomainAndDatabase = async (DomainType, newdb, Acc_token) => {
    try {
        // const parseToken = JSON.parse(localStorage.getItem("jwtToken"));
        return await axios.get(`${DATAMESH_BASEURL}/${DomainType}/${newdb}/tablename`, {
            headers: {
                Authorization: `Bearer ${Acc_token}`
            }
        })
    } catch (error) {
        if (error.response.status === 401) {
            await logoutApi();
        }
        throw error;
    }
};

export const getTableDataByTable = async (DomainType, Db, Table, secret_token) => {
    try {
        // const parseToken = JSON.parse(localStorage.getItem("jwtToken"));
        return await axios.get(`${DATAMESH_BASEURL}/${DomainType}/${Db}/${Table}/*/%20`, {
            headers: {
                Authorization: `Bearer ${secret_token}`
            }
        })
    }
    catch (error) {
        if (error.response.status === 401) {
            await logoutApi();
        }
        throw error;
    }
};

export const getExecuteSqlData = async (DomainType, value, secret_token) => {
    try {
        // const parseToken = JSON.parse(localStorage.getItem("jwtToken"));
        return await axios.get(`${DATAMESH_BASEURL}/${DomainType}/${value}`, {
            headers: {
                Authorization: `Bearer ${secret_token}`
            }
        })
    }
    catch (error) {
        if (error.response.status === 401) {
            await logoutApi();
        }
        throw error;
    }
};

export const postSaveFilePath = async (DomainType, DomainUserName) => {
    try {
        // const parseToken = JSON.parse(localStorage.getItem("jwtToken"));
        const data = { "email": DomainUserName }
        return await axios.post(`${DATAMESH_BASEURL}/${DomainType}/domain/user`, data)
    }
    catch (error) {
        if (error.response.status === 401) {
            await logoutApi();
        }
        throw error;
    }
};

export const postSaveFilePathAndFileName = async (DomainType, FilePath, FileName) => {
    try {
        // const parseToken = JSON.parse(localStorage.getItem("jwtToken"));
        const data = {
            "path": FilePath,
            "filename": FileName
        }
        return await axios.post(`${DATAMESH_BASEURL}/${DomainType}/save`, data)
    }
    catch (error) {
        if (error.response.status === 401) {
            await logoutApi();
        }
        throw error;
    }
};