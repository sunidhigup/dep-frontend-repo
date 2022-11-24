import {
    Box,
    Button,
    Checkbox,
    Chip,
    FormControl,
    InputLabel,
    MenuItem,
    Modal,
    OutlinedInput,
    Select,
    Stack,
    styled,
    Table,
    TableBody,
    TableCell,
    tableCellClasses,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
  } from '@mui/material';
  import AddCircleIcon from '@mui/icons-material/AddCircle';
  import React, { useState, useEffect, useCallback } from 'react';
  import LoadingIcon from '../../reusable-components/LoadingIcon';
  import AddNewRuleModal from '../../pages/modal/AddNewRuleModal';
  import RulesTable from '../../pages/table-rule/v1/RulesTable';
  import { getAllCustomRule, getCustomRuleByClientId } from "../../api's/CustomRuleApi";
  
  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 'fit-content',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };
  
  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: '#003566',
      color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14,
    },
  }));
  
  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    '&:last-child td, &:last-child th': {
      border: 0,
    },
  }));
  
  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      },
    },
  };
  
  function getStyles(name, rulename, theme) {
    return {
      fontWeight: rulename.indexOf(name) === -1 ? theme.typography.fontWeightRegular : theme.typography.fontWeightMedium,
    };
  }
  
  const INITIALROWLEVELSTATE = {
    fieldName: '',
    position: '',
    fieldType: '',
    fieldValue: '',
  };
  

