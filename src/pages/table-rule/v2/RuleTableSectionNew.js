import React, { useContext, useEffect, useState, useReducer, memo, useCallback } from 'react';
import { Box } from '@mui/system';
import { styled } from '@mui/material/styles';
import { IconButton, Tooltip, Stack, TableContainer, MenuItem, TextField, FormControlLabel } from '@mui/material';
import MModal from '@mui/material/Modal';
import MButton from '@mui/material/Button';
import MCheckbox from '@mui/material/Checkbox';
import {
  Space,
  Table,
  Typography,
  Button,
  Row,
  Col,
  Input,
  Form,
  Popconfirm,
  Tag,
  InputNumber,
  Select,
  Modal,
  Checkbox,
} from 'antd';
import { useSnackbar } from 'notistack';
import { Link } from 'react-router-dom';

import { arrayMoveImmutable } from 'array-move';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';

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
import { DeleteFilled, EditFilled, MenuOutlined } from '@ant-design/icons';

import LoadingIcon from '../../../reusable-components/LoadingIcon';
import { getCustomRuleApi } from "../../../api's/CustomRuleApi";
import RulesTable from '../v1/RulesTable';
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
  AllFilesOfS3,
  AllFoldersOfS3,
} from "../../../api's/TableRuleApi";
import InputField from '../../../reusable-components/InputField';
import { getClientRuleApi } from "../../../api's/ClientRuleApi";
import { getGlobalRuleApi } from "../../../api's/GlobalRuleApi";
import { createBatchidApi, fetchBatchidApi } from "../../../api's/BatchApi";
import { AuthContext } from '../../../context/AuthProvider';

const { Option } = Select;

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

const INITIALROWLEVELSTATE = {
  fieldName: '',
  position: '',
  fieldType: '',
  fieldValue: '',
};

