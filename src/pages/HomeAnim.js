import React, { useContext, useEffect } from 'react';
import { makeStyles } from '@mui/styles';
import { Box } from '@mui/system';
import axios from 'axios';
import home from '../images/home.png';
import { AccessTokenContext } from '../context/AccessTokenProvider';
import { DomainContext } from '../context/DomainProvider';
import { AuthContext } from "../context/AuthProvider";
import { CountContext } from '../context/CountProvider';
import { DATAMESH_BASEURL } from '../data-mesh/constants/Constant';
import { changeRegion } from "../api's/MultiRegionApi";
import { SALES_EMAIL, SALES_PASSWORD, SALES_DOMAIN_TYPE, CUSTOMER_EMAIL, CUSTOMER_PASSWORD, CUSTOMER_DOMAIN_TYPE } from "../constants/Constant";


const useStyles = makeStyles({
  illustration: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    // marginTop: '50px',
    height: '90%',
    animation: `$move infinite alternate ease-in-out 2s`,
  },
  img: {
    color: 'red !important',
    backgroundColor: 'green !important',
  },
  '@keyframes move': {
    '0%': {
      transform: 'translateY(-20px)',
    },
    '100%': {
      transform: 'translateY(20px)',
    },
  },
});
const HomeAnim = () => {

  const { Acc_token, setAcc_token, DomainUserName, setDomainUserName } = useContext(AccessTokenContext)
  const { DomainType, setDomainType } = useContext(DomainContext)
  const { loggedIn, user, userDomainType } = useContext(AuthContext);
  const { CountData, setCountData } = useContext(CountContext)


  const getAccessToken = async () => {

    if (userDomainType === "DOMAIN_sales") {
      await axios.post(`${DATAMESH_BASEURL}/salesuser/get/token`, {
        email: SALES_EMAIL,
        password: SALES_PASSWORD
      }).then(response => {
        const tok = response.data["access_token"]
        setAcc_token(tok)
        setDomainType(SALES_DOMAIN_TYPE)
        setDomainUserName(SALES_EMAIL)
      }).catch(error => {
        console.log(error)
      })

    } else if (userDomainType === "DOMAIN_customers") {
      await axios.post(`${DATAMESH_BASEURL}/customeruser/get/token`, {
        email: CUSTOMER_EMAIL,
        password: CUSTOMER_PASSWORD
      }).then(response => {
        const tok = response.data["access_token"]
        setAcc_token(tok)
        setDomainType(CUSTOMER_DOMAIN_TYPE)
        setDomainUserName(CUSTOMER_EMAIL)
      }).catch(error => {
        console.log(error)
      })
    }
  }


  const setRegion = async () => {

    const response = await changeRegion('us-east-1')

    setCountData({ ...CountData, changeRegion: !(CountData.changeRegion) })
  }

  useEffect(() => {
    getAccessToken();
    setRegion()
  }, [])


  const classes = useStyles();

  return (
    <Box style={{ backgroundColor: '#fff', height: '110%' }}>
      <Box className={classes.illustration}>
        <div style={{ textAlign: 'center' }}>
          <img className={classes.img} alt="animation" src={home} width="400" />
          <h3>Explore our DEP platform.</h3>
        </div>
      </Box>
    </Box>
  );
};

export default HomeAnim;
