import React, { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, Button, Stack, Step, StepLabel, Stepper, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import LoadingButton from '@mui/lab/LoadingButton';
import SaveIcon from '@mui/icons-material/Save';
import PreprocessorStep1 from '../stepper/Preprocessor-stepper/PreprocessorStep1';
import { createStream, getStreamByStreamName } from "../api's/StreamApi";
import {
  createMetadata,
  createTableRule,
  fetchRuleTableByBatchName,
  fetchTableRules,
  getS3TableRules,
  listS3,
  storeTableRealTimeRuleJson,
} from "../api's/TableRuleApi";
import QueryNFlowPannel from '../flow-builder/flow-builder-pannel/QueryNFlowPannel';
import PreprocessorJobOnBoardStep2 from '../stepper/Preprocessor-stepper/PreprocessorJobOnBoardStep2';
import { getClientByName } from "../api's/ClientApi";
import { ApprovedfetchJobsApi } from "../api's/JobApi";
import { getClientRuleApi } from "../api's/ClientRuleApi";
import { getGlobalRuleApi } from "../api's/GlobalRuleApi";
import { getCustomRuleByClientId } from "../api's/CustomRuleApi";
import { ClientContext } from '../context/ClientProvider';
import { StreamContext } from '../context/StreamProvider';
import JobProvider, { JobContext } from '../context/JobProvider';
import { getFlowBuilderEdgesApi, getFlowBuilderFormApi, getFlowBuilderNodesApi } from "../api's/FlowBuilderApi";

const steps = ['Stream Table Data', 'Rule Table Data', 'Flow'];
const PreprocessingStep = () => {
  const location = useLocation();
  const streamName = location.state;

  const [streamData, setStreamData] = useState({});
  const { enqueueSnackbar } = useSnackbar();
  const [tableRule, setTableRule] = useState();

  const [newRuleEngine, setNewRuleEngine] = useState(false);
  const [newFlowBuilder, setNewFlowBuilder] = useState(false);
  const [newStorage, setNewStorage] = useState(false);
  const [jsonFile, setJsonFile] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [skipped, setSkipped] = useState(new Set());
  const [clientId, setClientId] = useState('');
  const [updateFields, setUpdateFields] = useState([]);
  const [swapIndexArray, setSwapIndexArray] = useState([]);
  const [DeleteFieldsArray, setDeleteFieldsArray] = useState([]);

  const [S3Path, setS3Path] = useState();
  const [column_shifting, setcolumn_shifting] = useState(true);
  const [ignoreblanklines, setignoreblanklines] = useState(false);
  const [skipheaders, setskipheaders] = useState(false);
  const [skiptrailers, setskiptrailers] = useState(false);
  const [DELIMITER, setDELIMITER] = useState(',');
  const [LineBreak, setLineBreak] = useState(true);
  const [JunkRecords, setJunkRecords] = useState(true);
  const [loadBtn, setLoadBtn] = useState(false);
  const { client, setClient } = useContext(ClientContext);
  const { setStream } = useContext(StreamContext);

  const { Job, setJob } = useContext(JobContext);
  const fetchStreamByStreamName = async () => {
    const response = await getStreamByStreamName(streamName);
    if (response.status === 200) {
      setStreamData(response.data);
      setStream(response.data);
      fetchClientId();
    }
  };

  const isStepOptional = (step) => {
    return false;
  };

  const isStepSkipped = (step) => {
    return skipped.has(step);
  };

  const updateStreamMetaData = async () => {
    try {
      const data = { ...streamData, ruleEngine: newRuleEngine, flowBuilder: newFlowBuilder, storage: newStorage };

      const response = await createStream(data);
    } catch (error) {
      if (error.response.status === 403) {
        enqueueSnackbar('You have only Read Permission !!', {
          variant: 'error',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }
    }
  };

  const handleNext = async () => {
    jobHandle();

    if (activeStep === 0) {
      // handlefetchRule();
      updateStreamMetaData();
    }

    if (activeStep === 1) {
      saveTableJsonToS3();
    }

    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    if (newRuleEngine && newFlowBuilder) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
    if (newRuleEngine && !newFlowBuilder) {
      setActiveStep(1);
    }

    setSkipped(newSkipped);
  };

  const jobHandle = async () => {
    setJob();
    try {
      const response = await ApprovedfetchJobsApi(clientId, streamData.stream_id);

      if (response.status === 200) {
        setJob(response.data[0].input_ref_key);
        fetchJobNodes(response.data[0].input_ref_key);
      }
    } catch (error) {
      sessionStorage.removeItem('allNodes');
      sessionStorage.removeItem('node');
      sessionStorage.removeItem('elementCount');
      sessionStorage.removeItem('saved_node');
      sessionStorage.removeItem('edges');

      if (!newRuleEngine && newFlowBuilder) {
        setActiveStep(2);
      }
    }
  };
  const fetchJobNodes = async (jobName) => {
    sessionStorage.removeItem('allNodes');
    sessionStorage.removeItem('node');
    sessionStorage.removeItem('elementCount');
    sessionStorage.removeItem('saved_node');
    sessionStorage.removeItem('edges');

    let response;

    try {
      response = await getFlowBuilderNodesApi(clientId, streamData.stream_id, jobName);
    } catch (error) {
      if (error.response.status === 404) {
        console.log(error);
      }
      return;
    }

    const getEdges = await getFlowBuilderEdgesApi(clientId, streamData.stream_id, jobName);

    const getNodesData = await getFlowBuilderFormApi(clientId, streamData.stream_id, jobName);

    let elemCount = 0;
    let nodes = '';
    let nodeData = '';
    let edges = '';

    if (response.status === 200 || getNodesData.status === 200) {
      nodes = response.data.nodes;

      nodes.forEach((el) => {
        if (el.type === 'editableNode') {
          el['id'] = `${el.id}`;
        }
      });

      nodeData = getNodesData.data.nodes;

      const newSavedElement = [];
      nodeData.forEach((el) => {
        el['nodeId'] = `${el.nodeId}`;
        elemCount++;
        newSavedElement.push(el.nodeId);
      });

      edges = getEdges.data.edges;

      edges.forEach((el) => {
        if (el.source && el.target) {
          el['id'] = `${el.id}`;
          el['source'] = `${el.source}`;
          el['target'] = `${el.target}`;
        }
      });

      sessionStorage.setItem('allNodes', JSON.stringify(nodeData));
      sessionStorage.setItem('elementCount', elemCount);
      sessionStorage.setItem('node', JSON.stringify(nodes));
      sessionStorage.setItem('edges', JSON.stringify(edges));
      sessionStorage.setItem('saved_node', JSON.stringify(newSavedElement));

      if (!newRuleEngine && newFlowBuilder) {
        setActiveStep(2);
      }
    }
  };

  const handleBack = () => {
    if (newRuleEngine && newFlowBuilder) {
      setActiveStep((prevActiveStep) => prevActiveStep - 1);
    }
    if (newRuleEngine && !newFlowBuilder) {
      setActiveStep(0);
    }

    if (!newRuleEngine && newFlowBuilder) {
      setActiveStep(0);
    }
  };

  const handleSkip = () => {
    if (!isStepOptional(activeStep)) {
      throw new Error("You can't skip a step that isn't optional.");
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped((prevSkipped) => {
      const newSkipped = new Set(prevSkipped.values());
      newSkipped.add(activeStep);
      return newSkipped;
    });
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const fetchClientId = async () => {
    const response = await getClientByName(streamData.client_name);

    if (response.status === 200) {
      setClientId(response.data[0].client_id);
      setClient(response.data[0]);
    }
  };

  useEffect(() => {
    handlefetchRule();
  }, [jsonFile]);

  const handlefetchRule = async () => {
    try {
      console.log(jsonFile);
      console.log(activeStep);

      const S3Path = jsonFile.slice();
      const pathArr = S3Path.split('/');
      pathArr.shift(0);
      pathArr.shift(0);
      pathArr.shift(0);

      console.log(pathArr);

      const newPath = pathArr.join('/');
      pathArr.pop();
      console.log(newPath);

      const tab = {
        path: newPath,
        client_id: client.client_id,
      };

      const resp = await getS3TableRules(tab);
      console.log(resp);

      if (resp.status === 200) {
        const data = {
          fields: resp.data.fields,
          client_id: client.client_id,
          batchname: streamName,
          tablename: streamName.table_name,
          path: jsonFile,
          generated: false,
        };

        console.log(data);

        let fetchTableRuleResponse = await fetchTableRules(client.client_id, data.batchname.batch_name);
        if (fetchTableRuleResponse === -1) {
          const persistResponse = await createTableRule(data);
          if (persistResponse.status === 201) {
            fetchTableRuleResponse = await fetchTableRules(client.client_id, data.batchname.batch_name);

            if (fetchTableRuleResponse.status === 200) {
              setTableRule(fetchTableRuleResponse.data);
            }
          }
        } else if (fetchTableRuleResponse.status === 200) {
          if (fetchTableRuleResponse.data === null) {
            const persistResponse = await createTableRule(data);

            if (persistResponse.status === 201) {
              fetchTableRuleResponse = await fetchTableRules(client.client_id, streamName);

              if (fetchTableRuleResponse.status === 200) {
                setTableRule(fetchTableRuleResponse.data);
              }
            }
          } else {
            setTableRule(fetchTableRuleResponse.data);
          }
        }
      }
    } catch (error) {
      console.log(error);
      // if (error.response.status === 403) {
      //   enqueueSnackbar('You have only Read Permission !!', {
      //     variant: 'error',
      //     autoHideDuration: 3000,
      //     anchorOrigin: { vertical: 'top', horizontal: 'right' },
      //   });
      // }
    }
  };

  const createRuleJson = async () => {
    const rawJson = await fetchRuleTableByBatchName(clientId, streamData.stream_name);
    let main;
    if (rawJson) {
      const duplicate_json = rawJson.fields.slice();

      let fetchClientRule;

      let fetchGlobalRule;

      let fetchCustomRule;

      rawJson.fields.map((el) => {
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
        fetchClientRule = await getClientRuleApi(clientId);
      } catch (error) {
        console.log(error);
      }
      try {
        fetchGlobalRule = await getGlobalRuleApi();
      } catch (error) {
        console.log(error);
      }
      try {
        fetchCustomRule = await getCustomRuleByClientId(clientId);
      } catch (error) {
        console.log(error);
      }

      if (
        (fetchClientRule && fetchClientRule.status === 200) ||
        (fetchGlobalRule && fetchGlobalRule.status === 200) ||
        (fetchCustomRule && fetchCustomRule.status === 200)
      ) {
        if (fetchGlobalRule) {
          rawJson.fields.map((el) => {
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
          rawJson.fields.map((el) => {
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
          rawJson.fields.map((el) => {
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

      let third_duplicate_json;

      const swap_field = [];

      swapIndexArray.map((ele, idx) => {
        if (idx === 0) {
          third_duplicate_json = [...duplicate_json];
        } else {
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
          const z = third_duplicate_json[y];
          third_duplicate_json[y] = third_duplicate_json[x];
          third_duplicate_json[x] = z;
        }
        swap(index1, index2);
      });

      if (swapIndexArray.length > 0) {
        rawJson.swap_field = swap_field;
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
        rawJson.del_col_seq = del_col_seq;
      }

      rawJson.columnshift = column_shifting;
      rawJson.junkrecords = JunkRecords;
      rawJson.linebreak = LineBreak;
      rawJson.delimiter = DELIMITER;

      main = {
        ignoreblanklines,
        skipheaders,
        skiptrailers,

        ...rawJson,
      };
    }

    return main;
  };

  const saveTableJsonToS3 = async () => {
    setLoadBtn(true);

    try {
      const metadata = {
        id: `${streamData.client_name}_${streamData.stream_name}_${streamData.table_name}`,
        table_name: streamData.table_name,
        client_name: streamData.client_name,
        paramsMeta: {
          batch_name: streamData.stream_name,
          client_name: streamData.client_name,
          table_name: streamData.table_name,
          delimiter: DELIMITER,
          file_extension: JSON.stringify(['.txt', '.csv', '.json']),
          db_status_table: 'dep_rule_engine_job_status',
          db_audit_table: 'dep_rule_engine_audit_table',
          log_group: 'cdep_rule_engine_logs',
        },
      };

      const result = await createMetadata(client.client_id, metadata);

      const newJson = await createRuleJson();

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

      const filename = streamData.table_name;

      const saveTableJson = await storeTableRealTimeRuleJson(clientId, streamData.stream_name, filename, jsonData);

      const data = { ...tableRule[0], fields: updateFields };

      const res = await createTableRule(data);
      enqueueSnackbar('Table Rule Saved Successfully!', {
        variant: 'Success',
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
    } catch (error) {
      if (error.response.status === 403) {
        enqueueSnackbar('You have only Read Permission !!', {
          variant: 'error',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }
    }
    setLoadBtn(false);
  };

  useEffect(() => {
    fetchStreamByStreamName();
  }, [streamName]);

  useEffect(() => {
    fetchClientId();
  }, [streamData]);

  return (
    <div>
      {streamData && (
        <div>
          <Box sx={{ width: '100%' }}>
            <Stepper activeStep={activeStep}>
              {steps.map((label, index) => {
                const stepProps = {};
                const labelProps = {};
                if (isStepOptional(index)) {
                  labelProps.optional = <Typography variant="caption">Optional</Typography>;
                }
                if (isStepSkipped(index)) {
                  stepProps.completed = false;
                }
                return (
                  <Step key={label} {...stepProps}>
                    <StepLabel {...labelProps}>{label}</StepLabel>
                  </Step>
                );
              })}
            </Stepper>

            {activeStep === steps.length ? (
              <>
                <Typography sx={{ mt: 2, mb: 1 }}>All steps completed - you&apos;re finished</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                  <Box sx={{ flex: '1 1 auto' }} />
                  <Button onClick={handleReset}>Reset</Button>
                </Box>
              </>
            ) : (
              <>
                {activeStep === 0 && (
                  <PreprocessorStep1
                    streamData={streamName}
                    newFlowBuilder={newFlowBuilder}
                    newRuleEngine={newRuleEngine}
                    newStorage={newStorage}
                    setNewStorage={setNewStorage}
                    setNewFlowBuilder={setNewFlowBuilder}
                    setNewRuleEngine={setNewRuleEngine}
                    jsonFile={jsonFile}
                    setJsonFile={setJsonFile}
                  />
                )}

                {activeStep === 1 && (
                  <PreprocessorJobOnBoardStep2
                    tableRule={tableRule}
                    streamId={streamData.stream_id}
                    clientId={clientId}
                    updateFields={updateFields}
                    setUpdateFields={setUpdateFields}
                    swapIndexArray={swapIndexArray}
                    setSwapIndexArray={setSwapIndexArray}
                    DeleteFieldsArray={DeleteFieldsArray}
                    setDeleteFieldsArray={setDeleteFieldsArray}
                  />
                )}

                {activeStep === 2 && <QueryNFlowPannel />}

                {activeStep <= steps.length - 1 && (
                  <Stack
                    spacing={2}
                    direction="row"
                    sx={{ mt: 3 }}
                    style={{ alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Button color="inherit" disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 1 }}>
                      Back
                    </Button>

                    {!loadBtn ? (
                      <Button type="button" variant="contained" className="button-color" onClick={handleNext}>
                        {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                      </Button>
                    ) : (
                      <LoadingButton
                        loading
                        loadingPosition="start"
                        startIcon={<SaveIcon />}
                        variant="outlined"
                        size="small"
                      >
                        {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                      </LoadingButton>
                    )}
                  </Stack>
                )}
              </>
            )}
          </Box>
        </div>
      )}
    </div>
  );
};

export default PreprocessingStep;
