import React, { useEffect, useState } from 'react';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import { useSnackbar } from 'notistack';
import { Link, useNavigate, useParams } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Box } from '@mui/system';
import { makeStyles } from '@mui/styles';
import { getFlowBuilderEmrLogClustersApi } from "../../api's/LogsApi";

const useStyles = makeStyles({
  rightComponent: {
    flex: 4,
    overflowY: 'scroll',
    backgroundColor: '#e9ecef !important',
    maxHeight: '88vh',
    minHeight: '88vh',
    marginTop: '10px',
    marginRight: '10px',
    marginLeft: '10px',
    borderRadius: '10px',
    '&::-webkit-scrollbar': {
      width: '0.4em',
    },
    '&::-webkit-scrollbar-track': {
      '-webkit-box-shadow': 'inset 0 0 6px rgba(0,0,0,0.00)',
      borderRadius: '10px',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: '#c1d3fe',
      borderRadius: '10px',
    },
    // ['@media (max-width:780px)']: {
    //   margin: '15px',
    // },
  },
});

const EmrLogCluster = () => {
  const { enqueueSnackbar } = useSnackbar();
  const classes = useStyles();
  const params = useParams();
  const navigate = useNavigate();
  const [subfolders, setsubfolders] = useState({});
  const [folders, setfolders] = useState([]);
  const cluster = params.cluster;

  const [breadcrumb, setbreadcrumb] = useState([{ label: 'EMR_LOGS_cluster/', value: `emr/logs/${cluster}/` }]);

  const [files, setfiles] = useState([]);
  const [subfiles, setsubfiles] = useState({});

  const getAllEmrLogsFolders = async () => {
    try {
      let res;
      if (Object.keys(subfolders).length === 0) {
        const logPath = { path: `emr/logs/${cluster}/` };
        res = await getFlowBuilderEmrLogClustersApi(logPath);
      } else {
        const logPath = {
          path: subfolders.value,
        };
        res = await getFlowBuilderEmrLogClustersApi(logPath);
      }

      setfolders(res.data.sub_folders);

      const array = [];
      res.data.sub_files.forEach((sf, i) => {
        if (sf.label === 'stderr.gz' || sf.label === 'stdout.gz') {
          array.push(sf);
        }
      });
      setfiles(array);
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
  useEffect(() => {
    getAllEmrLogsFolders();
  }, [subfolders]);

  const setlogs = (folder) => {
    setsubfolders(folder);
    setbreadcrumb([...breadcrumb, folder]);
  };
  const backLink = (ele, idx) => {
    for (let index = idx; index < breadcrumb.length; index++) {
      breadcrumb.pop(index);
    }
    setbreadcrumb(breadcrumb);
    setsubfolders(ele);
  };

  return (
    <>
      <Box className={classes.rightComponent}>
        <Box
          sx={{
            m: 2,
            backgroundColor: '#fff',
            borderRadius: '10px',
            p: 2,
          }}
        >
          <div role="presentation">
            <Breadcrumbs separator={<NavigateNextIcon fontSize="large" />} aria-label="breadcrumb">
              <Link to={`/flow-builder`}>
                <p
                  style={{
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    color: 'black',
                    marginBottom: 5,
                  }}
                >
                  {params.batch}
                </p>
              </Link>

              <Link to={`/flow-builder/logs/step-logs/${params.batch}`}>
                <p
                  style={{
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    color: 'black',
                    marginBottom: 5,
                  }}
                >
                  {params.job}
                </p>
              </Link>

              {breadcrumb.map((ele, index) => {
                return (
                  <div key={index}>
                    <a
                      role="button"
                      tabIndex="0"
                      onClick={() => {
                        backLink(ele, index);
                        console.log(ele);
                      }}
                      onKeyDown={() => {
                        backLink(ele, index);
                      }}
                      style={{ cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      {ele.label}
                    </a>
                  </div>
                );
              })}
            </Breadcrumbs>
          </div>
          <div style={{ position: 'absolute', marginTop: '20px' }}>
            {files.length > 0 ? <h3 style={{ marginBottom: '10px' }}>Files</h3> : ''}
            {files &&
              files.map((file, i) => {
                return (
                  <a
                    key={i}
                    download
                    role="button"
                    tabIndex="0"
                    onClick={() => {
                      // console.log(`https://cdep.s3.amazonaws.com/${subfolders.value}${file.label}`);
                    }}
                    onKeyDown={() => {
                      // console.log(`https://cdep.s3.amazonaws.com/${subfolders.value}${file.label}`);
                    }}
                  >
                    <p
                      style={{
                        padding: '10px',
                        borderRadius: '5px',
                        backgroundColor: 'black',
                        marginBottom: '10px',
                        cursor: 'pointer',
                        color: 'white',
                        // textDecoration: 'none',
                      }}
                    /* eslint-disable react/jsx-no-target-blank */
                    >
                      <a href={`https://cdep.s3.amazonaws.com/${subfolders.value}${file.label}`} target="_blank">
                        {file.label}
                      </a>
                    </p>
                  </a>
                );
              })}
            <br />
            <h3 style={{ marginBottom: '10px' }}> Folders </h3>
            {folders &&
              folders.map((folder, i) => {
                return (
                  <a
                    key={i}
                    role="button"
                    tabIndex="0"
                    onClick={() => {
                      setlogs(folder);
                    }}
                    onKeyDown={() => {
                      setlogs(folder);
                    }}
                  >
                    <p
                      style={{
                        padding: '10px',
                        borderRadius: '5px',
                        backgroundColor: 'blue',
                        marginBottom: '10px',
                        cursor: 'pointer',
                        color: '#fff',
                        textDecoration: 'none',
                      }}
                    >
                      {folder.label}
                    </p>
                  </a>
                );
              })}
          </div>
        </Box>
      </Box>
    </>
  );
};

export default EmrLogCluster;
