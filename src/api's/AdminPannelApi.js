import axios from "axios";
import BASEURL from "../BaseUrl";

export const CheckSecretKeyExist = async (keyname) => {
    try {
        const parseToken = JSON.parse(localStorage.getItem("jwtToken"));
        return await axios.get(`${BASEURL}/connection/check-key-name`, { params: { secretkey: keyname }, headers: { "Authorization": `Bearer ${parseToken}` } });
    } catch (error) {
        if (error.response.status === 404) {
            throw error.response;
        }
    }
};

export const GetConnectionData = async (connectionType, userName) => {
    try {
        const parseToken = JSON.parse(localStorage.getItem("jwtToken"));
        return await axios.get(`${BASEURL}/connection/get-connection`, { params: { connectionType, userName }, headers: { "Authorization": `Bearer ${parseToken}` } });
    } catch (error) {
        if (error.response.status === 404) {
            throw error.response;
        }
    }
};
export const GetSecretData = async (connectionType) => {
    try {
        const parseToken = JSON.parse(localStorage.getItem("jwtToken"));
        return await axios.get(`${BASEURL}/connection/get-secret`, { params: { "secretkey": connectionType }, headers: { "Authorization": `Bearer ${parseToken}` } });
    } catch (error) {
        if (error.response.status === 404) {
            throw error.response;
        }
    }
};

export const createAwsSecretmangerCredential = async (values, keyname) => {
    try {
        const data = {
            "awsAccessKey": values.access_key,
            "awsSecretKey": values.secret_key
        }
        const parseToken = JSON.parse(localStorage.getItem("jwtToken"));
        return await axios.post(`${BASEURL}/connection/create-aws-credential-secret-manager`, data, { params: { secretkey: keyname }, headers: { "Authorization": `Bearer ${parseToken}` } });
    } catch (error) {
        if (error.response.status === 500) {
            throw error.response;
        }
    }
};

export const createSnowflakeSecretmangerCredential = async (values, keyname) => {
    try {
        const data = {
            "user": values.user,
            "password": values.password,
            "db": values.db,
            "role": values.role,
            "warehouse": values.warehouse
        }
        const parseToken = JSON.parse(localStorage.getItem("jwtToken"));
        return await axios.post(`${BASEURL}/connection/create-snowflake-credential-secret-manager`, data, { params: { secretkey: keyname }, headers: { "Authorization": `Bearer ${parseToken}` } });
    } catch (error) {
        if (error.response.status === 500) {
            throw error.response;
        }
    }
};
export const createAwsSnowFlakeCredentialDynamo = async (connectionName, connectionType, userName) => {
    try {
        const data = {
            connectionName,
            connectionType,
            userName
        }
        const parseToken = JSON.parse(localStorage.getItem("jwtToken"));
        return await axios.post(`${BASEURL}/connection/create-aws-snowflake-credential-dynamo`, data, { headers: { "Authorization": `Bearer ${parseToken}` } });
    } catch (error) {
        if (error.response.status === 500) {
            throw error.response;
        }
    }
};


export const updateAwsSecretMangerCredential = async (values, keyname) => {
    try {
        console.log(values)
        const data = {
            "awsAccessKey": values.awsAccessKey,
            "awsSecretKey": values.awsSecretKey
        }
        const parseToken = JSON.parse(localStorage.getItem("jwtToken"));
        return await axios.put(`${BASEURL}/connection/update-aws-credential-secret-manager`, data, { params: { secretkey: keyname }, headers: { "Authorization": `Bearer ${parseToken}` } });
    } catch (error) {
        if (error.response.status === 500) {
            throw error.response;
        }
    }
};
export const updateSnowFlakeSecretMangerCredential = async (values, keyname) => {
    try {
        const data = {
            "user": values.user,
            "password": values.password,
            "db": values.db,
            "role": values.role,
            "warehouse": values.warehouse
        }
        const parseToken = JSON.parse(localStorage.getItem("jwtToken"));
        return await axios.put(`${BASEURL}/connection/update-snowflake-credential-secret-manager`, data, { params: { secretkey: keyname }, headers: { "Authorization": `Bearer ${parseToken}` } });
    } catch (error) {
        if (error.response.status === 500) {
            throw error.response;
        }
    }
};