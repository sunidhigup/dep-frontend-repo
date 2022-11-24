import {
  Breadcrumbs,
  Table,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
// import { makeStyles } from "@mui/styles";
import { Box } from "@mui/system";
import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { BatchContext } from "../../context/BatchProvider";
import { JobContext } from "../../context/JobProvider";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

// const useStyles = makeStyles({
//   rightComponent: {
//     flex: 4,
//     overflowY: "scroll",
//     backgroundColor: "#e9ecef !important",
//     maxHeight: "88vh",
//     minHeight: "88vh",
//     marginTop: "10px",
//     marginRight: "10px",
//     marginLeft: "10px",
//     borderRadius: "10px",
//     "&::-webkit-scrollbar": {
//       width: "0.4em",
//     },
//     "&::-webkit-scrollbar-track": {
//       "-webkit-box-shadow": "inset 0 0 6px rgba(0,0,0,0.00)",
//       borderRadius: "10px",
//     },
//     "&::-webkit-scrollbar-thumb": {
//       backgroundColor: "#0dd398",
//       borderRadius: "10px",
//     },
//   },
// });

const DropDownLogs = ({ logdate }) => {
//   const classes = useStyles();

  const { batch } = useContext(BatchContext);
  const { Job } = useContext(JobContext);
  const navigate = useNavigate();

  const handleMouseEnter = (e) => {
    e.target.style.color = "blue";
  };
  const handleMouseLeave = (e) => {
    e.target.style.color = "black";
  };

  return (
    <Box sx={{ backgroundColor: "#fff", borderRadius: "10px", p: 2 }}>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 700 }} aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell>S.NO</StyledTableCell>
              <StyledTableCell align="left">TimeStamp</StyledTableCell>
              <StyledTableCell align="left">Action</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logdate &&
              logdate.map((log, lidx) => (
                <StyledTableRow key={lidx}>
                  <StyledTableCell component="th" scope="row">
                    {lidx + 1}
                  </StyledTableCell>
                  <StyledTableCell align="left">
                    {log.timestamp}
                    <span style={{ fontWeight: "800" }}>
                      {lidx === 0 && " (Latest)"}
                    </span>
                  </StyledTableCell>
                  <Link
                    to={`/logs/rule-engine-logs/${batch}/${log.logstream}`}
                    style={{ textDecoration: "none" }}
                  >
                    {/* <StyledTableCell onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} align="left">{log.label}</StyledTableCell> */}
                    <StyledTableCell
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                      align="left"
                    >
                      <ArrowCircleRightIcon />
                    </StyledTableCell>
                  </Link>
                </StyledTableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default DropDownLogs;
