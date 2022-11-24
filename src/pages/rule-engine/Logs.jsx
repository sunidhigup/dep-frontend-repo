import React, { useContext, useEffect, useState } from "react";
// import { makeStyles } from "@mui/styles";
import { Box } from "@mui/system";
import axios from "axios";
import BASEURL from "../../BaseUrl";
import { BatchContext } from "../../context/BatchProvider";
import TableAccordion from "./TableAccordion";

// const useStyles = makeStyles({
//     rightComponent: {
//         flex: 4,
//         overflowY: "scroll",
//         backgroundColor: "#e9ecef !important",
//         maxHeight: "88vh",
//         minHeight: "88vh",

//         borderRadius: "10px",
//         "&::-webkit-scrollbar": {
//             width: "0.4em",
//         },
//         "&::-webkit-scrollbar-track": {
//             "-webkit-box-shadow": "inset 0 0 6px rgba(0,0,0,0.00)",
//             borderRadius: "10px",
//         },
//         "&::-webkit-scrollbar-thumb": {
//             backgroundColor: "#c1d3fe",
//             borderRadius: "10px",
//         }
//     },
//     component: {
//         display: "flex",
//         flexDirection: "column",
//         backgroundColor: "#fff",
//         borderRadius: "10px",
//         overflow: "hidden",
//     },
//     upperComponent: {
//         display: "flex",
//         justifyContent: "space-between",
//         borderBottom: "5px solid #e9ecef",
//         padding: "10px 20px",
//     },
// });
const Logs = () => {
    // const classes = useStyles();
    const { batch } = useContext(BatchContext);
    const [tableAccordion, setTableAccordion] = useState([]);

    const fetchTableRule = async () => {
        const response = await axios.get(
            `${BASEURL}/table-rule/get-table-rule/${batch}`
        );
        if (response.status === 200) {
            setTableAccordion(response.data);
            //   console.log(response.data);
        }
    };

    useEffect(() => {
        fetchTableRule();
    }, []);
    return (
        <>
            <Box>
                <Box style={{
                    display: "flex",
                    flexDirection: "column",
                    backgroundColor: "#fff",
                    borderRadius: "10px",
                    overflow: "hidden",
                }}>
                    <Box style={{
                        display: "flex",
                        justifyContent: "space-between",
                        borderBottom: "5px solid #e9ecef",
                        padding: "10px 20px"
                    }}>
                        <TableAccordion data={tableAccordion} />
                    </Box>
                </Box>
            </Box>
        </>
    );
};

export default Logs;