const Step2_child = ({ tableRule, clientId, updateFields, setUpdateFields, swapIndexArray, setSwapIndexArray, DeleteFieldsArray, setDeleteFieldsArray }) => {
    const [isChecked, setisChecked] = useState(false);

    const [customRules, setCustomRules] = useState([]);

    const [uncheckRuleArray, setUncheckRuleArray] = useState([]);

    const [tempSwapIndex, setTempSwapIndex] = useState([]);

    const [openCreateRuleModal, setOpenCreateRuleModal] = useState(false);
    const [isLoad, setIsLoad] = useState(false);

    const setScale = useCallback((fields) => {
        setUpdateFields((prev) => {
            return prev.map((ele, i) => (fields.colId === i ? { ...ele, scale: parseInt(fields.value, 10) } : ele));
        });
    }, []);

    const setSize = useCallback((fields) => {
        setUpdateFields((prev) => {
            return prev.map((ele, i) => (fields.colId === i ? { ...ele, size: parseInt(fields.value, 10) } : ele));
        });
    }, []);

    const setFieldType = useCallback((fields) => {
        setUpdateFields((prev) => {
            return prev.map((ele, i) => (fields.colId === i ? { ...ele, type: fields.value, rulename: [] } : ele));
        });
    }, []);

    const setDeleteFields = useCallback(
        (fields) => {
            setDeleteFieldsArray([...DeleteFieldsArray, fields.value]);
            setUpdateFields((prev) => {
                return prev.map((ele, i) => (fields.value === ele.fieldname ? { ...ele, deleted: true } : ele));
            });
        },
        [DeleteFieldsArray, updateFields]
    );
    const ruleNameChange = useCallback((fields) => {
        setUpdateFields((prev) => {
            return prev.map((ele, i) => (fields.colId === i ? { ...ele, rulename: fields.value } : ele));
        });
    }, []);

    const setSwapedIndex = useCallback(
        (data) => {
            const indexExist = tempSwapIndex.findIndex((el) => el.colId === data.colId);

            setUncheckRuleArray([]);
            if (data.isChecked) {
                setTempSwapIndex([...tempSwapIndex, data]);
            } else {
                tempSwapIndex.splice(indexExist, 1);
                setTempSwapIndex(tempSwapIndex);
            }
        },
        [tempSwapIndex]
    );

    const swapTableRule = useCallback(
        (item) => {
            const temp0 = updateFields[item[0].colId];
            const temp1 = updateFields[item[1].colId];

            updateFields.splice(item[0].colId, 1, temp1);
            updateFields.splice(item[1].colId, 1, temp0);
            setUpdateFields(updateFields);

            const newItem = {
                swap_col_one: item[0].value,
                swap_col_two: item[1].value,
            };

            setUncheckRuleArray(item);
            setSwapIndexArray([...swapIndexArray, newItem]);

            setTempSwapIndex([]);
        },
        [swapIndexArray, updateFields, uncheckRuleArray, tempSwapIndex]
    );

    const uncheckbox = () => {
        if (uncheckRuleArray.find((el) => el.value === tableRule.fieldname)) {
            if (isChecked) {
                setisChecked(false);
            }
        }
    };

    useEffect(() => {
        if (tempSwapIndex.length === 2) {
            swapTableRule(tempSwapIndex);
        }
    }, [tempSwapIndex]);

    const fetchCustomRule = async () => {
        try {
            //  const response = await getCustomRuleByClientId(tableRule[0].client_id);
            const response = await getAllCustomRule();
            if (response.status === 200) {
                setCustomRules(response.data);
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchCustomRule();

        return () => {
            setCustomRules([]);
        };
    }, [tableRule]);

    useEffect(() => {
        if (uncheckRuleArray.length === 2) {
            uncheckbox();
        }
    }, [uncheckRuleArray]);

    const getTableRules = async () => {
        setIsLoad(true);
        setUpdateFields(tableRule.fields);
        setIsLoad(false);
    };
    useEffect(() => {
        getTableRules();
    }, [tableRule]);

    const handleCreateRuleModalOpen = () => setOpenCreateRuleModal(true);
    return (
        <div>
            {isLoad && <LoadingIcon />}
            {tableRule !== undefined ? (
                <Box>
                    {/* <Stack
                        direction="row"
                        spacing={2}
                        alignItems={'center'}
                        justifyContent={'space-around'}
                        marginBottom={'10px'}
                    >
                        <Typography id="modal-modal-title" variant="h6" component="h2" align="center">
                            Rules
                        </Typography>
                    </Stack> */}

                    <TableContainer>
                        <Table sx={{ minWidth: 700 }} aria-label="customized table">
                            <TableHead>
                                <TableRow>
                                    <StyledTableCell align="left" style={{ backgroundColor: '#003566' }}>
                                        Swap Field
                                    </StyledTableCell>
                                    <StyledTableCell align="center" style={{ backgroundColor: '#003566' }}>
                                        Field Name
                                    </StyledTableCell>
                                    <StyledTableCell align="center" style={{ backgroundColor: '#003566' }}>
                                        Field Type
                                    </StyledTableCell>
                                    <StyledTableCell align="center" style={{ backgroundColor: '#003566' }}>
                                        Size
                                    </StyledTableCell>
                                    <StyledTableCell align="center" style={{ backgroundColor: '#003566' }}>
                                        Scale
                                    </StyledTableCell>
                                    <StyledTableCell align="center" style={{ backgroundColor: '#003566' }}>
                                        Rule Name
                                    </StyledTableCell>
                                    <StyledTableCell align="center" style={{ backgroundColor: '#003566' }}>
                                        Action
                                    </StyledTableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {updateFields.map((row, i) => {
                                    return (
                                        <RulesTable
                                            row={row}
                                            key={i}
                                            i={i}
                                            customRules={customRules}
                                            setScaleFn={setScale}
                                            setSizeFn={setSize}
                                            setFieldTypeFn={setFieldType}
                                            ruleNameChange={ruleNameChange}
                                            setDeleteFields={setDeleteFields}
                                            setSwapedIndex={setSwapedIndex}
                                            uncheckRuleArray={uncheckRuleArray}
                                            DeleteFieldsArray={DeleteFieldsArray}
                                        />
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            ) : null}

            <AddNewRuleModal
                openCreateRuleModal={openCreateRuleModal}
                setOpenCreateRuleModal={setOpenCreateRuleModal}
                clientId={clientId}
            />
        </div>
    )
}

export default Step2_child