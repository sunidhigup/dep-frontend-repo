import React, { useCallback, useContext, useEffect, useReducer, useState } from 'react';
import { Stack } from '@mui/material';
import { Button, Select, Checkbox, Col, Form, Input, Modal, Row, InputNumber } from 'antd';
import { useSnackbar } from 'notistack';
import { Link, useParams } from 'react-router-dom';
import Step2Child from './Step2_child';
import { BatchContext } from '../../context/BatchProvider';
import { ClientContext } from '../../context/ClientProvider';
import { getClientRuleApi } from "../../api's/ClientRuleApi";
import { getGlobalRuleApi } from "../../api's/GlobalRuleApi";
import { getCustomRuleApi } from "../../api's/CustomRuleApi";
import {
  createMetadata,
  createTableRule,
  fetchTableRule,
  fetchTableRuleById,
  fetchTableRules,
  getS3TableRules,
  storeTableRuleJson,
} from "../../api's/TableRuleApi";
import { getTableRule } from "../../api's/PreprocessApi";

const { Option } = Select;

const Step2 = ({ step1Data, NextData, setNextData }) => {
  const params = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const { batch } = useContext(BatchContext);
  const { client } = useContext(ClientContext);
  const [form] = Form.useForm();

  const [tableRule, setTableRule] = useState();
  const [updateFields, setUpdateFields] = useState([]);
  const [swapIndexArray, setSwapIndexArray] = useState([]);
  const [DeleteFieldsArray, setDeleteFieldsArray] = useState([]);
  const [AddFieldArray, setAddFieldArray] = useState([]);
  const [newTableRule, setnewTableRule] = useState();
  const [rowLevelState, setRowLevelState] = useState();
  const [_, forceUpdate] = useReducer((x) => x + 1, 0);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [loadingStatus, setloadingStatus] = useState(false);

  const [openLoadingModal, setOpenLoadingModal] = useState(false);
  const [saveDialogOpen, setsaveDialogOpen] = useState(false);
  const [loadBtn, setLoadBtn] = useState(true);

  const handleLoadingModalOpen = useCallback(() => setOpenLoadingModal(true), []);
  const handleLoadingModalClose = useCallback(() => setOpenLoadingModal(false), []);
  const handlesaveDialogClose = useCallback(() => setsaveDialogOpen(false), []);

  const showModal = () => {
    setIsModalVisible(true);
  };
  const handleCancel = () => {
    setIsModalVisible(false);
    // form.setFieldsValue({
    //     "ignoreblanklines": false,
    //     "skipheaders": false,
    //     "skiptrailers": false,
    //     "columnshift": true,
    //     "junkrecords": true,
    //     "linebreak": true,
    //     "delimiter": ","
    // })
  };
  const onFinish = (checkedValues) => {
    console.log(checkedValues);
  };
  const AddModal = () => {
    setIsAddModalVisible(true);
  };

  // const handleOk = () => {
  //     setIsModalVisible(false);
  // };

  const handleAddCancel = () => {
    setIsAddModalVisible(false);
  };

  const onAddFinish = (values) => {
    console.log(values);
    setRowLevelState(values);
    handleAddRow();
    setIsAddModalVisible(false);
  };

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

    // handleRowInputClose();
  }, [updateFields, rowLevelState, AddFieldArray]);

  useEffect(() => {
    forceUpdate();
  }, [AddFieldArray, DeleteFieldsArray]);

  const getTableRules = useCallback(async () => {
    // setLoadBtn(true);
    try {
      const response = await fetchTableRuleById(params.id);
      // const response = await fetchTableRule(client.client_id, batch.batch_name, step1Data.tableName);

      if (response.status === 200) {
        setnewTableRule(response.data);
        setTableRule(response.data);
        setUpdateFields(response.data.fields);
      }
      // setLoadBtn(false);
    } catch (error) {
      // enqueueSnackbar('Something went wrong!', {
      //     variant: 'Error',
      //     autoHideDuration: 3000,
      //     anchorOrigin: { vertical: 'top', horizontal: 'right' },
      // });
    }

    // setLoadBtn(false);
  }, []);

  const handlefetchRule = async () => {
    try {
      const S3Path = step1Data.s3Path.slice();
      const pathArr = S3Path.split('/');
      pathArr.shift(0);
      pathArr.shift(0);
      pathArr.shift(0);

      const newPath = pathArr.join('/');
      pathArr.pop();

      const tab = {
        path: newPath,
        client_id: client.client_id,
      };
      const resp = await getS3TableRules(tab);

      if (resp.status === 200) {
        const data = {
          fields: resp.data.fields,
          client_id: client.client_id,
          batchname: batch.batch_name,
          tablename: step1Data.tableName,
          path: step1Data.s3Path,
          generated: false,
        };

        console.log(data);

        let fetchTableRuleResponse = await getTableRule(client.client_id, batch.batch_name, step1Data.tableName);
        if (fetchTableRuleResponse === -1) {
          console.log('second');
          const persistResponse = await createTableRule(data);
          if (persistResponse.status === 201) {
            fetchTableRuleResponse = await fetchTableRules(client.client_id, batch.batch_name);

            if (fetchTableRuleResponse.status === 200) {
              setTableRule(fetchTableRuleResponse.data);
            }
          }
        } else if (fetchTableRuleResponse.status === 200) {
          console.log('first');
          console.log(step1Data);
          if (fetchTableRuleResponse.data === null) {
            const persistResponse = await createTableRule(data);

            if (persistResponse.status === 201) {
              fetchTableRuleResponse = await fetchTableRules(client.client_id, batch.batch_name);

              if (fetchTableRuleResponse.status === 200) {
                setTableRule(fetchTableRuleResponse.data);
              }
            }
          } else {
            // setActiveStep(activeStep + 1)
            console.log(fetchTableRuleResponse.data);
            console.log(fetchTableRuleResponse.data[0]);
            setTableRule(fetchTableRuleResponse.data[0]);
          }
        }
      }
    } catch (error) {
      console.log(error);
      if (error.response.status === 403) {
        enqueueSnackbar('You have only Read Permission !!', {
          variant: 'error',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }
    }
  };

  const createRuleJson = async (fetchedJson) => {
    const response = await fetchTableRule(client.client_id, batch.batch_name, step1Data.tableName);
    // const response = await fetchTableRuleById(params.id);
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

      json.columnshift = form.getFieldValue().columnshift || true;
      json.junkrecords = form.getFieldValue().junkrecords || true;
      json.linebreak = form.getFieldValue().linebreak || true;
      json.ignoreblanklines = form.getFieldValue().ignoreblanklines || false;
      json.skipheaders = form.getFieldValue().skipheaders || false;
      json.skiptrailers = form.getFieldValue().skiptrailers || false;
      json.delimiter = form.getFieldValue().delimiter || ',';
      // if (S3Path) {
      //     json.s3_path = S3Path;
      // }

      main = {
        ...json,
      };
    }
    return main;
  };

  const handleSaveTableRule = async () => {
    setloadingStatus(true);
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
          // delimiter: DELIMITER,
          file_extension: JSON.stringify(['.txt', '.csv', '.json']),
          db_status_table: 'dep_rule_engine_job_status',
          db_audit_table: 'dep_rule_engine_audit_table',
          log_group: 'cdep_rule_engine_logs',
        },
      };

      const result = await createMetadata(client.client_id, metadata);

      const pathArr = tableRule.path.split('/');
      console.log(pathArr);
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
        console.log('dd');
        const newJson = await createRuleJson(tableRule); // json of database

        console.log('wdqwd');
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

        console.log({ ...tableRule, fields: updateFields });
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
      setNextData({ step1: false, step2: false, step3: true, step4: true });
    } catch (error) {
      console.log(error);
      if (error.response.status === 403) {
        enqueueSnackbar('You have only Read Permission !!', {
          variant: 'error',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }
      handleLoadingModalClose();
    }
    setloadingStatus(false);
  };
  useEffect(() => {
    handlefetchRule();
  }, []);
  return (
    <>
      <Stack
        direction="row"
        spacing={2}
        alignItems={'center'}
        justifyContent={'space-between'}
        margin={'20px'}
        // marginRight={'20px'}
      >
        <div>
          <Button type="primary" onClick={showModal}>
            Row Level Operation
          </Button>
          {/* <Button type='primary' style={{ marginLeft: 5 }} onClick={AddModal}>
                        Add
                    </Button> */}
        </div>
        <Button loading={loadingStatus} type="primary" onClick={handleSaveTableRule}>
          SAVE
        </Button>
      </Stack>
      <div style={{ margin: 20 }}>
        <Step2Child
          tableRule={tableRule}
          clientId={client.client_id}
          updateFields={updateFields}
          setUpdateFields={setUpdateFields}
          swapIndexArray={swapIndexArray}
          setSwapIndexArray={setSwapIndexArray}
          DeleteFieldsArray={DeleteFieldsArray}
          setDeleteFieldsArray={setDeleteFieldsArray}
        />
      </div>
      <br />
      <br />
      <br />
      <Modal
        title="PreProcessor Row Level Operation"
        visible={isModalVisible}
        onCancel={handleCancel}
        closable
        centered
        footer={null}
      >
        <Form
          form={form}
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

      <Modal title="Add row" visible={isAddModalVisible} onCancel={handleAddCancel} closable centered footer={null}>
        <Form
          form={form}
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
            <InputNumber min={0} />
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
    </>
  );
};

export default Step2;
