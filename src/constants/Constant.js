const ADMIN_ALWAYS = 'dep@gmail.com';
const BUCKET_NAME = process.env.REACT_APP_ENVIRONMENT === 'develop' ? 'dep-develop' : 'dep-qa';
const PROCESSED_BUCKET = process.env.REACT_APP_ENVIRONMENT === 'develop' ? 'cdep-landing-zone' : 'qa-landingzone';

const SALES_EMAIL = 'testing@gmail.com';
const SALES_PASSWORD = 'testing123';
const SALES_DOMAIN_TYPE = 'sales';

const CUSTOMER_EMAIL = 'test22@gmail.com';
const CUSTOMER_PASSWORD = 'test@12322';
const CUSTOMER_DOMAIN_TYPE = 'customers';

export {
  ADMIN_ALWAYS,
  BUCKET_NAME,
  SALES_EMAIL,
  SALES_PASSWORD,
  SALES_DOMAIN_TYPE,
  CUSTOMER_DOMAIN_TYPE,
  CUSTOMER_EMAIL,
  CUSTOMER_PASSWORD,
  PROCESSED_BUCKET,
};
