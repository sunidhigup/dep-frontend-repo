import { Navigate, useRoutes } from 'react-router-dom';
// layouts
import DashboardLayout from './layouts/dashboard';
import LogoOnlyLayout from './layouts/LogoOnlyLayout';
//
import Login from './pages/Login';
import NotFound from './pages/Page404';
import Register from './pages/Register';
import HomeAnim from './pages/HomeAnim';

import TableRulePage from './pages/table-rule/TableRulePage';
import RuleEngineLogStream from './pages/rule-engine/RuleEngineLogStream';
import RuleEngineLogEvents from './pages/rule-engine/RuleEngineLogEvents';
import RuleEngineSection from './pages/rule-engine/RuleEngineSection';
import RuleTableSectionNew from './pages/table-rule/v2/RuleTableSectionNew';

import DashboardPannel from './dashboard-new-client/DashboardPannel';
import OnboardingClientForm from './dashboard-new-client/OnBoarding/OnboardingClientForm';
import OnboardingJobForm from './dashboard-new-client/OnBoarding/OnboardingJobForm';
import OnboardingBatchForm from './dashboard-new-client/OnBoarding/OnboardingBatchForm';

import LogTab from './logs/LogTab';
import EmrLogCluster from './logs/emr-logs/EmrLogCluster';
import LogEvent from './logs/step-logs/LogEvent';

import PrivateRoute from './utils/PrivateRoute';
import AdminPrivateRoute from './utils/AdminPrivateRoute';
import SalesPrivateRoute from './utils/DomainBaseRoute/SalesPrivateRoute';
import CustomerPrivateRoute from './utils/DomainBaseRoute/CustomerPrivateRoute';

import ManagementPannel from './admin/management/ManagementPannel';
import ApprovalPannel from './admin/approval/ApprovalPannel';
import AdminPannel from './admin/pannel/AdminPannel';

import FlowBuilderPannel from './flow-builder/FlowBuilderPannel';
import QueryNFlowPannel from './flow-builder/flow-builder-pannel/QueryNFlowPannel';
import NewFlowBuilderPannel from './flow-builder/flow-builder-pannel/NewFlowBuilderPannel';
import QueryBuilder from './query-builder/QueryBuilder';

import ClientTable from './dashboard-new-client/tables/ClientTable';
import BatchTable from './dashboard-new-client/tables/BatchTable';
import JobTable from './dashboard-new-client/tables/JobTable';

import Mesh from './dataMeshNew/Mesh';
import MeshUI from './data-mesh/user_UI/MeshUI';

import Preprocessing from './preprocessing/Preprocessing';
import ProcessingNew from './preprocessing/ProcessingNew';
import ProcessingStepNew from './preprocessing/stepper/ProcessingStepNew';
import PreprocessingLogStream from './preprocessing/logs/PreprocessingLogStream';
import PreprocessingLogEvents from './preprocessing/logs/PreprocessingLogEvents';
import PreprocessingLambdaLogEvents from './preprocessing/logs/PreprocessingLambdaLogEvents';
import PreprocessingContentLog from './preprocessing/logs/PreprocessingContentLog';
import PreprocessingStructureLog from './preprocessing/logs/PreprocessingStructureLog';

import RealTimeStep from './real-time/v1/RealTimeStep';
import RealtimeStepNew from './real-time/v2/stepper/RealtimeStepNew';
import RealTimePannel from './real-time/v1/RealTimePannel';
import RealTimePannelNew from './real-time/v2/RealTimePannelNew';

// import MDM from './mdm/MDM';
import MDM from './mdmNew/MDM';
import MDMEntity from './mdm/entity/MDMEntity';
import PreprocessingEdit from './preprocessing/PreprocessingEdit';
import MdmFlow from './mdm/mdm-flow-builder/MdmFlowBuilderPannel';
import MdmEntityCreation from './mdmNew/mdmEntity/MdmEntityCreation';
import MdmEntityData from './mdmNew/mdmEntity/MdmEntityData';
import MdmFlowPannel from './mdmNew/mdmFlow/MdmFlowPannel';
import ParentJob from './dashboard-new-client/OnBoarding/OnboardingJob/ParentJob';

