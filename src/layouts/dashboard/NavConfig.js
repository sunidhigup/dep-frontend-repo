// component
import Iconify from '../../components/Iconify';

// ----------------------------------------------------------------------

const getIcon = (name) => <Iconify icon={name} width={22} height={22} />;

const navConfig = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: getIcon('eva:pie-chart-2-fill'),
  },
  {
    title: 'Flow Builder',
    path: '/flow-builder',
    icon: getIcon('carbon:flow-connection'),
  },

  {
    title: 'Rule Engine',
    path: '/rule-engine',
    icon: getIcon('carbon:rule'),
  },
  {
    title: 'Data Mesh Sales',
    path: '/data-mesh-sales',
    icon: getIcon('eva:file-text-fill'),
  },
  {
    title: 'Data Mesh Customers',
    path: '/data-mesh-customers',
    icon: getIcon('eva:file-text-fill'),
  },

  {
    title: 'Real Time',
    path: '/real-time-streaming',
    icon: getIcon('academicons:open-data'),
  },
  {
    title: 'Preprocessor',
    path: '/preprocessor',
    icon: getIcon('icon-park-outline:loading-two'),
  },

  {
    title: 'Management',
    path: '/admin/management',
    icon: getIcon('eva:people-fill'),
  },
  {
    title: 'Approval',
    path: '/admin/approval',
    icon: getIcon('eva:lock-fill'),
  },

  {
    title: 'Admin Pannel',
    path: '/admin/admin-pannel',
    icon: getIcon('eva:person-add-fill'),
  },
  {
    title: 'MDM',
    path: '/mdm',
    icon: getIcon('gg:media-live'),
  },
];

export default navConfig;
