import React, { useState, useEffect, memo, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import {
    Button,
    Typography,
    Toolbar,
    Dialog,
    Slide,
    IconButton,
    AppBar,
    ButtonGroup,
    TextField,
    MenuItem,
    Grid,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InputField from '../../../reusable-components/InputField';
import { getCustomer360SegmentApi } from "../../../api's/FlowBuilderApi";

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="left" ref={ref} {...props} />;
});

const INITIALSTATE = {
    path: '',
    alias: '',
    segment: '',
    otherBlocksConnected: false
};

const NodeModal_C360 = ({ open, handleClose, nodeId, nodeName, getProp, nodes, edges, changeNodeName }) => {
    const [formField, setFormField] = useState(INITIALSTATE);
    const [disableForm, setDisableForm] = useState(false);
    const [AllSegments, setAllSegments] = useState([])
    const { enqueueSnackbar } = useSnackbar();

    const store = JSON.parse(sessionStorage.getItem('allNodes'));

    const getLocalData = () => {
        const findSrcNodeId = [];
        edges.forEach((el) => {
            if (el.target === nodeId) {
                findSrcNodeId.push(el.source);
            }
        });

        if (store && findSrcNodeId) {
            const header = [];

            findSrcNodeId.forEach((item, i) => {
                store.forEach((node) => {
                    if (node.nodeId === item && node.nodeName === 'Write') {
                        header.push(node);
                    }
                });
            });

            console.log(header)
            if (header.length === 0) {
                console.log(formField)
                setFormField({ alias: '', otherBlocksConnected: false, segment: '', path: '' })
            }
            else if (header.length > 0) {
                formField.otherBlocksConnected = true;
                setFormField({ ...formField, path: header[0].formField.path, otherBlocksConnected: true });
            }

            store.forEach((node) => {
                if (node.nodeId === nodeId) {
                    formField.otherBlocksConnected = true;
                    // setFormField({ ...formField, path: header[0].formField.path });
                    setFormField(node.formField)
                    if (node.disabled) {
                        setDisableForm(node.disabled);
                    }
                }
            });
        }
    };

    useEffect(() => {
        setFormField(INITIALSTATE);
        getLocalData();
    }, [nodeId]);

    const sendFormData = {
        nodeId,
        nodeName,
        formField,
        disabled: false,
        step_name: nodeName,
    };

    let name, value;
    const handleInputChange = (e) => {
        name = e.target.name;
        value = e.target.value;

        setFormField({
            ...formField,
            [name]: value,
        });
    };

    useEffect(() => {
        getProp(sendFormData);
    }, [formField]);

    const handleResetForm = () => {
        setFormField(INITIALSTATE);
    };


    const getAllSegments = async () => {
        const response = await getCustomer360SegmentApi();
        if (response.status === 200) {
            setAllSegments(response.data)
        }
    }

    useEffect(() => {
        getAllSegments();
    }, []);

    const handleFormsubmit = async (e) => {
        e.preventDefault();

        const regex = /^s3:\/\//i;

        if (!regex.test(formField.path)) {
            enqueueSnackbar('S3 path is invalid!', {
                variant: 'error',
                autoHideDuration: 3000,
                anchorOrigin: { vertical: 'top', horizontal: 'right' },
            });
            return;
        }

        const getAllNodes = JSON.parse(sessionStorage.getItem('allNodes') || '[]');

        if (getAllNodes.length > 0) {
            const newFormData = getAllNodes.filter((el) => el.nodeId !== nodeId);
            sessionStorage.setItem('allNodes', JSON.stringify(newFormData));
        }

        // let y_axis = 0;
        let y_axis;

        nodes.forEach((el) => {
            if (nodeId === el.id) {
                y_axis = parseInt(el.position.x, 10);
                // y_axis = `${parseInt(el.position.y, 10)}`;
                el.data.label = formField.alias;
            }
        });

        const sendFormData = {
            y_axis,
            nodeId,
            nodeName,
            formField,
            disabled: true,
            step_name: nodeName,
        };

        console.log(sendFormData)
        changeNodeName(nodes);

        setDisableForm(true);

        sessionStorage.setItem('node', JSON.stringify(nodes));
        sessionStorage.setItem('edges', JSON.stringify(edges));

        const fetchNodesData = JSON.parse(sessionStorage.getItem('allNodes') || '[]');
        fetchNodesData.push(sendFormData);

        sessionStorage.setItem('allNodes', JSON.stringify(fetchNodesData));

        const getElements = JSON.parse(sessionStorage.getItem('saved_node') || '[]');
        getElements.push(nodeId);
        sessionStorage.setItem('saved_node', JSON.stringify(getElements));
    };

    const handleEdit = (e) => {
        e.preventDefault();
        setDisableForm(false);

        const getAllNodes = JSON.parse(sessionStorage.getItem('allNodes'));

        getAllNodes.forEach((el) => {
            if (el.nodeId === nodeId) {
                el['disabled'] = false;
            }
        });

        sessionStorage.setItem('allNodes', JSON.stringify(getAllNodes));

        const getElements = JSON.parse(sessionStorage.getItem('saved_node'));

        const newSavedElement = getElements.filter((el) => el !== nodeId);

        sessionStorage.setItem('saved_node', JSON.stringify(newSavedElement));
    };

    return (
        <div>
            <Dialog
                fullScreen
                open={open}
                // onClose={handleClose}
                TransitionComponent={Transition}
                style={{ width: '70%', marginLeft: '30%' }}
            >
                <form autoComplete="off" onSubmit={handleFormsubmit}>
                    <AppBar sx={{ position: 'relative', backgroundColor: '#00013F' }}>
                        <Toolbar>
                            <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
                                <CloseIcon />
                            </IconButton>
                            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                                {nodeName}
                            </Typography>
                            <ButtonGroup variant="contained" aria-label="outlined primary button group">
                                <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={handleResetForm}
                                    disabled={disableForm}
                                    className="outlined-button-color"
                                >
                                    Clear
                                </Button>
                                <Button size="small" variant="outlined" className="outlined-button-color" onClick={handleEdit}>
                                    Edit
                                </Button>
                                <Button type="submit" size="small" variant="contained" disabled={disableForm} className="button-color">
                                    Submit
                                </Button>
                            </ButtonGroup>
                        </Toolbar>
                    </AppBar>

                    <div style={{ margin: '20px' }}>
                        <Grid container spacing={2} sx={{ m: 1 }}>
                            <Grid item xs={4}>
                                <TextField
                                    select
                                    name="segment"
                                    label="Segment"
                                    value={formField.segment}
                                    onChange={handleInputChange}
                                    size="small"
                                    disabled={disableForm}
                                    required
                                    style={{ width: '100%' }}
                                    sx={{ mt: 2 }}
                                >
                                    {AllSegments && AllSegments.map((option, idx) => (
                                        <MenuItem key={idx} value={option.segment}>
                                            {option.segment}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={4}>
                                <InputField
                                    name="alias"
                                    label="Alias"
                                    value={formField.alias}
                                    onChange={handleInputChange}
                                    size="small"
                                    disabled={disableForm}
                                    required
                                    style={{ width: '100%' }}
                                />
                            </Grid>
                        </Grid>
                        <Grid container spacing={2} sx={{ m: 1 }}>
                            <Grid item xs={4}>
                                {formField.format !== 'streaming' && (
                                    <TextField
                                        name="path"
                                        label="File Path"
                                        value={formField.path}
                                        onChange={handleInputChange}
                                        size="small"
                                        disabled={disableForm}
                                        required
                                        style={{ width: '100%' }}
                                        InputProps={{
                                            readOnly: formField.otherBlocksConnected,
                                            // readOnly: true,
                                        }}
                                        sx={{ mt: 2 }}
                                    />
                                )}
                            </Grid>
                        </Grid>
                    </div>
                </form>
            </Dialog>
        </div>
    );
};

export default NodeModal_C360;
