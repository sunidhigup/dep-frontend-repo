import React, { useState, useEffect, memo, useReducer, useContext } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import { IconButton, MenuItem, TextField } from '@mui/material';
import Box from '@mui/material/Box';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Checkbox from '@mui/material/Checkbox';

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

const RulesTable = ({
  row,
  i,
  setScaleFn,
  setSizeFn,
  setFieldTypeFn,
  ruleNameChange,
  setDeleteFields,
  setSwapedIndex,
  uncheckRuleArray,
  getCheckFields,
  tablename,
  getFields,
  customRules,
  getDeleteField,
  DeleteFieldsArray,
  SwapFieldArrayName,
  previousDeleteFieldArray,
}) => {
  const theme = useTheme();
  const [rulename, setRulename] = useState(row.rulename || []);
  // console.log(customRules);
  const [scale, setScale] = useState(parseInt(row.scale, 10));
  const [size, setSize] = useState(row.size);
  const [fieldType, setFieldType] = useState(row.type);
  const [isChecked, setisChecked] = useState(false);
  const [disbledRow, setdisbledRow] = useState(false);

  const uncheckbox = () => {
    if (uncheckRuleArray.find((el) => el.value === row.fieldname)) {
      if (isChecked) {
        setisChecked(false);
      }
    }
  };

  useEffect(() => {
    if (uncheckRuleArray.length === 2) {
      uncheckbox();
    }
  }, [uncheckRuleArray]);

  useEffect(() => {
    if (DeleteFieldsArray.includes(row.fieldname)) {
      setdisbledRow(true);
    } else {
      setdisbledRow(false);
    }
  }, [row]);

  const handleChange = (event) => {
    const {
      target: { value },
    } = event;

    ruleNameChange({ value, colId: i });

    setRulename(typeof value === 'string' ? value.split(',') : value);
  };

  return (
    <StyledTableRow>
      <StyledTableCell align="left">
        <Checkbox
          disabled={disbledRow || row.deleted}
          checked={isChecked}
          onChange={(event) => {
            setisChecked(event.target.checked);
            setSwapedIndex({
              value: row.fieldname,
              colId: i,
              isChecked: event.target.checked,
            });
          }}
        />
      </StyledTableCell>
      <StyledTableCell align="center">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {disbledRow || row.deleted ? (
            <>
              <div style={{ color: 'red' }}>(deleted)</div>
              <div>{row.fieldname}</div>
            </>
          ) : (
            <div>{row.fieldname}</div>
          )}
        </div>
      </StyledTableCell>
      <StyledTableCell align="center">
        <TextField
          id="outlined-basic"
          select
          disabled={disbledRow || row.deleted}
          variant="outlined"
          name="persist_type"
          value={row.type}
          onChange={(e) => {
            setFieldType(e.target.value);
            setFieldTypeFn({ value: e.target.value, colId: i });
          }}
          sx={{ m: 1 }}
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
      </StyledTableCell>

      <StyledTableCell align="center">
        <TextField
          label="Size"
          variant="outlined"
          value={row.size}
          name="size"
          onChange={(e) => {
            setSize(e.target.value);
            setSizeFn({ value: e.target.value, colId: i });
          }}
          disabled={disbledRow || row.deleted}
          type="number"
          size="small"
          fullWidth
          style={{ maxWidth: 100 }}
          InputProps={{
            style: {
              fontWeight: 600,
              fontFamily: "'Roboto Slab', serif",
            },
          }}
          InputLabelProps={{
            style: { fontFamily: "'Roboto Slab', serif" },
          }}
          sx={{ m: 1 }}
        />
      </StyledTableCell>

      <StyledTableCell align="center">
        <TextField
          label="Scale"
          variant="outlined"
          value={row.scale}
          name="scale"
          onChange={(e) => {
            setScale(e.target.value);
            setScaleFn({ value: e.target.value, colId: i });
          }}
          disabled={disbledRow || row.deleted}
          type="number"
          size="small"
          fullWidth
          style={{ maxWidth: 100 }}
          InputProps={{
            style: {
              fontWeight: 600,
              fontFamily: "'Roboto Slab', serif",
            },
          }}
          InputLabelProps={{
            style: { fontFamily: "'Roboto Slab', serif" },
          }}
          sx={{ m: 1 }}
        />
      </StyledTableCell>

      <StyledTableCell align="center">
        <FormControl sx={{ m: 1, width: 200 }}>
          <InputLabel id="demo-multiple-chip-label">Rulename</InputLabel>
          <Select
            labelId="demo-multiple-chip-label"
            id="demo-multiple-chip"
            multiple
            value={rulename}
            size="small"
            disabled={disbledRow || row.deleted}
            onChange={handleChange}
            input={<OutlinedInput id="select-multiple-chip" label="Rulename" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => value && <Chip key={value} label={value} size="small" />)}
              </Box>
            )}
            MenuProps={MenuProps}
          >
            {customRules.map((ele, i) => {
              return (
                ele.type === row.type && (
                  <MenuItem value={ele.rulename} key={i} style={getStyles(ele, ele.rulename, theme)}>
                    {ele.rulename}
                  </MenuItem>
                )
              );
            })}
          </Select>
        </FormControl>
      </StyledTableCell>
      <StyledTableCell align="left">
        <Tooltip title={`Delete ${row.fieldname}`} disabled={disbledRow || row.deleted}>
          <IconButton
            color="error"
            aria-label="upload picture"
            component="span"
            onClick={(e) => {
              setdisbledRow(true);
              setDeleteFields({
                value: row.fieldname,
                colId: i,
                deleted: true,
              });
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </StyledTableCell>
    </StyledTableRow>
  );
};

export default memo(RulesTable);
