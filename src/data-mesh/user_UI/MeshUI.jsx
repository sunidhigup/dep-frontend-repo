import React, { useState, useEffect, useContext } from 'react'
import { Navigate } from 'react-router-dom'
import axios from "axios"
import { MenuItem, Accordion, AccordionSummary, AccordionDetails, TextField, Button, Box, Paper, Grid, Typography, Stack, Snackbar, ButtonGroup, Dialog, DialogActions, DialogContent, DialogTitle, Tab, CircularProgress } from '@mui/material';
import { experimentalStyled as styled } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import StorageIcon from '@mui/icons-material/Storage';
import LoadingButton from '@mui/lab/LoadingButton';
import SaveIcon from '@mui/icons-material/Save'
import PreviewIcon from '@mui/icons-material/Preview';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleSharpIcon from '@mui/icons-material/CheckCircleSharp';
import LockIcon from '@mui/icons-material/Lock';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import MuiAlert from '@mui/material/Alert';
import ShowTable from './ShowTable';
import { DATAMESH_BASEURL, HOME } from '../constants/Constant';
import { DomainContext } from '../../context/DomainProvider';
import { AccessTokenContext } from '../../context/AccessTokenProvider';

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));

const actions = [
    { icon: <ArrowRightIcon />, name: 'Execute SQL', operation: 'execute_sql' },
    { icon: <StorageIcon />, name: 'Data', operation: 'data' },

];

