import { LoadingButton } from '@mui/lab';
import { Box, Button, MenuItem, Modal, TextField } from '@mui/material';
import { useSnackbar } from 'notistack';
import React, { useState } from 'react';
import SaveIcon from '@mui/icons-material/Save';
import { createCustomRuleApi, getArgsByRulenameApi, getRuleByTypeApi } from "../../api's/CustomRuleApi";
import InputField from '../../reusable-components/InputField';

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

const FieldValues = ['integer', 'date'];
const AddNewRuleModal = ({ openCreateRuleModal, setOpenCreateRuleModal, clientId, streamId }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [type, setType] = useState('');
  const [rulename, setRulename] = useState('');
  const [argvalue, setArgvalue] = useState('');
  const [fetchArgs, setfetchArgs] = useState('');
  const [rulesData, setrulesData] = useState([]);
  const [loadBtn, setLoadBtn] = useState(false);

  const handleCreateRuleModalClose = () => {
    setOpenCreateRuleModal(false);
    setRulename('');
    setArgvalue('');
    setType('');
    setfetchArgs('');
    setrulesData([]);
  };

  const handleAddRule = async (e) => {
    e.preventDefault();
    setLoadBtn(true);

    try {
      const data = {
        client_id: clientId,
        batch_id: streamId,
        argvalue,
        rulename,
        type,
        argkey: fetchArgs,
      };
      const response = await createCustomRuleApi(data);

      if (response.status === 201 || response.status === 200) {
        enqueueSnackbar('Custom Rule Saved!', {
          variant: 'success',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });

        setLoadBtn(false);
        handleCreateRuleModalClose();

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

  const handleFieldType = async (e) => {
    setRulename('');
    setArgvalue('');
    setfetchArgs('');
    setrulesData([]);
    setType(e.target.value);
    const res = await getRuleByTypeApi(e.target.value);

    if (res.status === 200) {
      setrulesData(res.data);
    }
    if (res.status === 204) {
      enqueueSnackbar(`There is no rule for ${e.target.value} `, {
        variant: 'warning',
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
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

  return (
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
            //  disabled={editEnabled}
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
              //  disabled={editEnabled}
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
              disabled={!rulename && argvalue}
              type="submit"
              variant="contained"
              size="small"
              className="button-color"
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
  );
};

export default AddNewRuleModal;
