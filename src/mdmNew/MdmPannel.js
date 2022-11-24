import React from 'react';
import { Paper } from '@mui/material';
import { Avatar, Card, Col, Row } from 'antd';
import { Link } from 'react-router-dom';
import { EditOutlined, EllipsisOutlined, SettingOutlined } from '@ant-design/icons';
import dataModelIcon from '../images/dataModel.png';
import dataLoadercon from '../images/dataLoader.png';

const { Meta } = Card;

const MdmPannel = () => {
  return (
    <>
      <div className="site-card-wrapper">
        <Row justify="space-evenly">
          <Col span={4}>
            <Link to="/mdm/entity">
              <Card
                style={{ width: 300, border: '2px solid blue' }}
                cover={
                  <img
                    alt="data-model"
                    src={dataModelIcon}
                    height={200}
                    style={{ marginTop: 20, marginLeft: 50, width: 200 }}
                  />
                }
                // actions={[<EditOutlined key="edit" />]}
              >
                <Meta
                  avatar={
                    <Avatar style={{ backgroundColor: '#87d068', verticalAlign: 'middle' }} size="large">
                      DM
                    </Avatar>
                  }
                  title="DATA MODEL"
                  description="view you data tenant model"
                />
              </Card>
            </Link>
          </Col>
          <Col span={8}>
            <Link to="/mdm/entity/flow">
              <Card
                style={{ width: 300, border: '2px solid black' }}
                cover={
                  <img alt="data-loader" src={dataLoadercon} height={200} style={{ marginLeft: 50, width: 200 }} />
                }
              >
                <Meta
                  avatar={
                    <Avatar style={{ backgroundColor: '#1890ff', verticalAlign: 'middle' }} size="large">
                      DL
                    </Avatar>
                  }
                  title="DATA LOADER"
                  description="Load Data and Validation into DEP MDM platform"
                />
              </Card>
            </Link>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default MdmPannel;
