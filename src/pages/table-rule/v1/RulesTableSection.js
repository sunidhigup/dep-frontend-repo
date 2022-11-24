import React, { useContext, useEffect, useState, useReducer, memo, useCallback } from 'react';
import { Box } from '@mui/system';
import { styled } from '@mui/material/styles';
import {
  Button,
  IconButton,
  Modal,
  Tooltip,
  Stack,
  TableContainer,
  MenuItem,
  TextField,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import AssignmentIcon from '@mui/icons-material/Assignment';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SaveIcon from '@mui/icons-material/Save';
import RefreshIcon from '@mui/icons-material/Refresh';
import Error from '@mui/icons-material/Error';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DoNotDisturbOnIcon from '@mui/icons-material/DoNotDisturbOn';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingIcon from '@mui/icons-material/Pending';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import AddCircleIcon from '@mui/icons-material/AddCircle';

import { useSnackbar } from 'notistack';
import { Link, useParams } from 'react-router-dom';
import LoadingIcon from '../../../reusable-components/LoadingIcon';
import { getCustomRuleApi } from "../../../api's/CustomRuleApi";
import RulesTable from './RulesTable';
import { BatchContext } from '../../../context/BatchProvider';
import { ClientContext } from '../../../context/ClientProvider';

import {
  createMetadata,
  createTableRule,
  executeRuleEngine,
  fetchTableRuleById,
  getRuleEngineStatus,
  getS3TableRules,
  storeTableRuleJson,
} from "../../../api's/TableRuleApi";
import InputField from '../../../reusable-components/InputField';
import { getClientRuleApi } from "../../../api's/ClientRuleApi";
import { getGlobalRuleApi } from "../../../api's/GlobalRuleApi";
import { createBatchidApi, fetchBatchidApi } from "../../../api's/BatchApi";

// const useStyles = makeStyles({
// });

const header = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '10px 20px',
  border: '1px solid #ddd',
  borderRadius: '5px',
};
const styleLoading = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
};
const buttonStyle = {
  margin: '10px',
};

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: '#fff',
  border: '1px solid #000',
  borderRadius: '10px',
  boxShadow: 24,
  p: 4,
};

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: '#003566',
    color: '#0dd398',
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const INITIALROWLEVELSTATE = {
  fieldName: '',
  position: '',
  fieldType: '',
  fieldValue: '',
};

