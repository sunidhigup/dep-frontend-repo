import axios from "axios";
import BASEURL from "../BaseUrl";




export const signup = async (formData) => {
    try {
        return await axios.post(`${BASEURL}/auth/register`, formData);
    } catch (error) {
        if (error.response.status === 500) {
            throw error.response;
        }
    }
};

export const signin = async (formData) => {
    try {
        return await axios.post(`${BASEURL}/auth/authenticate`, formData);
    } catch (error) {
        if (error.response.status === 500) {
            throw error.response;
        }
    }
};

// export const mapping = async () => {
//     try {
//         return await axios.get(`${BASEURL}/connection/change-region`, { params: { region: "us-east-1" } });
//     } catch (error) {
//         if (error.response.status === 500) {
//             throw error.response;
//         }
//     }
// };