const fieldTypeValues = ['integer', 'string', 'float', 'double', 'datetime', 'date', 'time'];
const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  handleChangeFieldType,
  customRules,
  ...restProps
}) => {
  const inputNode =
    inputType === 'number' ? (
      <InputNumber />
    ) : inputType === 'select' ? (
      <Select mode="multiple">
        {customRules &&
          customRules.map((rule) => {
            return (
              <Option key={rule} value={rule.rulename}>
                {rule.rulename}
              </Option>
            );
          })}
      </Select>
    ) : inputType === 'typeSelect' ? (
      <Select
        onChange={(e) => {
          handleChangeFieldType(e, record);
        }}
      >
        {fieldTypeValues.map((ftv) => {
          return (
            <Option key={ftv} value={ftv}>
              {ftv}
            </Option>
          );
        })}
      </Select>
    ) : (
      <Input />
    );
  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          // rules={[
          //     {
          //         required: true,
          //         message: `Please Input ${title}!`,
          //     },
          // ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

const DragHandle = SortableHandle(() => (
  <MenuOutlined
    style={{
      cursor: 'grab',
      color: '#999',
    }}
  />
));

const SortableItem = SortableElement((props) => <tr {...props} />);
const SortableBody = SortableContainer((props) => <tbody {...props} />);

const RuleTableSectionNew = ({ componentType, tablename, tableId, NextData, setNextData }) => {
  const { enqueueSnackbar } = useSnackbar();
  const { batch } = useContext(BatchContext);
  const { client } = useContext(ClientContext);
  const { userRole } = useContext(AuthContext);
  const [form] = Form.useForm();
  const [formAdd] = Form.useForm();
  const [formRowLevelOperation] = Form.useForm();
  const [formRun] = Form.useForm();
  const [loadBtn, setLoadBtn] = useState(true);
  const [openLoadingModal, setOpenLoadingModal] = useState(false);
  const [runStatus, setRunStatus] = useState('Loading...');
  const [disableRun, setDisableRun] = useState(false);
  const [rowInputModal, setRowInputModal] = useState(false);
  const [S3Path, setS3Path] = useState();
  const [openS3PathModal, setopenS3PathModal] = useState(false);
  const [rowLevelState, setRowLevelState] = useState(INITIALROWLEVELSTATE);
  const [editingKey, setEditingKey] = useState('');
  const [loadingStatus, setloadingStatus] = useState(true);
  const [InitialTableRule, setInitialTableRule] = useState();
  const [UpdateTableRule, setUpdateTableRule] = useState();
  const [UpdateTableRuleFields, setUpdateTableRuleFields] = useState([]);
  const [customRules, setCustomRules] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [AddFieldArray, setAddFieldArray] = useState([]);
  const [DeleteFieldArray, setDeleteFieldArray] = useState([]);
  const [SwapFieldArray, setSwapFieldArray] = useState([]);

  const [FoldersData, setFoldersData] = useState([]);
  const [FilesData, setFilesData] = useState([]);
  const [isRunModalVisible, setIsRunModalVisible] = useState(false);
  const [tableNameModal, setTableNameModal] = useState('');
  const [currentRecord, setCurrentRecord] = useState({});

  const [saveLoadingStatus, setSaveLoadingStatus] = useState(false);
  const [timestampId, setTimestampId] = useState('');
  const [saveButtonDisable, setSaveButtonDisable] = useState(true);
  const [submitButtonDisable, setSubmitButtonDisable] = useState(true);
  const [ComponentSaveButton, setComponentSaveButton] = useState(false);

  const handleS3PathModalOpen = useCallback((e) => {
    e.stopPropagation();
    setopenS3PathModal(true);
  }, []);

  const handleLoadingModalOpen = useCallback(() => setOpenLoadingModal(true), []);

  const handleLoadingModalClose = useCallback(() => setOpenLoadingModal(false), []);

  const handleS3PathModalClose = useCallback(() => setopenS3PathModal(false), []);

  const handleRowInputOpen = useCallback(() => setRowInputModal(true), []);

  const handleRowInputClose = useCallback(() => {
    setRowInputModal(false);
    setRowLevelState(INITIALROWLEVELSTATE);
  }, []);

  const isEditing = (record) => record.fieldname === editingKey;

  const handleChangeFieldType = async (value, record) => {
    record.rulename = [];
    try {
      const response = await getCustomRuleApi(client.client_id, batch.batch_id);

      if (response.status === 200) {
        const custom_rules = response.data.filter((rule) => rule.type === value);
        setCustomRules(custom_rules);
      }
    } catch (error) {
      // console.log(error);
    }
  };

  const cancel = () => {
    setEditingKey('');
  };

  const saveRecord = async (key) => {
    try {
      const row = await form.validateFields();
      const newData = [...UpdateTableRuleFields];
      const index = newData.findIndex((item) => key === item.fieldname);

      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, { ...item, ...row });
        setUpdateTableRuleFields(newData);
        setEditingKey('');
      } else {
        newData.push(row);
        setUpdateTableRuleFields(newData);
        setEditingKey('');
      }
    } catch (errInfo) {
      // console.log('Validate Failed:', errInfo);
    }
  };
  const deleteRecord = (record) => {
    // console.log(record)
    const newData = UpdateTableRuleFields.filter((item) => item.fieldname !== record.fieldname);
    setUpdateTableRuleFields(newData);
    setDeleteFieldArray([...DeleteFieldArray, record]);
  };

  const showModal = () => {
    formRowLevelOperation.setFieldsValue({
      ignoreblanklines: false,
      skipheaders: false,
      skiptrailers: false,
      columnshift: true,
      junkrecords: true,
      linebreak: true,
      delimiter: ',',
    });
    setIsModalVisible(true);
  };
  const handleCancel = () => {
    setIsModalVisible(false);
  };
  const onFinish = (checkedValues) => {
    console.log(checkedValues);
    setIsModalVisible(false);
  };

  const EditRecord = async (record) => {
    console.log(record);
    const response = await getCustomRuleApi(client.client_id, batch.batch_id);

    if (response.status === 200) {
      const custom_rules = response.data.filter((rule) => rule.type === record.type);
      setCustomRules(custom_rules);
    }
    form.setFieldsValue({
      size: '',
      scale: '',
      type: '',
      rulename: [],
      ...record,
    });
    setEditingKey(record.fieldname);
  };

  const AddModal = () => {
    setIsAddModalVisible(true);
  };
  const handleAddCancel = () => {
    setIsAddModalVisible(false);
  };

  const onAddFinish = (values) => {
    // console.log(values)
    setAddFieldArray([...AddFieldArray, values]);
    const data = {
      fieldname: values.fieldName,
      type: values.fieldType,
      scale: 0,
      size: 0,
      rulename: [],
    };
    setRowLevelState(values);
    const newArr = handleAddRow(UpdateTableRuleFields, values.position, data);
    setUpdateTableRuleFields(newArr);
    setIsAddModalVisible(false);
  };

  const handleAddRow = (arr, index, item) => {
    return [...arr.slice(0, index), item, ...arr.slice(index)];
  };

  const onSortEnd = ({ oldIndex, newIndex }) => {
    console.log(oldIndex);
    console.log(newIndex);
    if (oldIndex !== newIndex) {
      const newData = arrayMoveImmutable(UpdateTableRuleFields.slice(), oldIndex, newIndex).filter((el) => !!el);
      const newData1 = arrayMoveImmutable(UpdateTableRuleFields.slice(), newIndex, oldIndex).filter((el) => !!el);

      const A = UpdateTableRuleFields.slice();
      const B = UpdateTableRuleFields.slice();
      A[oldIndex] = A.splice(newIndex, 1, A[oldIndex])[0];

      // console.log(A)
      // console.log(B)
      setUpdateTableRuleFields(A);
      setSwapFieldArray([...SwapFieldArray, { swap_col_one: B[oldIndex], swap_col_two: B[newIndex] }]);
    }
  };

  const DraggableContainer = (props) => (
    <SortableBody useDragHandle disableAutoscroll helperClass="row-dragging" onSortEnd={onSortEnd} {...props} />
  );

  const DraggableBodyRow = ({ className, style, ...restProps }) => {
    const index = UpdateTableRuleFields.findIndex((x) => x.fieldname === restProps['data-row-key']);
    return <SortableItem index={index} {...restProps} />;
  };

  const getTableRules = useCallback(async () => {
    setloadingStatus(true);

    try {
      const response = await fetchTableRuleById(tableId);

      if (response.status === 200) {
        const data = response.data;
        const rules = [...data.fields];
        const clone = { ...data };
        // console.log(data === clone)
        setInitialTableRule(data);
        setUpdateTableRule(clone);
        setUpdateTableRuleFields(rules);
      }
    } catch (error) {
      enqueueSnackbar('Something went wrong!', {
        variant: 'Error',
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
    }
    setloadingStatus(false);
  }, []);

  useEffect(() => {
    getTableRules();
  }, []);

  useEffect(() => {
    // console.log(InitialTableRule)
    // console.log(UpdateTableRuleFields)
    // console.log(AddFieldArray)
    // console.log(DeleteFieldArray)
    // console.log(SwapFieldArray)
  }, [UpdateTableRuleFields, AddFieldArray, DeleteFieldArray, SwapFieldArray]);

  // console.log(InitialTableRule === UpdateTableRule)
  // console.log(UpdateTableRule === UpdateTableRuleFields)
  // console.log(UpdateTableRuleFields === InitialTableRule)

  const createRuleJson = async (TimeStampID) => {
    console.log(TimeStampID);
    const response = await fetchTableRuleById(tableId);
    let main;
    if (response.status === 200) {
      const json = response.data;
      const clone1 = [...response.data.fields];

      let fetchClientRule;

      let fetchGlobalRule;

      let fetchCustomRule;

      json.fields.map((el) => {
        UpdateTableRuleFields.map((elem) => {
          if (el.fieldname === elem.fieldname) {
            el.type = elem.type;
            el.scale = parseInt(elem.scale, 10);
            el.size = parseInt(elem.size, 10);
            el.rulename = elem.rulename || [];
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
        console.log(UpdateTableRuleFields);
        AddFieldArray.map((ele) => {
          UpdateTableRuleFields.map((el) => {
            if (ele.fieldName === el.fieldname) {
              console.log(ele.fieldType);
              console.log(ele.type);
              ele.fieldType = el.type;
            }
          });
        });
        json['column_add'] = AddFieldArray;
      }

      AddFieldArray.map((elem) => {
        const data = {
          fieldname: elem.fieldName,
          type: elem.fieldType,
          scale: 0,
          size: 0,
          rulename: [],
        };
        clone1.splice(elem.position, 0, data);
      });

      console.log(clone1);

      const swap_field = [];

      let clone2;
      SwapFieldArray.map((ele, idx) => {
        if (idx === 0) {
          console.log('sss');
          clone2 = clone1.slice();
        } else {
          console.log('first');
          clone2 = [...clone2];
        }

        // console.log(clone1 === clone2)
        const first_one = ele.swap_col_one.fieldname;
        const second_one = ele.swap_col_two.fieldname;
        const obj = {};
        // console.log(first_one)
        // console.log(second_one)
        let index1, index2;
        // console.log(clone2)
        clone2.find((el, i) => {
          if (el.fieldname === first_one) {
            obj['swap_col_one'] = i;
            index1 = i;
          }
        });
        clone2.find((el, i) => {
          if (el.fieldname === second_one) {
            obj['swap_col_two'] = i;
            index2 = i;
          }
        });
        // console.log(index1)
        // console.log(index2)

        // console.log(obj)

        swap_field.push(obj);

        function swap(x, y) {
          // console.log(x + " " + y)
          const z = clone2[y];
          clone2[y] = clone2[x];
          clone2[x] = z;
        }
        swap(index1, index2);
      });

      if (SwapFieldArray.length > 0) {
        json.swap_field = swap_field;
        console.log(clone1);
        console.log(clone2);
      }

      const del_col_seq = [];

      if (SwapFieldArray.length > 0) {
        DeleteFieldArray.map((ele) => {
          clone2.map((el, i) => {
            if (ele.fieldname === el.fieldname) {
              del_col_seq.push(i);
            }
          });
        });
      } else {
        DeleteFieldArray.map((ele) => {
          clone1.map((el, i) => {
            if (ele.fieldname === el.fieldname) {
              del_col_seq.push(i);
            }
          });
        });
      }

      if (DeleteFieldArray.length > 0) {
        json.del_col_seq = del_col_seq;
        console.log(clone2);
      }

      let clone3;

      if (SwapFieldArray.length > 0) {
        clone3 = clone2.slice(); /// update fields by Delete
        DeleteFieldArray.map((ele) => {
          clone3.map((el, i) => {
            if (ele.fieldname === el.fieldname) {
              console.log(ele.fieldname);
              clone3.splice(i, 1);
            }
          });
        });
      } else {
        clone3 = clone1.slice();
        DeleteFieldArray.map((ele) => {
          clone3.map((el, i) => {
            if (ele.fieldname === el.fieldname) {
              clone3.splice(i, 1);
            }
          });
        });
      }

      console.log(clone1);
      console.log(clone2);
      console.log(clone3);

      json.columnshift =
        formRowLevelOperation.getFieldValue().columnshift !== undefined
          ? formRowLevelOperation.getFieldValue().columnshift
          : true;
      json.junkrecords =
        formRowLevelOperation.getFieldValue().junkrecords !== undefined
          ? formRowLevelOperation.getFieldValue().junkrecords
          : true;
      json.linebreak =
        formRowLevelOperation.getFieldValue().linebreak !== undefined
          ? formRowLevelOperation.getFieldValue().linebreak
          : true;
      json.ignoreblanklines =
        formRowLevelOperation.getFieldValue().ignoreblanklines !== undefined
          ? formRowLevelOperation.getFieldValue().ignoreblanklines
          : false;
      json.skipheaders =
        formRowLevelOperation.getFieldValue().skipheaders !== undefined
          ? formRowLevelOperation.getFieldValue().skipheaders
          : false;
      json.skiptrailers =
        formRowLevelOperation.getFieldValue().skiptrailers !== undefined
          ? formRowLevelOperation.getFieldValue().skiptrailers
          : false;
      json.delimiter =
        formRowLevelOperation.getFieldValue().delimiter !== undefined
          ? formRowLevelOperation.getFieldValue().delimiter
          : ',';

      json.rule_engine_tracking_id = TimeStampID;

      if (S3Path) {
        json.s3_path = S3Path;
      }

      main = {
        NewcreatedJson: { ...json },
        NewUpdatedFields: clone3,
      };
    }
    console.log(main);
    setAddFieldArray([]);
    setDeleteFieldArray([]);
    setSwapFieldArray([]);
    return main;
  };

  const saveTableRule = async (TimeStampID, idt) => {
    try {
      setComponentSaveButton(true);
      console.log(TimeStampID);
      const metadata = {
        id: `${client.client_name}_${batch.batch_name}_${tablename}`,
        table_name: tablename,
        client_name: client.client_name,
        paramsMeta: {
          batch_name: batch.batch_name,
          client_name: client.client_name,
          table_name: tablename,
          delimiter:
            formRowLevelOperation.getFieldValue().delimiter !== undefined
              ? formRowLevelOperation.getFieldValue().delimiter
              : ',',
          file_extension: JSON.stringify(['.txt', '.csv', '.json']),
          db_status_table: 'dep_rule_engine_job_status',
          db_audit_table: 'dep_rule_engine_audit_table',
          log_group: 'cdep_rule_engine_logs',
        },
      };

      const result = await createMetadata(client.client_id, metadata);

      const pathArr = InitialTableRule.path.split('/');
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
        const { NewcreatedJson, NewUpdatedFields } = await createRuleJson(TimeStampID);

        delete NewcreatedJson['id'];
        delete NewcreatedJson['tablename'];
        delete NewcreatedJson['batchname'];
        delete NewcreatedJson['path'];
        delete NewcreatedJson['client_id'];
        delete NewcreatedJson['generated'];

        // for (let i = 0; i < newJson['fields'].length; i++) {
        //     delete newJson['fields'][i]['deleted'];
        // }

        const jsonData = {
          ...NewcreatedJson,
        };

        const filename = tablename;
        console.log(filename);
        console.log(idt);

        const saveTableJson = await storeTableRuleJson(client.client_id, batch.batch_name, filename, idt, jsonData);

        const res = await createTableRule({ ...InitialTableRule, fields: NewUpdatedFields }); // db store

        enqueueSnackbar('Table Rule Saved Successfully!', {
          variant: 'Success',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }
      setAddFieldArray([]);
      setDeleteFieldArray([]);
      setSwapFieldArray([]);
      if (componentType === 'PreProcessor' || componentType === 'RealTime') {
        setNextData({ step1: false, step2: false, step3: true, step4: true });
      }
      setComponentSaveButton(false);
    } catch (error) {
      console.log(error);
      if (error.response.status === 403) {
        enqueueSnackbar('You have only Read Permission !!', {
          variant: 'error',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }
      setComponentSaveButton(false);
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

    const pathArr = S3Path.split('/');
    pathArr.shift(0);
    pathArr.shift(0);
    pathArr.shift(0);
    const newPath = pathArr.join('/');
    pathArr.pop();
    const news3path = pathArr.join('/');

    handleS3PathModalClose();
  };

  //   const runRuleEngine = async (e) => {
  //     e.preventDefault();

  //     handleLoadingModalOpen();
  //     try {
  //       const batch_table_id = `${client.client_name}_${
  //         batch.batch_name
  //       }_${tablename}_ruleEngine_${new Date().getTime()}`;

  //       const client_job = `${client.client_name}_${batch.batch_name}_${tablename}_ruleEngine`;

  //       const data = {
  //         client_job: client_job.replaceAll(' ', ''),
  //         batch_id: batch_table_id.replaceAll(' ', ''),
  //       };
  //       const res = await createBatchidApi(data);

  //       const input = {
  //         batch: batch.batch_name,
  //         execution_id: batch_table_id.replaceAll(' ', ''),
  //         client_id: client.client_id,
  //         batch_id: batch.batch_id,
  //         table_name: tablename,
  //         client_name: client.client_name,
  //       };

  //       const response = await executeRuleEngine(input);

  //       if (response.status === 200) {
  //         setDisableRun(true);
  //         setRunStatus('In Progress');
  //         handleLoadingModalClose();
  //         enqueueSnackbar('Table Rule is running!', {
  //           variant: 'Success',
  //           autoHideDuration: 3000,
  //           anchorOrigin: { vertical: 'top', horizontal: 'right' },
  //         });
  //       }
  //     } catch (error) {
  //       if (error.response.status === 403) {
  //         enqueueSnackbar('You have only Read Permission !!', {
  //           variant: 'error',
  //           autoHideDuration: 3000,
  //           anchorOrigin: { vertical: 'top', horizontal: 'right' },
  //         });
  //       }
  //       handleLoadingModalClose();
  //     }
  //   };

  const refreshBtn = useCallback(
    async (e) => {
      e.preventDefault();
      const batchID = `${client.client_name}_${batch.batch_name}_${tablename}_ruleEngine`;

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
    [tablename]
  );

  const loadJobStatus = useCallback(async () => {
    const batchID = `${client.client_name}_${batch.batch_name}_${tablename}_ruleEngine`;

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
  }, [InitialTableRule]);

  useEffect(() => {
    if (InitialTableRule) {
      loadJobStatus();
    }
  }, [InitialTableRule]);

  const getAllFiles = async (prefix) => {
    setFilesData([]);
    // console.log(prefix)
    const res = await AllFilesOfS3(client.client_id, prefix);
    if (res.status === 200) {
      setFilesData(res.data);
    }
  };

  const showTimestampModal = async (client_name, batch_name, table_name) => {
    console.log('first');
    setIsRunModalVisible(true);
    setTableNameModal(table_name);
    const res1 = await AllFoldersOfS3(client.client_id, client_name, batch_name, table_name, client.data_region_code, client.bucket_name);
    if (res1.status === 200) {
      setFoldersData(res1.data);
    }
  };

  const handleTimestampCancel = () => {
    setIsRunModalVisible(false);
    setSubmitButtonDisable(true);
    setTimestampId('');
    form.setFieldsValue({
      Folders: '',
      Files: '',
    });
  };

  const saveButtonClick = async () => {
    if (form.getFieldValue().Files !== '') {
      setSaveLoadingStatus(true);
      const splitFile = form.getFieldValue().Files.split('/');
      const timestamp_Id = `/${splitFile[5]}/${splitFile[6]}`;
      const idt = splitFile[5];
      console.log(timestamp_Id);
      console.log(idt);
      await saveTableRule(timestamp_Id, idt);
      setTimestampId(timestamp_Id);
      setSaveLoadingStatus(false);
      setSubmitButtonDisable(false);
    } else {
      enqueueSnackbar(`Select File`, {
        variant: 'warning',
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
    }
  };

  const onTimestampFinish = async (values) => {
    setIsRunModalVisible(false);
    form.setFieldsValue({
      Folders: '',
      Files: '',
    });

    await runRuleEngine(tablename, timestampId);
    setSubmitButtonDisable(true);
  };

  const runRuleEngine = async (tablename, id) => {
    const trackingId = id.split('/')[1];
    console.log(trackingId);

    handleLoadingModalOpen();
    try {
      // const batch_table_id = `${client.client_name}_${batch.batch_name}_${tablename}_ruleEngine_${new Date().getTime()}`;
      const batch_table_id = `${client.client_name}_${batch.batch_name}_${tablename}_ruleEngine_${trackingId}`;

      const client_job = `${client.client_name}_${batch.batch_name}_${tablename}_ruleEngine`;

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
        table_name: tablename,
        client_name: client.client_name,
      };

      const response = await executeRuleEngine(input);

      if (response.status === 200) {
        // record.disableRunNew = true
        // record.status = "In Progress"
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
    }
    handleLoadingModalClose();
  };

  const columns = [
    {
      title: 'Swap Field',
      dataIndex: 'sort',
      align: 'center',
      width: '5%',
      className: 'drag-visible',
      render: () => <DragHandle />,
    },
    {
      title: 'Field Name',
      dataIndex: 'fieldname',
      align: 'center',
      width: '25%',
      // sorter: (a, b) => a.fieldname.localeCompare(b.fieldname),
      render(text, record) {
        return {
          props: {
            style: {
              fontWeight: 'bold',
              fontSize: 14,
            },
          },
          children: <div>{text}</div>,
        };
      },
    },
    {
      title: 'Field Type',
      dataIndex: 'type',
      align: 'center',
      width: '15%',
      editable: true,
    },
    {
      title: 'Size',
      dataIndex: 'size',
      align: 'center',
      width: '5%',
      editable: true,
    },
    {
      title: 'Scale',
      dataIndex: 'scale',
      align: 'center',
      width: '5%',
      editable: true,
    },
    {
      title: 'Rule Name',
      dataIndex: 'rulename',
      align: 'center',
      width: '30%',
      editable: true,
      render: (_, { rulename }) => (
        <>
          {rulename &&
            rulename.map((rule) => {
              let color = 'geekblue';

              if (rule === 'loser') {
                color = 'volcano';
              }

              return (
                <Tag color={color} key={rule}>
                  {rule}
                </Tag>
              );
            })}
        </>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      align: 'center',
      width: '20%',
      render: (_, record) => {
        const editable = isEditing(record);
        return !editable ? (
          <Space size="middle">
            <Typography.Link
              onClick={() => {
                // console.log(record)
                EditRecord(record);
              }}
              style={{
                marginRight: 8,
              }}
            >
              <Button
                shape="circle"
                icon={<EditFilled style={{ color: 'blue', fontSize: 'medium' }} />}
                size="medium"
                disabled={userRole === 'ROLE_reader'}
              />
            </Typography.Link>
            <Typography.Link
              onClick={() => {
                // console.log(record)
                deleteRecord(record);
              }}
              style={{
                marginRight: 8,
                color: 'red',
              }}
            >
              <Button
                shape="circle"
                icon={<DeleteFilled style={{ color: 'red', fontSize: 'medium' }} />}
                size="medium"
                disabled={userRole === 'ROLE_reader'}
              />
            </Typography.Link>
          </Space>
        ) : (
          <Space size="middle">
            <Typography.Link onClick={() => saveRecord(record.fieldname)}>
              <Button type="primary" shape="round" size="small" style={{ color: 'white', backgroundColor: 'green' }}>
                save
              </Button>
            </Typography.Link>
            <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
              <Button type="primary" shape="round" size="small">
                cancel
              </Button>
            </Popconfirm>
            <Typography.Link
              onClick={() => {
                deleteRecord(record);
              }}
              style={{
                marginRight: 8,
                color: 'red',
              }}
            >
              <Button type="primary" shape="round" danger icon={<DeleteFilled />} size="small">
                Delete
              </Button>
            </Typography.Link>
          </Space>
        );
      },
    },
  ];

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType:
          col.dataIndex === 'size' || col.dataIndex === 'scale'
            ? 'number'
            : col.dataIndex === 'rulename'
            ? 'select'
            : col.dataIndex === 'type'
            ? 'typeSelect'
            : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
        handleChangeFieldType,
        customRules,
      }),
    };
  });

  return (
    <>
      <Box style={header}>
        <Stack direction="row" spacing={2}>
          {(componentType === 'ruleEngine' || componentType === 'PreProcessor') && (
            <Tooltip title="Row Level Operation">
              <Button variant="outlined" color="secondary" onClick={showModal} disabled={userRole === 'ROLE_reader'}>
                <AssignmentIcon color="secondary" fontSize="small" />
              </Button>
            </Tooltip>
          )}
          {componentType === 'ruleEngine' && (
            <Tooltip title="Add Input File Location">
              <Button
                variant="outlined"
                color="error"
                onClick={handleS3PathModalOpen}
                disabled={userRole === 'ROLE_reader'}
              >
                <FileCopyIcon color="error" fontSize="small" />
              </Button>
            </Tooltip>
          )}
          {(componentType === 'PreProcessor' || componentType === 'RealTime') && (
            <Tooltip title="Save">
              <Button
                variant="outlined"
                color="primary"
                loading={ComponentSaveButton}
                onClick={() => {
                  saveTableRule();
                  // createRuleJson();
                }}
                disabled={userRole === 'ROLE_reader'}
              >
                <SaveIcon color="primary" fontSize="small" />
              </Button>
            </Tooltip>
          )}
          {componentType === 'ruleEngine' && (
            <Tooltip title="Run" style={{ cursor: disableRun ? 'no-drop' : 'pointer' }}>
              <span>
                <Button
                  variant="outlined"
                  disabled={userRole === 'ROLE_reader'}
                  color="success"
                  onClick={() => {
                    // setCurrentRecord(record);
                    showTimestampModal(client.client_name, batch.batch_name, tablename);
                  }}
                  //  onClick={runRuleEngine}
                  //  disabled={disableRun}
                >
                  <PlayArrowIcon {...(disableRun ? { color: 'disable' } : { color: 'success' })} fontSize="small" />
                </Button>
              </span>
            </Tooltip>
          )}
          {componentType === 'ruleEngine' && (
            <Link to={`/rule-engine/logs/${tablename}`} style={{ textDecoration: 'none' }}>
              <Tooltip title="View Logs">
                <Button variant="outlined" color="warning">
                  <FormatListBulletedIcon color="warning" fontSize="small" />
                </Button>
              </Tooltip>
            </Link>
          )}
          {(componentType === 'ruleEngine' || componentType === 'PreProcessor') && (
            <Tooltip title="Add new column">
              <Button variant="outlined" color="primary" onClick={AddModal} disabled={userRole === 'ROLE_reader'}>
                <AddCircleIcon color="primary" fontSize="small" />
              </Button>
            </Tooltip>
          )}
        </Stack>
        {componentType === 'ruleEngine' && (
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
                <RefreshIcon sx={{ fontSize: '1rem', marginTop: -2 }} />
              </IconButton>
            </Tooltip>
          </div>
        )}
      </Box>

      <div style={{ margin: 10, border: '2px solid black' }}>
        <Form form={form} component={false}>
          <Table
            rowClassName={(record, index) => (index % 2 === 0 ? 'table-row-light' : 'table-row-light')}
            bordered="true"
            rowKey="fieldname"
            loading={loadingStatus}
            components={{
              body: {
                cell: EditableCell,
                wrapper: DraggableContainer,
                row: DraggableBodyRow,
              },
            }}
            pagination={{
              total: UpdateTableRuleFields.length,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} Rules  `,
              position: ['bottomCenter'],
              defaultPageSize: 10,
              showSizeChanger: true,
              defaultCurrent: 1,
            }}
            columns={mergedColumns}
            dataSource={UpdateTableRuleFields}
          />
        </Form>
      </div>

      <MModal
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

          <MButton
            variant="contained"
            sx={{ mt: 2 }}
            color="secondary"
            type="submit"
            className="button-color"
            onClick={handleAdds3Path}
          >
            SUBMIT
          </MButton>
        </Box>
      </MModal>
      <Modal title="Add row" visible={isAddModalVisible} onCancel={handleAddCancel} closable centered footer={null}>
        <Form
          form={formAdd}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 14 }}
          layout="horizontal"
          size="large"
          onFinish={onAddFinish}
        >
          <Form.Item
            label="Field Name"
            name="fieldName"
            rules={[{ required: true, message: 'Please input Table name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Index" name="position" rules={[{ required: true, message: 'Please input Table name!' }]}>
            <InputNumber min={0} max={UpdateTableRuleFields.length} />
          </Form.Item>
          <Form.Item
            label="Field Type"
            name="fieldType"
            rules={[{ required: true, message: 'Please input Table name!' }]}
          >
            <Select placeholder="select Field Type">
              <Option value="integer">integer</Option>
              <Option value="string">string</Option>
              <Option value="double">double</Option>
              <Option value="datetime">datetime</Option>
              <Option value="date">date</Option>
              <Option value="time">time</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Field Value"
            name="fieldValue"
            rules={[{ required: true, message: 'Please input Table name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item style={{ marginLeft: '40%' }}>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Row Level Operation"
        visible={isModalVisible}
        onCancel={handleCancel}
        closable
        centered
        footer={null}
      >
        <Form
          form={formRowLevelOperation}
          labelCol={{ span: 30 }}
          wrapperCol={{ span: 14 }}
          style={{ fontSize: 34 }}
          layout="horizontal"
          size="large"
          onFinish={onFinish}
        >
          <Row>
            <Col span={8}>
              <Form.Item label="ignoreBlankLines" name="ignoreblanklines" valuePropName="checked">
                <Checkbox />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="skipHeaders" name="skipheaders" valuePropName="checked">
                <Checkbox />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="skipTrailers" name="skiptrailers" valuePropName="checked">
                <Checkbox />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={8}>
              <Form.Item label="columnShift" name="columnshift" valuePropName="checked">
                <Checkbox />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="junkRecords" name="junkrecords" valuePropName="checked">
                <Checkbox />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="lineBreak" name="linebreak" valuePropName="checked">
                <Checkbox />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Form.Item label="Delimiter" name="delimiter">
              <Input defaultValue="," />
            </Form.Item>
          </Row>
          <Form.Item style={{ marginLeft: '40%' }}>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title={`${tableNameModal} Rule Engine Execution`}
        visible={isRunModalVisible}
        onCancel={handleTimestampCancel}
        footer={null}
        centered
        maskClosable
      >
        <Form
          form={form}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 22 }}
          layout="horizontal"
          onFinish={onTimestampFinish}
        >
          <Form.Item
            name="Folders"
            label="TimeStamp"
            rules={[
              {
                required: true,
                message: 'Please select folder!',
              },
            ]}
          >
            <Select onChange={getAllFiles}>
              {FoldersData &&
                FoldersData.map((ele, idx) => {
                  return (
                    <Option key={idx} value={ele.value}>
                      {ele.label}
                    </Option>
                  );
                })}
            </Select>
          </Form.Item>

          <Form.Item
            name="Files"
            label="File"
            rules={[
              {
                required: true,
                message: 'Please select file!',
              },
            ]}
          >
            <Select>
              {FilesData &&
                FilesData.map((ele, idx) => {
                  return (
                    <Option key={idx} value={ele.value}>
                      {ele.label}
                    </Option>
                  );
                })}
            </Select>
          </Form.Item>
          <Row>
            <Col span={8}>
              <Form.Item style={{ marginLeft: '80%' }}>
                <Button
                  type="primary"
                  loading={saveLoadingStatus}
                  onClick={() => {
                    saveButtonClick();
                  }}
                >
                  Save
                </Button>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item style={{ marginLeft: '60%' }}>
                <Button disabled={submitButtonDisable} type="primary" htmlType="submit">
                  Run
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default RuleTableSectionNew;