export default function Router() {
  return useRoutes([
    {
      path: '/home',
      element: <PrivateRoute />,
      children: [
        {
          path: '',
          element: <DashboardLayout />,
          children: [{ path: '', element: <HomeAnim /> }],
        },
      ],
    },
    {
      path: '/dashboard',
      element: <PrivateRoute />,
      children: [
        {
          path: '',
          element: <DashboardLayout />,
          children: [
            { path: '', element: <DashboardPannel /> },
            { path: 'onboarding/client', element: <OnboardingClientForm /> },
            { path: 'onboarding/batch', element: <OnboardingBatchForm /> },
            { path: 'onboarding/job', element: <ParentJob /> },
            // { path: 'onboarding/job', element: <OnboardingJobForm /> },
            { path: 'charts/ClientTable', element: <ClientTable /> },
            { path: 'charts/BatchTable', element: <BatchTable /> },
            { path: 'charts/JobTable', element: <JobTable /> },
          ],
        },
      ],
    },
    {
      path: '/flow-builder',
      element: <PrivateRoute />,
      children: [
        {
          path: '',
          element: <DashboardLayout />,
          children: [
            { path: '', element: <FlowBuilderPannel /> },
            { path: 'logs/step-logs/:batch/:job_id', element: <LogTab /> },
            { path: 'logs/step-logs/log-event/:batch_name/:log_stream_name/:timestamp/:status', element: <LogEvent /> },
            { path: 'flow/:batch/:job', element: <QueryNFlowPannel /> },
            { path: 'logs/emr-logs/:batch/:job/:cluster', element: <EmrLogCluster /> },
          ],
        },
      ],
    },
    {
      path: '/rule-engine',
      element: <PrivateRoute />,
      children: [
        {
          path: '',
          element: <DashboardLayout />,
          children: [
            { path: '', element: <RuleEngineSection /> },
            // { path: '', element: <RuleTableSectionNew /> },
            { path: 'table-rule/:tablename/:id', element: <TableRulePage /> },
            { path: 'logs/:tablename', element: <RuleEngineLogStream /> },
            { path: 'logs/:tablename/:logstream', element: <RuleEngineLogEvents /> },
          ],
        },
      ],
    },

    {
      path: '/admin/admin-pannel',
      element: <AdminPrivateRoute />,
      children: [
        {
          path: '',
          element: <DashboardLayout />,
          // children: [{ path: '', element: <PannelPage /> }],
          children: [{ path: '', element: <AdminPannel /> }],
        },
      ],
    },
    {
      path: '/real-time-streaming',
      element: <PrivateRoute />,
      children: [
        {
          path: '',
          element: <DashboardLayout />,
          children: [
            // { path: '', element: <RealTimePannel /> },
            { path: '', element: <RealTimePannelNew /> },
            { path: 'steps', element: <RealtimeStepNew /> },
            // { path: 'steps', element: <RealTimeStep /> },
          ],
        },
      ],
    },
    {
      path: '/admin/Management',
      element: <AdminPrivateRoute />,
      children: [
        {
          path: '',
          element: <DashboardLayout />,
          children: [{ path: '', element: <ManagementPannel /> }],
        },
      ],
    },
    {
      path: '/query-builder',
      element: <PrivateRoute />,
      children: [
        {
          path: '',
          element: <DashboardLayout />,
          children: [{ path: '', element: <QueryBuilder /> }],
        },
      ],
    },
    {
      path: '/data-mesh-sales',
      element: <SalesPrivateRoute />,
      children: [
        {
          path: '',
          element: <DashboardLayout />,
          children: [{ path: '', element: <Mesh /> }],
        },
      ],
    },
    {
      path: '/data-mesh-customers',
      element: <CustomerPrivateRoute />,
      children: [
        {
          path: '',
          element: <DashboardLayout />,
          children: [{ path: '', element: <Mesh /> }],
        },
      ],
    },
    {
      path: '/admin/approval',
      element: <AdminPrivateRoute />,
      children: [
        {
          path: '',
          element: <DashboardLayout />,
          children: [{ path: '', element: <ApprovalPannel /> }],
        },
      ],
    },
    {
      path: '/',
      element: <LogoOnlyLayout />,
      children: [
        { path: '', element: <Navigate to="/home" /> },
        { path: 'login', element: <Login /> },
        { path: 'register', element: <Register /> },
        { path: '404', element: <NotFound /> },
        { path: '*', element: <Navigate to="/404" /> },
      ],
    },
    {
      path: '/preprocessor',
      element: <PrivateRoute />,
      children: [
        {
          path: '',
          element: <DashboardLayout />,
          children: [
            // { path: '', element: <Preprocessing/> },
            { path: '', element: <ProcessingNew /> },
            // { path: 'steps', element: <PreprocessingStep /> },
            { path: 'steps/:tablename', element: <ProcessingStepNew /> },
            { path: 'logs/:tablename', element: <PreprocessingLogStream /> },
            { path: 'logs/:tablename/:logstream', element: <PreprocessingLogEvents /> },
            { path: 'LambdaLogs/:tablename/:logstream', element: <PreprocessingLambdaLogEvents /> },
            { path: 'ContentLogs/:tablename/:logstream', element: <PreprocessingContentLog /> },
            { path: 'StructureLogs/:tablename/:logstream', element: <PreprocessingStructureLog /> },
            { path: 'Edit', element: <PreprocessingEdit /> },
          ],
        },
      ],
    },
    {
      path: '/mdm',
      element: <PrivateRoute />,
      children: [
        {
          path: '',
          element: <DashboardLayout />,
          children: [
            { path: '', element: <MDM /> },
            { path: 'entity', element: <MdmEntityCreation /> },
            { path: 'entity/data/:entityName/:entityId', element: <MdmEntityData /> },
            { path: 'entity/flow', element: <MdmFlowPannel /> },
            { path: 'entity/:entityId', element: <MDMEntity /> },
            { path: 'entity/:entityId/flow', element: <MdmFlow /> },
          ],
        },
      ],
    },
    { path: '*', element: <Navigate to="/404" replace /> },
  ]);
}
