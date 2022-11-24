import React, { useState, useEffect } from 'react'
import { MenuItem, Accordion, AccordionSummary, AccordionDetails, TextField, Button, Box, Paper, Grid, Typography, Stack, Snackbar, ButtonGroup, Dialog, DialogActions, DialogContent, DialogTitle, Tab, CircularProgress } from '@mui/material';
import { experimentalStyled as styled } from '@mui/material/styles';
import { Divider } from 'antd';
import { useSnackbar } from 'notistack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PreviewIcon from '@mui/icons-material/Preview';
import SaveIcon from '@mui/icons-material/Save'
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleSharpIcon from '@mui/icons-material/CheckCircleSharp';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import LoadingButton from '@mui/lab/LoadingButton';
import { getSalesMetaData, getCustomersMetaData, getTableDataByTable, postSaveFilePath, getExecuteSqlData, postSaveFilePathAndFileName } from "../api's/DataMeshApi";
import MeshTable from './MeshTable';

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));

const MeshData = ({ secretToken, Domain, database, table, DomainUserName }) => {
    const { enqueueSnackbar } = useSnackbar();
    const [MetaData, setMetaData] = useState([])
    const [TableData, setTableData] = useState([])
    const [ExecuteSQLData, setExecuteSQLData] = useState();
    const [PreviewOrExecuteSqlTable, setPreviewOrExecuteSqlTable] = useState(0)
    const [HideQuery, setHideQuery] = useState(true)
    const [Tableloadingbtn, setTableloadingbtn] = useState(false)
    const [loadingbtn, setloadindbtn] = useState(false)
    const [open, setopen] = useState(false)
    const [cnt, setcnt] = useState(0)
    const [query, setquery] = useState('')
    const [save_dialog_open, setsave_dialog_open] = useState(false)

    const [FilePath, setFilePath] = useState('')
    const [FileName, setFileName] = useState('')
    const [FILE_PATHS, setFILE_PATHS] = useState()

    const getMetaData = async () => {
        let res
        if (Domain === "sales") {
            res = await getSalesMetaData(Domain, database, table, secretToken)
        } else {
            res = await getCustomersMetaData(Domain, database, table, secretToken)
        }
        if (res.status === 200) {
            setMetaData(res.data)
        }
    }
    useEffect(() => {
        getMetaData();
    }, [secretToken])


    const DataButtonClicked = async (operation, value) => {
        // setoperation(operation)
        setTableloadingbtn(true);
        setPreviewOrExecuteSqlTable(1)
        const response = await getTableDataByTable(Domain, database, table, secretToken)
        if (response.status === 200) {
            setTableData(response.data)
        }
        // setcnt(2)
        setTableloadingbtn(false)
    }

    const execute_sqlButtonClicked = async (operation, query) => {
        setPreviewOrExecuteSqlTable(2)
        setTableloadingbtn(true);

        try {
            if (query !== undefined) {
                const response = await getExecuteSqlData(Domain, query, secretToken)
                if (response.status === 200) {
                    if (typeof response.data === "string") {
                        enqueueSnackbar('Wrong query format', {
                            variant: 'error',
                            autoHideDuration: 3000,
                            anchorOrigin: { vertical: 'top', horizontal: 'right' },
                        });
                    } else {
                        setExecuteSQLData(response.data)
                    }
                }
            }
        } catch (error) {
            if (error.response.status === 403) {
                enqueueSnackbar('', {
                    variant: 'error',
                    autoHideDuration: 3000,
                    anchorOrigin: { vertical: 'top', horizontal: 'right' },
                });
            }

        }
        setTableloadingbtn(false)
        setopen(true)
        setcnt(1)
    }

    const save = async () => {
        setsave_dialog_open(true)
        const response = await postSaveFilePath(Domain, DomainUserName)
        if (response.status === 200) {
            setFILE_PATHS(response.data)
        }
    }

    const save_dialog_close_handle = () => {
        setsave_dialog_open(false)
    };

    const FilePathChange = async (event) => {
        setFilePath(event.target.value)
    }

    const save_with_filepath_and_filename = async (e) => {
        setloadindbtn(true)
        try {
            const response = await postSaveFilePathAndFileName(Domain, FilePath, FileName)
            if (response.status === 200) {
                enqueueSnackbar('response.data', {
                    variant: 'success',
                    autoHideDuration: 3000,
                    anchorOrigin: { vertical: 'top', horizontal: 'right' },
                });
            }
        } catch (error) {
            enqueueSnackbar(error, {
                variant: 'error',
                autoHideDuration: 3000,
                anchorOrigin: { vertical: 'top', horizontal: 'right' },
            });
        }
        setloadindbtn(false)
    }

    return (
        <>
            <Accordion style={{ padding: 5, marginTop: 20 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header" style={{ backgroundColor: '#53dab1' }}>
                    <Box sx={{ width: '100%', maxWidth: 500, display: 'flex', color: "white", height: 25 }}>
                        <Typography variant="h5" component="div" gutterBottom style={{ display: 'flex', justifyContent: 'center', fontWeight: 'bold', marginLeft: 30 }}>
                            Meta Data
                        </Typography>
                    </Box>
                </AccordionSummary>
                <AccordionDetails>
                    <Box sx={{ flexGrow: 1 }} style={{ backgroundColor: "black", padding: 10 }}>
                        <Grid container spacing={{ xs: 2, md: 1 }} columns={{ xs: 4, sm: 8, md: 16 }}>
                            {MetaData.map((row, md_idx) => (
                                <Grid item xs={2} sm={4} md={4} key={md_idx}>
                                    <Item style={{ fontWeight: 'bold', textTransform: 'uppercase', color: 'green' }}>
                                        <label>{row.COLUMN_NAME}</label>
                                    </Item>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                </AccordionDetails>
            </Accordion>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ marginRight: 30 }}>
                    <Button variant="outlined" startIcon={<PreviewIcon />} color="success" onClick={() => { DataButtonClicked('data') }}>Preview</Button>
                </div>
                <div style={{ marginRight: 30 }}>
                    <Button variant="outlined" color="success" onClick={(e) => setHideQuery(!HideQuery)}>SQL Query</Button>
                </div>
                <div>
                    <Button size="small" onClick={save} color="primary" disabled={(cnt === 0 && true) || false}><SaveIcon />SAVE</Button>
                </div>
            </div>
            <Divider />

            {
                table &&
                <>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <TextField
                            id="outlined-multiline-flexible"
                            label="SQL Query"
                            multiline
                            maxRows={4}
                            hidden={HideQuery}
                            style={{ marginLeft: 10, width: '30vw' }}
                            value={query}
                            onChange={(e) => { setquery(e.target.value) }}
                        />
                        <Button
                            variant="outlined"
                            endIcon={<PlayArrowIcon />}
                            style={{ marginLeft: 20 }}
                            hidden={HideQuery}
                            color="success"
                            onClick={(e) => execute_sqlButtonClicked('execute_sql', query)}>
                            RUN
                        </Button>
                    </div>
                    <br />
                </>
            }

            <div>
                {
                    TableData && (
                        <MeshTable table={TableData} />
                    )
                }
                {
                    ExecuteSQLData && (
                        <MeshTable table={ExecuteSQLData} />
                    )
                }
            </div>

            <div>
                <Dialog open={save_dialog_open} onClose={save_dialog_close_handle}>
                    <Box style={{ borderBottom: "7px solid rgb(0,0,0,0.5)", borderRight: "7px solid rgb(0,0,0,0.5)", }}>
                        <DialogTitle style={{ fontWeight: 'bold', display: 'flex', justifyContent: 'center' }}>Save Target</DialogTitle>
                        <DialogContent>
                            <Box
                                component="form"
                                sx={{ '& .MuiTextField-root': { m: 1, width: '25ch' } }}
                                noValidate
                                autoComplete="off"
                            >
                                <div>
                                    <TextField
                                        id="Database-id"
                                        select
                                        value={FilePath}
                                        label="Target"
                                        onChange={FilePathChange}
                                        fullWidth
                                    >
                                        {
                                            FILE_PATHS && FILE_PATHS.map((ele, fp_idx) => {
                                                return (
                                                    <MenuItem key={fp_idx} value={ele}>{ele}</MenuItem>
                                                )
                                            })
                                        }
                                    </TextField>
                                </div>

                            </Box>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <TextField
                                    autoFocus
                                    margin="dense"
                                    id="FileName"
                                    label="File Name"
                                    type="text"
                                    variant="standard"
                                    style={{ marginLeft: 10 }}
                                    onChange={(e) => setFileName(e.target.value)}
                                />
                            </div>


                        </DialogContent>
                        <DialogActions>
                            <Button onClick={save_dialog_close_handle}><CancelIcon color='error' fontSize='large' /></Button>
                            {!loadingbtn ? (
                                <Button
                                    id="save"
                                    style={{ marginLeft: 10 }}
                                    onClick={save_with_filepath_and_filename}>
                                    <CheckCircleSharpIcon color='success' fontSize='large' />
                                </Button>
                            ) : (
                                <LoadingButton
                                    loading
                                    loadingPosition="start"
                                    startIcon={<SaveIcon />}
                                    variant="outlined"
                                />
                            )}
                        </DialogActions>
                    </Box>
                </Dialog>
            </div>
        </>
    )
}

export default MeshData