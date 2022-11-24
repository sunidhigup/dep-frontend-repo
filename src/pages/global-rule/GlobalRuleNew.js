import React, { useState, useEffect, useContext } from 'react';
import { useSnackbar } from 'notistack';
import 'antd/dist/antd.css';
import { Space, Table, Typography, Button } from 'antd';
import { DeleteFilled, EditFilled } from '@ant-design/icons';
import { Box, Paper, Modal, MenuItem, Stack } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import SaveIcon from '@mui/icons-material/Save';
import InputField from '../../reusable-components/InputField';
import { BatchContext } from '../../context/BatchProvider';
import {
  createGlobalRuleApi,
  deleteGlobalRuleApi,
  getGlobalRuleApi,
  getGlobalRuleByRulenameApi,
  updateGlobalRuleApi,
} from "../../api's/GlobalRuleApi";
import { getArgsByRulenameApi, getRuleByTypeApi } from "../../api's/CustomRuleApi";

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

const GlobalRuleNew = ({ userRole }) => {
  const FieldValues = ['integer', 'date'];
  const { batch } = useContext(BatchContext);
  const { enqueueSnackbar } = useSnackbar();
  const [loadBtn, setLoadBtn] = useState(false);
  const [rulename, setRulename] = useState();
  const [argvalue, setArgvalue] = useState();
  const [type, setType] = useState('');
  const [globalRules, setGlobalRules] = useState([]);
  const [editEnabled, setEditEnabled] = useState(false);
  const [openCreateRuleModal, setOpenCreateRuleModal] = useState(false);
  const [fetchArgs, setfetchArgs] = useState('');
  const [rulesData, setrulesData] = useState([]);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [currentRecord, setCurrentRecord] = useState('');

  const handleDeleteModalOpen = () => setOpenDeleteModal(true);

  const handleDeleteModalClose = () => setOpenDeleteModal(false);

  const handleCreateRuleModalOpen = () => setOpenCreateRuleModal(true);

  const handleAddRule = async (e) => {
    e.preventDefault();
    setLoadBtn(true);
    try {
      let response;
      if (editEnabled) {
        const data = {
          client: batch,
          argvalue,
          rulename,
          type,
          argkey: fetchArgs,
        };

        response = await updateGlobalRuleApi(data);

        setEditEnabled(false);
      } else {
        const data = {
          argvalue,
          rulename,
          type,
          argkey: fetchArgs,
        };

        response = await createGlobalRuleApi(data);
      }

      if (response.status === 201 || response.status === 200) {
        enqueueSnackbar('Global Rule Saved!', {
          variant: 'success',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
        fetchGlobalRule();
        setLoadBtn(false);
        handleCreateRuleModalClose();
        setEditEnabled(false);
        setRulename('');
        setArgvalue('');
        setType('');
      }
    } catch (error) {
      if (error.response.status === 409) {
        enqueueSnackbar('Rule name already exist!', {
          variant: 'error',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }
      if (error.response.status === 403) {
        enqueueSnackbar('You have only Read Permission !!', {
          variant: 'error',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }

      handleCreateRuleModalClose();
    }
    setLoadBtn(false);
  };

  const handleCreateRuleModalClose = () => {
    setOpenCreateRuleModal(false);
    setRulename();
    setArgvalue();
    setType('');
    setfetchArgs('');
    setrulesData([]);
    setEditEnabled(false);
  };

  const handleFieldType = async (e) => {
    setRulename();
    setArgvalue();
    setfetchArgs('');
    setrulesData([]);
    setType(e.target.value);
    try {
      const res = await getRuleByTypeApi(e.target.value);
      if (res.status === 200) {
        setrulesData(res.data);
      }
    } catch (error) {
      if (error.response.status === 404) {
        enqueueSnackbar(`There is no rule for ${e.target.value} `, {
          variant: 'warning',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }
    }
  };

  const handleRuleNameChange = async (event) => {
    setRulename(event.target.value);

    try {
      const res = await getArgsByRulenameApi(event.target.value);

      if (res.status === 200) {
        setfetchArgs(res.data);
      }
    } catch (error) {
      // console.log(error)
    }
  };

  const fetchGlobalRule = async () => {
    try {
      const response = await getGlobalRuleApi();
      if (response.status === 200) {
        setGlobalRules(response.data);
      }
    } catch (error) {
      if (error.response.status === 404) {
        setGlobalRules([]);
        enqueueSnackbar(`No Global rules found! `, {
          variant: 'warning',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }
    }
  };

  useEffect(() => {
    fetchGlobalRule();

    return () => {
      setGlobalRules([]);
    };
  }, []);

  const handleDeleteRule = async (e, id) => {
    e.preventDefault();
    setLoadBtn(true);

    try {
      const response = await deleteGlobalRuleApi(id);
      if (response.status === 200) {
        try {
          const response = await getGlobalRuleApi();
          if (response.status === 200) {
            setGlobalRules(response.data);
          }
        } catch (error) {
          if (error.response.status === 404) {
            setGlobalRules([]);
          }
        }
        enqueueSnackbar('Rule deleted successfully!', {
          variant: 'success',
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
    handleDeleteModalClose();
    setLoadBtn(false);
  };

  const handleFetchRuleByName = async (ruleName) => {
    try {
      const response = await getGlobalRuleByRulenameApi(ruleName);

      const res = await getArgsByRulenameApi(ruleName);

      if (res.status === 200) {
        setfetchArgs(res.data);
      }

      if (response.status === 200) {
        setType(response.data.type);
        setRulename(response.data.rulename);
        setArgvalue(response.data.argvalue);
      }
    } catch (error) {
      if (error.response.status === 404) {
        enqueueSnackbar(`No rules found! `, {
          variant: 'warning',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }
    }

    handleCreateRuleModalOpen();
  };

  const DeleteRecord = () => {};
  const columns = [
    {
      title: 'Rule Name',
      dataIndex: 'rulename',
      align: 'center',
      width: '30vw',
      sorter: (a, b) => a.rulename.localeCompare(b.rulename),
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
      title: 'Arg Value',
      dataIndex: 'argvalue',
      align: 'center',
      width: '15vw',
      sorter: (a, b) => a.argvalue.localeCompare(b.argvalue),
    },
    {
      title: 'Field Type',
      dataIndex: 'type',
      align: 'center',
      width: '15vw',
      sorter: (a, b) => a.type.localeCompare(b.type),
    },
    {
      title: 'Action',
      key: 'action',
      sorter: false,
      align: 'center',
      render: (_, record) => {
        return (
          <Space size="middle">
            <Typography.Link
              onClick={() => {
                setEditEnabled(true);
                handleFetchRuleByName(record.rulename);
              }}
              style={{
                marginRight: 8,
                color: 'red',
              }}
            >
              <Button
                type="primary"
                shape="round"
                icon={<EditFilled />}
                size="medium"
                disabled={userRole === 'ROLE_reader'}
              >
                Edit
              </Button>
            </Typography.Link>
            <Typography.Link
              onClick={() => {
                setCurrentRecord(record.id);
                // console.log(record)
                handleDeleteModalOpen();
              }}
              style={{
                marginRight: 8,
                color: 'red',
              }}
            >
              <Button
                type="primary"
                shape="round"
                danger
                icon={<DeleteFilled />}
                size="medium"
                disabled={userRole === 'ROLE_reader'}
              >
                Delete
              </Button>
            </Typography.Link>
          </Space>
        );
      },
    },
  ];

  const tableColumns = columns.map((item) => ({ ...item }));
  return (
    <>
      <Paper elevation={5}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: 10 }}>
          <h3 style={{ ml: 10, color: 'blue', fontWeight: 'bold' }}>{batch.batch_name}</h3>
          <Button
            style={{ backgroundColor: 'green', color: 'white' }}
            shape="round"
            onClick={handleCreateRuleModalOpen}
            disabled={userRole === 'ROLE_reader'}
          >
            Add Global Rule
          </Button>
        </div>
        <div style={{ marginTop: 10, border: '2px solid black' }}>
          <Table
            rowClassName={(record, index) => (index % 2 === 0 ? 'table-row-light' : 'table-row-light')}
            bordered="true"
            pagination={{
              total: globalRules.length,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} Rules  `,
              position: ['bottomCenter'],
              defaultPageSize: 5,
              defaultCurrent: 1,
            }}
            columns={tableColumns}
            dataSource={globalRules}
          />
        </div>
      </Paper>
      <Modal
        open={openCreateRuleModal}
        onClose={handleCreateRuleModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <form autoComplete="off" onSubmit={handleAddRule}>
            <InputField
              select
              id="outlined-basic"
              label="Field Type"
              variant="outlined"
              fullWidth
              name="type"
              value={type}
              autoComplete="off"
              required
              disabled={editEnabled}
              onChange={(event) => handleFieldType(event)}
            >
              {FieldValues.map((ele, field_idx) => {
                return (
                  <MenuItem key={field_idx} value={ele}>
                    {ele}
                  </MenuItem>
                );
              })}
            </InputField>
            {editEnabled && (
              <InputField
                id="outlined-basic"
                label="Rulename"
                variant="outlined"
                fullWidth
                name="rulename"
                disabled={editEnabled}
                value={rulename}
              />
            )}
            {rulesData.length > 0 && (
              <InputField
                select
                id="outlined-basic"
                label="Rule Name"
                variant="outlined"
                fullWidth
                name="rulename"
                value={rulename}
                autoComplete="off"
                disabled={editEnabled}
                required
                onChange={(event) => handleRuleNameChange(event)}
              >
                {rulesData.map((ele, ruledata_idx) => {
                  return (
                    <MenuItem key={ruledata_idx} value={ele}>
                      {ele}
                    </MenuItem>
                  );
                })}
              </InputField>
            )}
            {rulename && (
              <InputField
                id="outlined-basic"
                label="Args Value"
                variant="outlined"
                fullWidth
                name="argvalue"
                value={argvalue}
                autoComplete="off"
                required
                onChange={(event) => setArgvalue(event.target.value)}
                helperText={`Example: [${fetchArgs}]`}
              />
            )}

            {!loadBtn ? (
              <Button
                disabled={!rulename && !argvalue}
                onClick={handleAddRule}
                size="middle"
                shape="round"
                style={{ marginTop: '15px' }}
              >
                Save
              </Button>
            ) : (
              <LoadingButton
                loading
                loadingPosition="start"
                startIcon={<SaveIcon />}
                variant="outlined"
                size="small"
                style={{ marginTop: '15px' }}
              >
                Save
              </LoadingButton>
            )}
          </form>
        </Box>
      </Modal>
      <Modal
        open={openDeleteModal}
        onClose={handleDeleteModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          Are you sure you want to delete this rule?
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              color="secondary"
              type="submit"
              onClick={handleDeleteModalClose}
              className="outlined-button-color"
              disabled={loadBtn}
            >
              Cancel
            </Button>

            {!loadBtn ? (
              <Button
                variant="contained"
                color="secondary"
                type="submit"
                onClick={(e) => handleDeleteRule(e, currentRecord)}
                className="button-color"
              >
                Delete
              </Button>
            ) : (
              <LoadingButton loading loadingPosition="start" startIcon={<SaveIcon />} variant="outlined" sx={{ mt: 2 }}>
                Delete
              </LoadingButton>
            )}
          </Stack>
        </Box>
      </Modal>
    </>
  );
};

export default GlobalRuleNew;
