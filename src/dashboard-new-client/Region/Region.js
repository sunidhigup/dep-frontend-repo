import React, { useContext, useEffect, useState } from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { useSnackbar } from 'notistack';
import { changeRegion, getAllInfraRegions } from "../../api's/MultiRegionApi";
import { CountContext } from '../../context/CountProvider';

export default function Region() {
    const { enqueueSnackbar } = useSnackbar();
    const { CountData, setCountData } = useContext(CountContext)

    const [region, setRegion] = useState('us-east-1');
    const [allInfraRegions, setAllInfraRegions] = useState([])


    const getRegions = async () => {

        const response = await getAllInfraRegions();
        // console.log(response.data)
        if (response.status === 200) {
            setAllInfraRegions(response.data)
        }
        else {
            enqueueSnackbar('Infra Regions not  found!', {
                variant: 'error',
                autoHideDuration: 3000,
                anchorOrigin: { vertical: 'top', horizontal: 'right' },
            });
        }
    }

    useEffect(() => {

        getRegions();

    }, [])

    const handleChange = async (event) => {
        setRegion(event.target.value);

        // const response = await changeRegion(event.target.value)

        setCountData({ ...CountData, changeRegion: !(CountData.changeRegion) })


    };
    return (
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <h3>Select Region : </h3>
            <div>
                <FormControl sx={{ ml:1,mb:3,minWidth: 150 }}>
                    <InputLabel id="demo-simple-select-helper-label" />
                    <Select
                        variant='standard'
                        value={region}
                        onChange={handleChange}
                        inputProps={{ 'aria-label': 'Without label' }}
                    >
                        {
                            allInfraRegions && allInfraRegions.map((infra, index) => {
                                return (<MenuItem value={infra.infraRegionCode} key={index}>{infra.infraRegionName}</MenuItem>)
                            })
                        }
                    </Select>
                </FormControl>
            </div>
        </div>
    );
}