const MeshUI = () => {
    const [Databases, setDatabases] = useState()
    const [Db, setDb] = useState('')
    const [Tables, setTables] = useState()
    const [Table, setTable] = useState('')
    const [MetaData, setMetaData] = useState([])
    const [TableData, setTableData] = useState()
    const [selectdMetaData, setselectdMetaData] = useState();
    const [operation, setoperation] = useState();
    const [ExecuteSQLData, setExecuteSQLData] = useState();
    const [open, setopen] = useState(false)
    const [value, setValue] = React.useState();
    const [checked1, setChecked1] = useState()
    const [authentication_dialog_open, setauthentication_dialog_open] = useState(false)
    const [save_dialog_open, setsave_dialog_open] = useState(false)
    const [message, setmessage] = useState('')
    const [type, settype] = useState('')
    const [snackBarOpen, setsnackBarOpen] = useState(false);
    const [PreviewOrExecuteSqlTable, setPreviewOrExecuteSqlTable] = useState(0)
    const [cnt, setcnt] = useState(0)
    const [secret_token, setsecret_token] = useState()
    const [secret_key, setsecret_key] = useState('')
    const [loadingbtn, setloadindbtn] = useState(false)
    const [iserror, setiserror] = useState(false)
    const [FilePath, setFilePath] = useState('')
    const [FileName, setFileName] = useState('')
    const [Tableloadingbtn, setTableloadingbtn] = useState(false)
    const [FILE_PATHS, setFILE_PATHS] = useState()

    // CONTEXT API
    const { DomainType } = useContext(DomainContext)
    const { Acc_token, DomainUserName } = useContext(AccessTokenContext)

    const getAndSetToken = async () => {
        if (DomainType === 'sales') {
            const res1 = await axios.post(`${DATAMESH_BASEURL}/salesuser/get/secrettoken`, {
                secret: secret_key
            })
            const token = res1.data["access_token"]
            setsecret_token(token)
            authentication_dialog_close_handle()
            console.log(`${DATAMESH_BASEURL}/${DomainType}/${Db}/${Table}`)
            // console.log(Acc_token)
            const res = await axios.get(`${DATAMESH_BASEURL}/${DomainType}/${Db}/${Table}`, {
                headers: { Authorization: `Bearer ${token}` }
            }).then(response => {
                const len = response.data.length
                setChecked1(Array(len).fill(false))
                setMetaData(response.data)
            }).catch(error => {
                console.log(error)
            })
        }
        else if (DomainType === "customers") {
            console.log(secret_key)
            const res1 = await axios.post(`${DATAMESH_BASEURL}/customeruser/get/secrettoken`, {
                secret: secret_key
            })
            const token = res1.data["access_token"]
            setsecret_token(token)
            authentication_dialog_close_handle()
            const res = await axios.get(`${DATAMESH_BASEURL}/${DomainType}/${Db}/${Table}`, {
                headers: { Authorization: `Bearer ${token}` }
            }).then(response => {
                // console.log(response.data)
                const len = response.data.length
                setChecked1(Array(len).fill(false))
                setMetaData(response.data)
            }).catch(error => {
                console.log(error)
            })
        }
        authentication_dialog_close_handle();
    }


    const handleChange = (event) => {
        setValue(event.target.value);
    };


    useEffect(() => {
        const DomainHandleChange = async (event) => {
            const res = await axios.get(`${DATAMESH_BASEURL}/${DomainType}/databases`, {
                headers: { Authorization: `Bearer ${Acc_token}` }
            }).then(response => {
                console.log(response)
                if (response.data.includes("Error")) {
                    setiserror(true)
                }
                else {
                    // console.log(response.data)
                    setDatabases(response.data)
                }
            })
        };
        DomainHandleChange();
    }, [])

    const FilePathChange = async (event) => {
        setFilePath(event.target.value)
    }

    const DatabaseHandleChange = async (event) => {
        const newdb = event.target.value
        setDb(event.target.value)
        const res = await axios.get(`${DATAMESH_BASEURL}/${DomainType}/${newdb}/tablename`, {
            headers: { Authorization: `Bearer ${Acc_token}` }
        }).then(response => {
            setTables(response.data)
        }).catch(error => {
            console.log(error)
            setsnackBarOpen(true);
            setmessage("Not authenticated")
            settype("error")
        })

    }
    const authentication_dialog_open_handle = () => {
        setauthentication_dialog_open(true)
    };

    const authentication_dialog_close_handle = () => {
        setauthentication_dialog_open(false)
    };
    const TablesHandleChange = async (event) => {
        setTable(event.target.value)
        authentication_dialog_open_handle();
    }

    const DataButtonClicked = async (operation, value) => {
        setselectdMetaData(value)
        setoperation(operation)
        setPreviewOrExecuteSqlTable(1)
        setTableloadingbtn(true);

        const res = await axios.get(`${DATAMESH_BASEURL}/${DomainType}/${Db}/${Table}/*/%20`, {
            headers: { Authorization: `Bearer ${secret_token}` }
        }).then(response => {
            setTableData(response.data)
            setExecuteSQLData()
        }).catch(error => {
            console.log(error)
            setsnackBarOpen(true);
            setmessage("Not authenticated")
            settype("error")
        })
        setcnt(2)
        setTableloadingbtn(false)
    }

    const execute_sqlButtonClicked = async (operation, value) => {
        setPreviewOrExecuteSqlTable(2)

        console.log(value)
        setTableloadingbtn(true);
        if (value !== undefined) {
            const res = await axios.get(`${DATAMESH_BASEURL}/${DomainType}/${value}`, {
                headers: { Authorization: `Bearer ${secret_token}` }
            }).then(response => {

                setExecuteSQLData(response.data)
                setTableData()
            }).catch(error => {
                console.log(error)
                setsnackBarOpen(true);
                setmessage("Not authenticated")
                settype("error")
            })
        }
        setTableloadingbtn(false)
        setopen(true)
        setcnt(1)
    }

    const save = async () => {
        setsave_dialog_open(true)
        const res = await axios.post(`${DATAMESH_BASEURL}/${DomainType}/domain/user`, {
            "email": DomainUserName
        }).then(response => {
            console.log(response.data)
            setFILE_PATHS(response.data)
        }).catch(error => {

        })
    }

    const snackBarhandleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setsnackBarOpen(false)
    }

    const save_dialog_close_handle = () => {
        setsave_dialog_open(false)
    };

    const save_with_filepath_and_filename = async (e) => {
        setloadindbtn(true)
        await axios.post(`${DATAMESH_BASEURL}/${DomainType}/save`, {
            "path": FilePath,
            "filename": FileName
        }).then(response => {
            // console.log(response)
            setsnackBarOpen(true);
            setmessage(response.data)
            settype("success")
        }).catch(error => {
            console.log(error)
            setsnackBarOpen(true);
            setmessage("error in query")
            settype("error")
        })
        setloadindbtn(false)
    }

    return (
        <>
            {
                iserror && (
                    <h3 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'red' }}>404 PAGE NOT FOUND</h3>
                )
            }
            {
                !iserror && DomainUserName === undefined ?
                    <Navigate to={`${HOME}`} />
                    :
                    <>
                        <Paper elevation={1} sx={{ marginBottom: '30px', padding: ' 20px 0' }}>
                            <div>
                                <Stack spacing={2} sx={{ width: '100%' }}>
                                    <Snackbar anchorOrigin={{ vertical: 'top', horizontal: 'right' }} open={snackBarOpen} autoHideDuration={6000} onClose={snackBarhandleClose}>
                                        <Alert onClose={snackBarhandleClose} severity={type} sx={{ width: '100%', marginTop: '12%' }}>
                                            {message}
                                        </Alert>
                                    </Snackbar>
                                </Stack>
                            </div>
                            <Box sx={{ minWidth: 120, marginLeft: 1 }}>
                                {
                                    Databases &&
                                    <Box
                                        component="form"
                                        sx={{
                                            '& .MuiTextField-root': { m: 1, width: '25ch' },
                                        }}
                                        noValidate
                                        autoComplete="off"
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <div style={{ fontWeight: 'bold' }}>DATABASES : </div>
                                            <div>
                                                <TextField
                                                    id="Database-id"
                                                    select
                                                    value={Db}
                                                    label="Databases"
                                                    onChange={DatabaseHandleChange}
                                                    style={{ width: '20vw' }}
                                                >
                                                    {
                                                        Databases.map((ele, dbidx) => {
                                                            return (
                                                                <MenuItem key={dbidx} value={ele.database_name}>{ele.database_name}</MenuItem>
                                                            )
                                                        })
                                                    }
                                                </TextField>
                                            </div>
                                        </div>
                                    </Box>
                                }
                                <Dialog open={authentication_dialog_open} onClose={authentication_dialog_close_handle}>
                                    <DialogTitle style={{ fontWeight: 'bold', display: 'flex', justifyContent: 'center' }}>Authentication</DialogTitle>
                                    <DialogContent>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <LockIcon />
                                            <TextField
                                                autoFocus
                                                margin="dense"
                                                id="secret"
                                                label="SECRET_KEY"
                                                type="password"
                                                variant="standard"
                                                style={{ marginLeft: 10 }}
                                                onChange={(e) => setsecret_key(e.target.value)}
                                            />
                                        </div>
                                    </DialogContent>
                                    <DialogActions>
                                        <Button onClick={authentication_dialog_close_handle}><CancelIcon color='error' fontSize='large' /></Button>
                                        <Button onClick={getAndSetToken}><CheckCircleSharpIcon color='success' fontSize='large' /></Button>
                                    </DialogActions>
                                </Dialog>
                                {
                                    Databases && Tables &&
                                    <Box
                                        component="form"
                                        sx={{
                                            '& .MuiTextField-root': { m: 1, width: '25ch' },
                                        }}
                                        noValidate
                                        autoComplete="off"
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <div style={{ fontWeight: 'bold' }}>TABLES :</div>

                                            <div style={{ marginLeft: 35 }}>
                                                <TextField
                                                    id="Table-id"
                                                    select
                                                    label="Tables"
                                                    value={Table}
                                                    onChange={TablesHandleChange}
                                                    style={{ width: '20vw' }}
                                                >
                                                    {
                                                        Tables.map((ele, tindex) => {
                                                            return (
                                                                <MenuItem key={tindex} value={ele.tab_name}>{ele.tab_name}</MenuItem>
                                                            )
                                                        })
                                                    }
                                                </TextField>
                                            </div>
                                        </div>
                                    </Box>
                                }

                                {
                                    Table && secret_token &&
                                    <>
                                        <Accordion style={{ margin: 5 }}>
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
                                    </>
                                }
                                <br />

                                {
                                    Table && secret_token &&
                                    <>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <div style={{ marginRight: 30 }}>
                                                <Button variant="outlined" startIcon={<PreviewIcon />} color="success" onClick={() => { DataButtonClicked('data', value) }}>Preview</Button>
                                            </div>
                                            <div style={{ marginRight: 30 }}>
                                                <Button variant="outlined" endIcon={<PlayArrowIcon />} color="success" onClick={(e) => execute_sqlButtonClicked('execute_sql', value)}>execute_sql</Button>
                                            </div>
                                            <div>
                                                <Button size="small" onClick={save} color="primary" disabled={(cnt === 0 && true) || false}><SaveIcon />SAVE</Button>
                                            </div>
                                        </div>
                                        <br />
                                    </>
                                }

                                {
                                    Table && open &&
                                    <>
                                        {
                                            console.log(open)
                                        }
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <TextField
                                                id="outlined-multiline-flexible"
                                                label="SQL Query"
                                                multiline
                                                maxRows={4}
                                                style={{ marginLeft: 10, width: '30vw' }}
                                                value={value}
                                                onChange={handleChange}
                                            />
                                            <Button variant="outlined" endIcon={<PlayArrowIcon />} style={{ marginLeft: 20 }} color="success" onClick={(e) => execute_sqlButtonClicked('execute_sql', value)}>RUN</Button>
                                        </div>
                                        <br />
                                    </>
                                }
                                <br />
                                {
                                    <>
                                        {
                                            !Tableloadingbtn ? (
                                                <>
                                                    {
                                                        TableData &&
                                                        <div style={{ border: "2px solid black", overflowX: "auto", overflowY: "hidden", marginRight: 8 }}>
                                                            <ShowTable table={TableData} />
                                                        </div>
                                                    }
                                                </>
                                            ) : (
                                                <>
                                                    <LoadingButton
                                                        loading="true"
                                                        loadingPosition="start"
                                                        startIcon={<SaveIcon />}
                                                        style={{ display: 'flex', justifyContent: 'center' }}
                                                        variant="text"
                                                        loadingIndicator={<CircularProgress size={16} />}
                                                    >
                                                        <span style={{ color: 'blue' }}>loading...</span>
                                                    </LoadingButton>
                                                </>
                                            )
                                        }
                                    </>
                                }
                                {
                                    <>
                                        {
                                            !Tableloadingbtn ? (
                                                <>
                                                    {
                                                        ExecuteSQLData &&
                                                        <div style={{ overflowX: "auto", overflowY: "hidden", marginRight: 8 }}>
                                                            <ShowTable table={ExecuteSQLData} />
                                                        </div>
                                                    }
                                                </>
                                            ) : (
                                                <>
                                                </>
                                            )
                                        }
                                    </>
                                }
                                <div>
                                    <Dialog open={save_dialog_open} onClose={save_dialog_close_handle}>
                                        <Box style={{ borderBottom: "7px solid rgb(0,0,0,0.5)", borderRight: "7px solid rgb(0,0,0,0.5)", }}>
                                            <DialogTitle style={{ fontWeight: 'bold', display: 'flex', justifyContent: 'center' }}>Save Target</DialogTitle>
                                            <DialogContent>
                                                <Box
                                                    component="form"
                                                    sx={{
                                                        '& .MuiTextField-root': { m: 1, width: '25ch' },
                                                    }}
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
                            </Box>
                        </Paper>
                    </>
            }
        </>
    )
}

export default MeshUI