const RulesTableSection = () => {
  const params = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const { batch } = useContext(BatchContext);
  const { client } = useContext(ClientContext);
  const [_, forceUpdate] = useReducer((x) => x + 1, 0);

  const [openLoadingModal, setOpenLoadingModal] = useState(false);
  const [rowInputModal, setRowInputModal] = useState(false);
  const [saveDialogOpen, setsaveDialogOpen] = useState(false);

  const [runStatus, setRunStatus] = useState('Loading...');
  const [disableRun, setDisableRun] = useState(false);
  const [customRules, setCustomRules] = useState([]);
  const [loadBtn, setLoadBtn] = useState(true);
  const [tableRule, setTableRule] = useState();
  const [newTableRule, setnewTableRule] = useState();
  const [updateFields, setUpdateFields] = useState([]);
  const [DeleteFieldsArray, setDeleteFieldsArray] = useState([]);
  const [swapIndexArray, setSwapIndexArray] = useState([]);
  const [tempSwapIndex, setTempSwapIndex] = useState([]);
  const [uncheckRuleArray, setUncheckRuleArray] = useState([]);
  const [AddFieldArray, setAddFieldArray] = useState([]);
  const [rowLevelState, setRowLevelState] = useState(INITIALROWLEVELSTATE);
  const [S3Path, setS3Path] = useState();
  const [openS3PathModal, setopenS3PathModal] = useState(false);
  const [bucket_name, setbucket_name] = useState();

  const [ignoreblanklines, setignoreblanklines] = useState(false);
  const [skipheaders, setskipheaders] = useState(false);
  const [skiptrailers, setskiptrailers] = useState(false);
  const [DELIMITER, setDELIMITER] = useState(',');
  const [LineBreak, setLineBreak] = useState(true);
  const [JunkRecords, setJunkRecords] = useState(true);
  const [column_shifting, setcolumn_shifting] = useState(true);

  const handlesaveDialogOpen = useCallback(() => setsaveDialogOpen(true), []);

  const handlesaveDialogClose = useCallback(() => setsaveDialogOpen(false), []);

  const handleLoadingModalOpen = useCallback(() => setOpenLoadingModal(true), []);

  const handleLoadingModalClose = useCallback(() => setOpenLoadingModal(false), []);

  const handleS3PathModalOpen = useCallback((e) => {
    e.stopPropagation();
    setopenS3PathModal(true);
  }, []);

  const handleS3PathModalClose = useCallback(() => setopenS3PathModal(false), []);

  const handleRowInputOpen = useCallback(() => setRowInputModal(true), []);

  const handleRowInputClose = useCallback(() => {
    setRowInputModal(false);
    setRowLevelState(INITIALROWLEVELSTATE);
  }, []);

  let name, value;

  const handleInputChange = (e) => {
    name = e.target.name;
    value = e.target.value;

    setRowLevelState({
      ...rowLevelState,
      [name]: value,
    });
  };

  const getTableRules = useCallback(async () => {
    setLoadBtn(true);

    try {
      const response = await fetchTableRuleById(params.id);

      if (response.status === 200) {
        setnewTableRule(response.data);
        setTableRule(response.data);
        setUpdateFields(response.data.fields);
      }
    } catch (error) {
      enqueueSnackbar('Something went wrong!', {
        variant: 'Error',
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
    }

    setLoadBtn(false);
  }, []);

  useEffect(() => {
    getTableRules();

    return () => {
      setTableRule({});
    };
  }, []);

  const fetchCustomRule = useCallback(async () => {
    try {
      const response = await getCustomRuleApi(client.client_id, batch.batch_id);

      if (response.status === 200) {
        setCustomRules(response.data);
      }
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    fetchCustomRule();

    return () => {
      setCustomRules([]);
    };
  }, []);

  const ruleNameChange = useCallback((fields) => {
    setUpdateFields((prev) => {
      return prev.map((ele, i) => (fields.colId === i ? { ...ele, rulename: fields.value } : ele));
    });
  }, []);

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

  useEffect(() => {
    if (tempSwapIndex.length === 2) {
      swapTableRule(tempSwapIndex);
    }
  }, [tempSwapIndex]);

  const handleAddRow = useCallback(() => {
    let isadded = true;

    updateFields.map((ele) => {
      if (ele.fieldname === rowLevelState.fieldName) {
        isadded = false;
        enqueueSnackbar('Fieldname already exist!', {
          variant: 'error',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }
    });

    if (isadded) {
      setAddFieldArray([
        ...AddFieldArray,
        {
          fieldname: rowLevelState.fieldName,
          position: parseInt(rowLevelState.position, 10),
          type: rowLevelState.fieldType,
          value: rowLevelState.fieldValue,
        },
      ]);

      const obj = {
        fieldname: rowLevelState.fieldName,
        size: 50,
        scale: 0,
        type: rowLevelState.fieldType,
        rulename: [],
        deleted: false,
      };

      setUpdateFields([
        ...updateFields.slice(0, rowLevelState.position),
        obj,
        ...updateFields.slice(rowLevelState.position),
      ]);

      enqueueSnackbar('Column Added Successfully!', {
        variant: 'success',
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
    }

    handleRowInputClose();
  }, [updateFields, rowLevelState, AddFieldArray]);

  useEffect(() => {
    forceUpdate();
  }, [AddFieldArray, DeleteFieldsArray]);

  const createRuleJson = async (fetchedJson) => {
    const response = await fetchTableRuleById(params.id);
    let main;
    if (response.status === 200) {
      const json = response.data;
      const duplicate_json = response.data.fields.slice();

      let fetchClientRule;

      let fetchGlobalRule;

      let fetchCustomRule;

      json.fields.map((el) => {
        updateFields.map((elem) => {
          if (el.fieldname === elem.fieldname) {
            el.type = elem.type;
            el.scale = parseInt(elem.scale, 10);
            el.size = parseInt(elem.size, 10);
            el.rulename = elem.rulename;
          }
        });
      });

      try {
        fetchClientRule = await getClientRuleApi(client.client_id);
      } catch (error) {
        // console.log(error)
      }
      try {
        fetchGlobalRule = await getGlobalRuleApi();
      } catch (error) {
        // console.log(error)
      }
      try {
        fetchCustomRule = await getCustomRuleApi(client.client_id, batch.batch_id);
      } catch (error) {
        // console.log(error)
      }

      if (
        (fetchClientRule && fetchClientRule.status === 200) ||
        (fetchGlobalRule && fetchGlobalRule.status === 200) ||
        (fetchCustomRule && fetchCustomRule.status === 200)
      ) {
        if (fetchGlobalRule) {
          json.fields.map((el) => {
            const fieldrules = [];
            fetchGlobalRule.data.forEach((item) => {
              if (el.type === item.type) {
                const argkey = item.argkey.split(',');
                const argvalue = item.argvalue.split(',');
                const obj = {};
                argkey.map((element, argkey_idx) => {
                  obj[element] = argvalue[argkey_idx];
                });

                fieldrules.push({
                  rulename: item.rulename,
                  args: [obj],
                });
              }
            });
            el['fieldrules'] = fieldrules;
          });
        }

        if (fetchClientRule) {
          json.fields.map((el) => {
            const clientFieldRules = [];
            fetchClientRule.data.forEach((item) => {
              if (el.type === item.type) {
                const argkey = item.argkey.split(',');
                const argvalue = item.argvalue.split(',');
                const obj = {};
                argkey.map((element, argkey_idx) => {
                  obj[element] = argvalue[argkey_idx];
                });

                clientFieldRules.push({
                  rulename: item.rulename,
                  args: [obj],
                });
              }
            });

            const globalFieldRules = el['fieldrules'];
            const newArr = globalFieldRules.concat(clientFieldRules);
            const resultantFieldsRules = [];
            const map = {};
            newArr.forEach((nel) => {
              if (!map[nel['rulename']]) {
                resultantFieldsRules.push(nel);
                map[nel['rulename']] = 1;
              }
            });
            el['fieldrules'] = resultantFieldsRules;
          });
        }

        if (fetchCustomRule) {
          json.fields.map((el) => {
            fetchCustomRule.data.forEach((item) => {
              el.rulename &&
                el.rulename.forEach((ele) => {
                  if (ele === item.rulename) {
                    const argkey = item.argkey.split(',');
                    const argvalue = item.argvalue.split(',');
                    const obj = {};
                    argkey.map((element, argkey_idx) => {
                      obj[element] = argvalue[argkey_idx];
                    });

                    if (el.fieldrules) {
                      const custfieldrules = {
                        rulename: item.rulename,
                        args: [obj],
                      };

                      const index = el.fieldrules.findIndex((x) => x.rulename === item.rulename);

                      if (index === -1) {
                        if (el.fieldrules) {
                          el.fieldrules = [...el.fieldrules, custfieldrules];
                        } else {
                          // el.fieldrules = [custfieldrules];
                        }
                      }
                    } else {
                      const custfieldrules = {
                        rulename: item.rulename,
                        args: [obj],
                      };
                      el['fieldrules'] = [custfieldrules];
                    }
                  }
                });
            });
          });
        }
      }

      if (AddFieldArray.length > 0) {
        json.column_add = AddFieldArray;
      }

      AddFieldArray.map((elem) => {
        duplicate_json.splice(elem.position, 0, elem);
      });

      let third_duplicate_json;

      const swap_field = [];

      swapIndexArray.map((ele, idx) => {
        if (idx === 0) {
          console.log('sss');
          third_duplicate_json = [...duplicate_json];
        } else {
          console.log('first');
          third_duplicate_json = [...third_duplicate_json];
        }

        const first_one = ele.swap_col_one;
        const second_one = ele.swap_col_two;
        const obj = {};
        let index1, index2;
        third_duplicate_json.find((el, i) => {
          if (el.fieldname === first_one) {
            obj['swap_col_one'] = i;
            index1 = i;
          }
        });
        third_duplicate_json.find((el, i) => {
          if (el.fieldname === second_one) {
            obj['swap_col_two'] = i;
            index2 = i;
          }
        });

        swap_field.push(obj);

        function swap(x, y) {
          // console.log(x + " " + y)
          const z = third_duplicate_json[y];
          third_duplicate_json[y] = third_duplicate_json[x];
          third_duplicate_json[x] = z;
        }
        swap(index1, index2);
      });

      if (swapIndexArray.length > 0) {
        json.swap_field = swap_field;
      }

      const del_col_seq = [];
      if (swapIndexArray.length > 0) {
        DeleteFieldsArray.map((ele) => {
          third_duplicate_json.map((el, i) => {
            if (ele === el.fieldname) {
              del_col_seq.push(i);
            }
          });
        });
      } else {
        DeleteFieldsArray.map((ele) => {
          duplicate_json.map((el, i) => {
            if (ele === el.fieldname) {
              del_col_seq.push(i);
            }
          });
        });
      }

      if (DeleteFieldsArray.length > 0) {
        json.del_col_seq = del_col_seq;
      }

      json.columnshift = column_shifting;
      json.junkrecords = JunkRecords;
      json.linebreak = LineBreak;
      json.delimiter = DELIMITER;
      if (S3Path) {
        json.s3_path = S3Path;
      }

      main = {
        ignoreblanklines,
        skipheaders,
        skiptrailers,

        ...json,
      };
    }
    return main;
  };

  const handleSaveTableRule = async () => {
    handleLoadingModalOpen();

    try {
      const metadata = {
        id: `${client.client_name}_${batch.batch_name}_${tableRule.tablename}`,
        table_name: tableRule.tablename,
        client_name: client.client_name,
        paramsMeta: {
          batch_name: batch.batch_name,
          client_name: client.client_name,
          table_name: tableRule.tablename,
          delimiter: DELIMITER,
          file_extension: JSON.stringify(['.txt', '.csv', '.json']),
          db_status_table: 'dep_rule_engine_job_status',
          db_audit_table: 'dep_rule_engine_audit_table',
          log_group: 'cdep_rule_engine_logs',
        },
      };

      const result = await createMetadata(client.client_id, metadata);

      const pathArr = tableRule.path.split('/');
      pathArr.shift(0);
      pathArr.shift(0);
      pathArr.shift(0);
      const newPath = pathArr.join('/');

      const pathData = {
        path: newPath,
        client_id: client.client_id,
      };

      const response = await getS3TableRules(pathData);

      if (response.status === 200) {
        const newJson = await createRuleJson(tableRule); // json of database

        delete newJson['id'];
        delete newJson['tablename'];
        delete newJson['batchname'];
        delete newJson['path'];
        delete newJson['client_id'];
        delete newJson['generated'];

        for (let i = 0; i < newJson['fields'].length; i++) {
          delete newJson['fields'][i]['deleted'];
        }

        const jsonData = {
          ...newJson,
        };

        const filename = tableRule.tablename;
        console.log(filename);

        const saveTableJson = await storeTableRuleJson(client.client_id, batch.batch_name, filename, jsonData);

        const res = await createTableRule({ ...tableRule, fields: updateFields }); // db store

        enqueueSnackbar('Table Rule Saved Successfully!', {
          variant: 'Success',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }
      setAddFieldArray([]);
      setDeleteFieldsArray([]);
      setSwapIndexArray([]);
      getTableRules();
      handlesaveDialogClose();
      handleLoadingModalClose();
    } catch (error) {
      if (error.response.status === 403) {
        enqueueSnackbar('You have only Read Permission !!', {
          variant: 'error',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }
      handleLoadingModalClose();
    }
  };

  const handleAdds3Path = async () => {
    const regex = /^s3:\/\/.*$/;

    if (!regex.test(S3Path)) {
      enqueueSnackbar('S3 path is invalid!', {
        variant: 'error',
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
      return;
    }

    handleLoadingModalOpen();
    const pathArr = S3Path.split('/');
    pathArr.shift(0);
    pathArr.shift(0);
    pathArr.shift(0);
    const newPath = pathArr.join('/');
    pathArr.pop();
    const news3path = pathArr.join('/');

    handleLoadingModalClose();
    handleS3PathModalClose();
  };

  const runRuleEngine = async (e) => {
    e.preventDefault();

    handleLoadingModalOpen();
    try {
      const batch_table_id = `${client.client_name}_${batch.batch_name}_${
        tableRule.tablename
      }_ruleEngine_${new Date().getTime()}`;

      const client_job = `${client.client_name}_${batch.batch_name}_${tableRule.tablename}_ruleEngine`;

      const data = {
        client_job: client_job.replaceAll(' ', ''),
        batch_id: batch_table_id.replaceAll(' ', ''),
      };
      const res = await createBatchidApi(data);

      const input = {
        batch: batch.batch_name,
        execution_id: batch_table_id.replaceAll(' ', ''),
        client_id: client.client_id,
        batch_id: batch.batch_id,
        table_name: tableRule.tablename,
        client_name: client.client_name,
      };

      const response = await executeRuleEngine(input);

      if (response.status === 200) {
        setDisableRun(true);
        setRunStatus('In Progress');
        handleLoadingModalClose();
        enqueueSnackbar('Table Rule is running!', {
          variant: 'Success',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }
    } catch (error) {
      if (error.response.status === 403) {
        enqueueSnackbar('You have only Read Permission !!', {
          variant: 'error',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }
      handleLoadingModalClose();
    }
  };

  const refreshBtn = useCallback(
    async (e) => {
      e.preventDefault();
      const batchID = `${client.client_name}_${batch.batch_name}_${tableRule.tablename}_ruleEngine`;

      try {
        const result = await fetchBatchidApi(batchID.replaceAll(' ', ''));

        if (result.status === 200) {
          const data = {
            id: `${result.data}`,
          };
          const result1 = await getRuleEngineStatus(data);

          if (result1.data.status === 'Completed') {
            setDisableRun(false);
            setRunStatus(result1.data.status);
            enqueueSnackbar(`Rule Engine is ${result1.data.status}`, {
              variant: 'success',
              autoHideDuration: 3000,
              anchorOrigin: { vertical: 'top', horizontal: 'right' },
            });
          } else if (result1.data.status === 'Running') {
            setDisableRun(true);
            setRunStatus(result1.data.status);
            enqueueSnackbar(`Rule Engine is ${result1.data.status}`, {
              variant: 'warning',
              autoHideDuration: 3000,
              anchorOrigin: { vertical: 'top', horizontal: 'right' },
            });
          } else if (result1.data.status === 'Failed') {
            setDisableRun(false);
            setRunStatus(result1.data.status);
            enqueueSnackbar(`Rule Engine is ${result1.data.status}`, {
              variant: 'failed',
              autoHideDuration: 3000,
              anchorOrigin: { vertical: 'top', horizontal: 'right' },
            });
          } else {
            const time = result.data.split('~')[1];
            const triggeredTime = new Date(time);
            const currentTime = new Date();

            const diffTime = currentTime - triggeredTime;

            const elapsedTime = Math.floor(diffTime / 60e3);

            if (elapsedTime < 5) {
              setDisableRun(true);
              setRunStatus('In Progress');
              enqueueSnackbar(`Rule Engine is in progress.`, {
                variant: 'secondary',
                autoHideDuration: 3000,
                anchorOrigin: { vertical: 'top', horizontal: 'right' },
              });
            } else {
              setDisableRun(false);
              setRunStatus('Failed');
              enqueueSnackbar(`Rule Engine is failed.`, {
                variant: 'error',
                autoHideDuration: 3000,
                anchorOrigin: { vertical: 'top', horizontal: 'right' },
              });
            }
          }
        }
      } catch (error) {
        if (error.response.status === 404) {
          setRunStatus('Unknown');
          setDisableRun(false);
          enqueueSnackbar(`Rule Engine is not running`, {
            variant: 'warning',
            autoHideDuration: 3000,
            anchorOrigin: { vertical: 'top', horizontal: 'right' },
          });
        }
      }
    },
    [tableRule]
  );

  const loadJobStatus = useCallback(async () => {
    const batchID = `${client.client_name}_${batch.batch_name}_${tableRule.tablename}_ruleEngine`;

    try {
      const result = await fetchBatchidApi(batchID.replaceAll(' ', ''));

      if (result.status === 200) {
        const data = {
          id: `${result.data}`,
        };

        const result1 = await getRuleEngineStatus(data);

        if (result1.data.status === 'Completed') {
          setDisableRun(false);
          setRunStatus(result1.data.status);
        } else if (result1.data.status === 'Running') {
          setDisableRun(true);
          setRunStatus(result1.data.status);
        } else if (result1.data.status === 'Failed') {
          setDisableRun(false);
          setRunStatus(result1.data.status);
        } else {
          const time = result.data.split('~')[1];
          const triggeredTime = new Date(time);
          const currentTime = new Date();

          const diffTime = currentTime - triggeredTime;

          const elapsedTime = Math.floor(diffTime / 60e3);

          if (elapsedTime < 5) {
            setDisableRun(true);
            setRunStatus('In Progress');
          } else {
            setDisableRun(false);
            setRunStatus('Failed');
          }
        }
      }
    } catch (error) {
      if (error.response.status === 404) {
        setRunStatus('Unknown');
        setDisableRun(false);
      }
    }
  }, [tableRule]);

  useEffect(() => {
    if (tableRule) {
      loadJobStatus();
    }
  }, [tableRule]);

  return (
    <>
      {loadBtn ? (
        <LoadingIcon />
      ) : (
        <>
          <Box style={header}>
            <Stack direction="row" spacing={2}>
              <Tooltip title="Row Level Operation">
                <Button variant="outlined" color="secondary" onClick={handlesaveDialogOpen}>
                  <AssignmentIcon color="secondary" fontSize="small" />
                </Button>
              </Tooltip>
              <Tooltip title="Add Input File Location">
                <Button variant="outlined" color="error" onClick={handleS3PathModalOpen}>
                  <FileCopyIcon color="error" fontSize="small" />
                </Button>
              </Tooltip>
              <Tooltip title="Save">
                <Button variant="outlined" color="primary" onClick={handleSaveTableRule}>
                  <SaveIcon color="primary" fontSize="small" />
                </Button>
              </Tooltip>
              <Tooltip
                title="Run"
                style={{
                  cursor: disableRun ? 'no-drop' : 'pointer',
                }}
              >
                <span>
                  <Button variant="outlined" color="success" onClick={runRuleEngine} disabled={disableRun}>
                    <PlayArrowIcon {...(disableRun ? { color: 'disable' } : { color: 'success' })} fontSize="small" />
                  </Button>
                </span>
              </Tooltip>
              <Link to={`/rule-engine/logs/${params.tablename}`} style={{ textDecoration: 'none' }}>
                <Tooltip title="View Logs">
                  <Button variant="outlined" color="warning">
                    <FormatListBulletedIcon color="warning" fontSize="small" />
                  </Button>
                </Tooltip>
              </Link>
              <Tooltip title="Add new column">
                <Button variant="outlined" color="primary" onClick={handleRowInputOpen}>
                  <AddCircleIcon color="primary" fontSize="small" />
                </Button>
              </Tooltip>
            </Stack>
            <div
              align="center"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-evenly',
              }}
            >
              {runStatus === 'Loading...' && runStatus}
              {runStatus === 'Completed' && (
                <p
                  style={{
                    color: 'green',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CheckCircleOutlineIcon style={{ fontSize: '18px' }} /> &nbsp;
                  {runStatus}
                </p>
              )}
              {runStatus === 'Running' && (
                <p
                  style={{
                    color: '#ffc300',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AccessTimeIcon style={{ fontSize: '18px' }} /> &nbsp; {runStatus}
                </p>
              )}
              {runStatus === 'Unknown' && (
                <p
                  style={{
                    color: 'grey',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <DoNotDisturbOnIcon style={{ fontSize: '18px' }} /> &nbsp;
                  {runStatus}
                </p>
              )}

              {runStatus === 'Error' && (
                <p
                  style={{
                    color: 'red',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Error style={{ fontSize: '18px' }} /> &nbsp;
                  {runStatus}
                </p>
              )}

              {runStatus === 'Failed' && (
                <p
                  style={{
                    color: 'red',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CancelIcon style={{ fontSize: '18px' }} /> &nbsp;
                  {runStatus}
                </p>
              )}

              {runStatus === 'In Progress' && (
                <p
                  style={{
                    color: '#98c1d9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <PendingIcon style={{ fontSize: '18px' }} /> &nbsp;
                  {runStatus}
                </p>
              )}

              <Tooltip title="Refresh Status">
                <IconButton onClick={refreshBtn}>
                  <RefreshIcon sx={{ fontSize: '1rem' }} />
                </IconButton>
              </Tooltip>
            </div>
          </Box>

          <TableContainer sx={{ mt: 2 }}>
            <Table sx={{ minWidth: 700 }} aria-label="customized table">
              <TableHead>
                <TableRow>
                  <StyledTableCell align="left">Swap Field</StyledTableCell>
                  <StyledTableCell align="center">Field Name</StyledTableCell>
                  <StyledTableCell align="center">Field Type</StyledTableCell>
                  <StyledTableCell align="center">Size</StyledTableCell>
                  <StyledTableCell align="center">Scale</StyledTableCell>
                  <StyledTableCell align="center">Rule Name</StyledTableCell>
                  <StyledTableCell align="center">Action</StyledTableCell>
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
                      // generated={generated}
                      // tablename={tablename}
                      // getFields={getFields}
                      // getDeleteField={getDeleteField}
                      // getCheckFields={getCheckFields}
                      DeleteFieldsArray={DeleteFieldsArray}
                      // SwapFieldArrayName={SwapFieldArrayName}
                      // AddFieldArray={AddFieldArray}
                      // previousDeleteFieldArray={previousDeleteFieldArray}
                    />
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      <Modal open={openLoadingModal} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
        <Box style={styleLoading}>
          <LoadingIcon />
        </Box>
      </Modal>

      <Modal
        open={rowInputModal}
        onClose={handleRowInputClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <InputField
            id="outlined-basic"
            label="Field Name"
            variant="outlined"
            fullWidth
            name="fieldName"
            value={rowLevelState.fieldName}
            onChange={handleInputChange}
            autoComplete="off"
            size="small"
          />
          <InputField
            id="outlined-basic"
            label="Index"
            variant="outlined"
            fullWidth
            type="number"
            name="position"
            value={rowLevelState.position}
            onChange={handleInputChange}
            autoComplete="off"
            size="small"
            helperText="Enter index where you want to insert row."
          />
          <TextField
            id="outlined-basic"
            select
            label="Field Type"
            variant="outlined"
            name="fieldType"
            value={rowLevelState.fieldType}
            onChange={handleInputChange}
            sx={{ mt: 2 }}
            size="small"
            required
            fullWidth
            InputProps={{
              style: {
                fontFamily: "'EB Garamond', serif ",
                fontWeight: 600,
              },
            }}
            InputLabelProps={{
              style: { fontFamily: "'EB Garamond', serif " },
            }}
          >
            <MenuItem value="integer">integer</MenuItem>
            <MenuItem value="string">string</MenuItem>
            <MenuItem value="float">float</MenuItem>
            <MenuItem value="double">double</MenuItem>
            <MenuItem value="datetime">datetime</MenuItem>
            <MenuItem value="date">date</MenuItem>
            <MenuItem value="time">time</MenuItem>
          </TextField>

          <InputField
            id="outlined-basic"
            label="Field Value"
            variant="outlined"
            fullWidth
            name="fieldValue"
            value={rowLevelState.fieldValue}
            onChange={handleInputChange}
            autoComplete="off"
            size="small"
          />
          <Button
            variant="outlined"
            autoFocus
            id="save"
            size="small"
            className="outlined-button-color"
            sx={{ mt: 2 }}
            onClick={handleAddRow}
            // onClick={(e) => {
            //   e.stopPropagation();
            //   // addrow();
            //   close();
            //   setisinsert(true);
            //   setinsertCount((insertCount + 1) % 3);
            // }}
          >
            Add
          </Button>
        </Box>
      </Modal>

      <Modal
        open={saveDialogOpen}
        onClose={handlesaveDialogClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <FormControlLabel
            label="ignoreblanklines"
            control={
              <Checkbox
                checked={ignoreblanklines}
                onChange={(e) => {
                  setignoreblanklines(e.target.checked);
                  e.stopPropagation();
                }}
              />
            }
          />
          <FormControlLabel
            label="skipheaders"
            control={
              <Checkbox
                checked={skipheaders}
                onChange={(e) => {
                  setskipheaders(e.target.checked);
                  e.stopPropagation();
                }}
              />
            }
          />
          <FormControlLabel
            label="skiptrailers"
            // labelPlacement="start"
            control={
              <Checkbox
                checked={skiptrailers}
                onChange={(e) => {
                  setskiptrailers(e.target.checked);
                  e.stopPropagation();
                }}
              />
            }
          />
          <FormControlLabel
            label="Column Shifting"
            // labelPlacement="start"
            control={
              <Checkbox
                checked={column_shifting}
                onChange={(e) => {
                  setcolumn_shifting(e.target.checked);
                }}
              />
            }
          />
          <FormControlLabel
            label="Line Break"
            // labelPlacement="start"
            control={
              <Checkbox
                checked={LineBreak}
                onChange={(e) => {
                  setLineBreak(e.target.checked);
                }}
              />
            }
          />
          <FormControlLabel
            label="Junk Records"
            // labelPlacement="start"
            control={
              <Checkbox
                checked={JunkRecords}
                onChange={(e) => {
                  setJunkRecords(e.target.checked);
                }}
              />
            }
          />
          <TextField
            id="id"
            label="Delimiter"
            value={DELIMITER}
            style={{ marginTop: 10 }}
            onChange={(e) => {
              setDELIMITER(e.target.value);
            }}
            fullWidth
            size="small"
          />

          <Button
            variant="outlined"
            autoFocus
            id="save"
            size="small"
            className="outlined-button-color"
            sx={{ mt: 1 }}
            onClick={handleSaveTableRule}
          >
            SUBMIT
          </Button>
        </Box>
      </Modal>

      <Modal
        open={openS3PathModal}
        onClose={handleS3PathModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <InputField
            id="outlined-basic"
            label="S3 Path"
            variant="outlined"
            fullWidth
            name="s3 Path"
            value={S3Path}
            autoComplete="off"
            size="small"
            helperText="Enter the input file location of s3 path "
            onChange={(event) => setS3Path(event.target.value)}
          />

          <Button
            variant="contained"
            sx={{ mt: 2 }}
            color="secondary"
            type="submit"
            className="button-color"
            onClick={handleAdds3Path}
          >
            SUBMIT
          </Button>
        </Box>
      </Modal>
    </>
  );
};

export default memo(RulesTableSection);
