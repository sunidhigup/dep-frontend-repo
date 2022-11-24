import { BUCKET_NAME } from '../constants/Constant';

export default function convertToRequiredFormat(getJobFromLocalStorage, track_id, bucket) {
  const steps = [];

  let previous = true;

  let stepCount = 1;
  let read_object_boolean = false;
  let read_boolean = true;
  let read_object_index = 0;
  let read_object;
  const read_object_arr = [];

  let executeSQL_object_boolean = false;
  let executeSQL_boolean = true;
  let executeSQL_object_index = 0;
  let executeSQL_object;
  let execute_sql_object_arr = [];

  getJobFromLocalStorage &&
    getJobFromLocalStorage.map((ele) => {
      if (ele.nodeName === 'Read') {
        if (read_object_boolean === false) {
          read_object = new Object();
          read_object['method_name'] = 'Read';
          read_object['params'] = new Object();
          read_object['params']['definitions'] = new Array();
          read_object_boolean = true;
        }

        read_object['params']['definitions'][read_object_index] = new Object();
        read_object['params']['definitions'][read_object_index]['step_name'] = `${ele.step_name}_${stepCount}`;
        read_object['params']['definitions'][read_object_index]['step_number'] = stepCount;
        read_object['params']['definitions'][read_object_index]['df'] = ele.formField.alias;
        read_object['params']['definitions'][read_object_index]['format'] = ele.formField.format;
        if (track_id !== 'snowflake-garbageTID') {
          read_object['params']['definitions'][read_object_index]['DataProcessor_tracking_id'] = track_id;
        }
        if (ele.formField.format === 'delimeted') {
          const row_level_fields = [];

          if (ele.fetchedHeader.length > 0) {
            ele.fetchedHeader.forEach((el, i) => {
              row_level_fields.push({ fieldname: el.header });
            });
          }

          read_object['params']['definitions'][read_object_index]['row_operations'] = new Object();
          read_object['params']['definitions'][read_object_index]['row_operations']['ignoreblanklines'] =
            ele.formField.ignoreblanklines || false;
          read_object['params']['definitions'][read_object_index]['row_operations']['skipheaders'] =
            ele.formField.skipheaders || false;
          read_object['params']['definitions'][read_object_index]['row_operations']['columnshift'] =
            ele.formField.columnshift || false;
          read_object['params']['definitions'][read_object_index]['row_operations']['junkrecords'] =
            ele.formField.junkrecords || false;
          read_object['params']['definitions'][read_object_index]['row_operations']['linebreak'] =
            ele.formField.linebreak || false;
          read_object['params']['definitions'][read_object_index]['row_operations']['delimiter'] =
            ele.formField.delimiter;
          read_object['params']['definitions'][read_object_index]['row_operations']['fields'] = row_level_fields;
        }
        read_object['params']['definitions'][read_object_index]['delimiter'] = ele.formField.delimiter;
        read_object['params']['definitions'][read_object_index]['distinct_rows'] = ele.formField.distinct_rows;

        if (ele.formField.path) {
          read_object['params']['definitions'][read_object_index]['path'] = ele.formField.path;
        } else {
          read_object['params']['definitions'][read_object_index]['database'] = ele.formField.database;
          read_object['params']['definitions'][read_object_index]['tablename'] = ele.formField.tablename;
        }

        read_object['params']['definitions'][read_object_index]['persist'] = ele.formField.persist;
        if (ele.formField.persist === true) {
          read_object['params']['definitions'][read_object_index]['persist_type'] = ele.formField.persist_type;
        } else {
          read_object['params']['definitions'][read_object_index]['persist_type'] = '';
        }
        read_object['params']['definitions'][read_object_index]['action'] = ele.formField.action
          ? ele.formField.action
          : '';

        const newArray = [];

        if (ele.headerName.length > 0) {
          ele.headerName.forEach((el, i) => {
            if (el.alias) {
              newArray.push(`${el.header} as ${el.alias}`);
            } else {
              newArray.push(el.header);
            }
          });

          read_object['params']['definitions'][read_object_index]['select_cols'] = newArray.toString();
        }

        read_object['params']['definitions'][read_object_index]['action'] = ele.formField.action
          ? ele.formField.action
          : '';
        read_object_index++;
        read_object_arr.push(read_object);
        if (read_boolean) {
          steps.push(read_object_arr[0]);
          read_boolean = false;
        }
        stepCount++;
        previous = true;
      } else if (ele.nodeName === 'Udf') {
        if (previous) {
          executeSQL_object_boolean = false;
          executeSQL_boolean = true;
          execute_sql_object_arr = [];
          executeSQL_object_index = 0;
        }
        if (executeSQL_object_boolean === false) {
          executeSQL_object = new Object();
          executeSQL_object['method_name'] = 'ExecuteSQL';
          executeSQL_object['params'] = new Object();
          executeSQL_object['params']['definitions'] = new Array();
          executeSQL_object_boolean = true;
        }
        executeSQL_object['params']['definitions'][executeSQL_object_index] = new Object();
        executeSQL_object['params']['definitions'][executeSQL_object_index][
          'step_name'
        ] = `${ele.step_name}_${stepCount}`;
        executeSQL_object['params']['definitions'][executeSQL_object_index]['step_number'] = stepCount;
        executeSQL_object['params']['definitions'][executeSQL_object_index]['df'] = ele.formField.alias;
        executeSQL_object['params']['definitions'][executeSQL_object_index]['db_name'] = ele.formField.db_name;
        executeSQL_object['params']['definitions'][executeSQL_object_index]['statement'] = ele.formField.statement;
        executeSQL_object['params']['definitions'][executeSQL_object_index]['persist'] = ele.formField.persist;
        executeSQL_object['params']['definitions'][executeSQL_object_index]['udf'] = ele.udfList;
        executeSQL_object['params']['definitions'][executeSQL_object_index]['distinct_rows'] =
          ele.formField.distinct_rows;

        if (ele.formField.persist === true) {
          executeSQL_object['params']['definitions'][executeSQL_object_index]['persist_type'] =
            ele.formField.persist_type;
        } else {
          executeSQL_object['params']['definitions'][executeSQL_object_index]['persist_type'] = '';
        }
        executeSQL_object['params']['definitions'][executeSQL_object_index]['action'] = ele.formField.action
          ? ele.formField.action
          : '';
        stepCount++;
        executeSQL_object_index++;

        execute_sql_object_arr.push(executeSQL_object);
        // const new_execute_sql_object_arr = [...execute_sql_object_arr]

        if (executeSQL_boolean) {
          steps.push(execute_sql_object_arr[0]);
          executeSQL_boolean = false;
        }
        previous = false;
      } else if (ele.nodeName === 'Write') {
        const write_object = new Object();
        write_object['method_name'] = 'Write';
        write_object['step_name'] = `${ele.step_name}_${stepCount}`;
        write_object['step_number'] = stepCount;

        write_object['params'] = new Object();
        if (ele.toggleType === 'S3') {
          write_object['params']['format'] = ele.formField.format;
          write_object['params']['overwrite'] = ele.formField.overwrite;
          write_object['params']['df'] = ele.formField.df;
          write_object['params']['alias'] = ele.formField.alias;
          if (track_id !== 'snowflake-garbageTID') {
            write_object['params']['path'] = `${ele.formField.path}${track_id}/`;
          } else {
            write_object['params']['path'] = `${ele.formField.path}`;
          }
          write_object['params']['partition'] = ele.formField.partition;
          write_object['params']['persist'] = ele.formField.persist;
          write_object['params']['distinct_rows'] = ele.formField.distinct_rows;

          if (ele.formField.persist === true) {
            write_object['params']['persist_type'] = ele.formField.persist_type;
          } else {
            write_object['params']['persist_type'] = '';
          }
          write_object['params']['target'] = 's3';
        } else if (ele.toggleType === 'Open Search') {
          write_object['params']['df'] = ele.formField.df;
          write_object['params']['index'] = ele.formField.index;
          write_object['params']['primary_key'] = ele.formField.p_key;
          write_object['params']['target'] = 'opensearch';
          write_object['params']['distinct_rows'] = ele.formField.distinct_rows;
        } else if (ele.toggleType === 'Database') {
          write_object['params']['df'] = ele.formField.df;
          write_object['params']['db_type'] = ele.formField.db_type;
          write_object['params']['service'] = ele.formField.database;
          write_object['params']['database'] = ele.formField.schema;
          write_object['params']['tablename'] = ele.formField.tablename;
          write_object['params']['mode'] = ele.formField.mode;
          write_object['params']['target'] = 'database';
          write_object['params']['distinct_rows'] = ele.formField.distinct_rows;
        }
        stepCount++;
        steps.push(write_object);
        previous = true;
      } else if (
        ele.nodeName === 'Execute SQL' ||
        ele.nodeName === 'Sort' ||
        ele.nodeName === 'Filter' ||
        ele.nodeName === 'Aggregation'
      ) {
        if (previous) {
          executeSQL_object_boolean = false;
          executeSQL_boolean = true;
          execute_sql_object_arr = [];
          executeSQL_object_index = 0;
        }
        if (executeSQL_object_boolean === false) {
          executeSQL_object = new Object();
          executeSQL_object['method_name'] = 'ExecuteSQL';
          executeSQL_object['params'] = new Object();
          executeSQL_object['params']['definitions'] = new Array();
          executeSQL_object_boolean = true;
        }
        executeSQL_object['params']['definitions'][executeSQL_object_index] = new Object();
        executeSQL_object['params']['definitions'][executeSQL_object_index][
          'step_name'
        ] = `${ele.step_name}_${stepCount}`;
        executeSQL_object['params']['definitions'][executeSQL_object_index]['step_number'] = stepCount;
        executeSQL_object['params']['definitions'][executeSQL_object_index]['df'] = ele.formField.alias;
        executeSQL_object['params']['definitions'][executeSQL_object_index]['db_name'] = ele.formField.db_name;
        executeSQL_object['params']['definitions'][executeSQL_object_index]['statement'] = ele.formField.statement;
        executeSQL_object['params']['definitions'][executeSQL_object_index]['persist'] = ele.formField.persist;
        executeSQL_object['params']['definitions'][executeSQL_object_index]['distinct_rows'] =
          ele.formField.distinct_rows;
        if (ele.formField.persist === true) {
          executeSQL_object['params']['definitions'][executeSQL_object_index]['persist_type'] =
            ele.formField.persist_type;
        } else {
          executeSQL_object['params']['definitions'][executeSQL_object_index]['persist_type'] = '';
        }
        executeSQL_object['params']['definitions'][executeSQL_object_index]['action'] = ele.formField.action
          ? ele.formField.action
          : '';
        stepCount++;
        executeSQL_object_index++;

        execute_sql_object_arr.push(executeSQL_object);
        // const new_execute_sql_object_arr = [...execute_sql_object_arr]

        if (executeSQL_boolean) {
          steps.push(execute_sql_object_arr[0]);
          executeSQL_boolean = false;
        }
        previous = false;
      } else if (ele.nodeName === 'Data Cleansing') {
        const Data_Cleansing_object = new Object();
        Data_Cleansing_object['method_name'] = 'RuleEngine';
        Data_Cleansing_object['params'] = new Object();
        Data_Cleansing_object['params']['flow_name'] = 'Data Cleansing';
        Data_Cleansing_object['params']['step_name'] = ele.step_name;
        Data_Cleansing_object['params']['step_number'] = stepCount;
        Data_Cleansing_object['params']['log_group'] = 'cdep_rule_engine_logs';
        Data_Cleansing_object['params']['execution_id'] = `${ele.client_name}_${ele.batch_name}_${
          ele.table_name
        }_${new Date().getTime()}`;
        Data_Cleansing_object['params']['batch_name'] = ele.batch_name;
        Data_Cleansing_object['params']['client_name'] = ele.client_name;
        Data_Cleansing_object['params']['table_name'] = ele.table_name;
        Data_Cleansing_object['params']['bucket_name'] = BUCKET_NAME;
        Data_Cleansing_object['params']['jar_folder_path'] = `s3://${bucket}/rule_engine/jars/*`;
        Data_Cleansing_object['params']['job_status_table'] = 'dep_rule_engine_job_status';
        Data_Cleansing_object['params']['db_audit_table'] = 'dep_rule_engine_audit_table';
        Data_Cleansing_object['params']['region_name'] = 'us-east-1';
        Data_Cleansing_object['params']['extensions'] = '[.txt,.csv,.json]';
        Data_Cleansing_object['params']['profile_env'] = 'dev';
        Data_Cleansing_object['params']['profile_env_bucket'] = BUCKET_NAME;
        Data_Cleansing_object['params']['db_status_table'] = 'dep_rule_engine_job_status';
        Data_Cleansing_object['params']['df'] = ele.table_name;
        Data_Cleansing_object['params']['db_name'] = 'default';
        Data_Cleansing_object['params']['alias'] = ele.formField.alias;
        Data_Cleansing_object['params']['distinct_rows'] = ele.formField.distinct_rows;
        Data_Cleansing_object['params']['ruleFile'] = new Object();

        const allFields = [];
        ele.initial_rules.forEach((el) => {
          const field_rules = [];
          el.rulename.forEach((e_rule) => {
            ele.customRules.forEach((e_cust) => {
              if (e_rule === e_cust.rulename) {
                const argsObject = new Object();
                const argkey = e_cust.argkey.split(',');
                const argvalue = e_cust.argvalue.split(',');
                const obj1 = {};
                argkey.map((element, argkey_idx) => {
                  obj1[element] = argvalue[argkey_idx];
                });
                // argsObject[`${e_cust.argkey}`] = e_cust.argvalue;
                const obj = new Object();
                obj['rulename'] = e_rule;
                obj['args'] = [obj1];
                field_rules.push(obj);
              }
            });
          });

          const data = {
            fieldname: el.header,
            size: 10,
            scale: 50,
            type: el.type,
            rulename: [],
            fieldrules: field_rules,
          };
          allFields.push(data);
        });
        Data_Cleansing_object['params']['ruleFile']['fields'] = allFields;

        Data_Cleansing_object['params']['ruleFile']['swap'] = ele.swap_Cols;
        Data_Cleansing_object['params']['ruleFile']['delete'] = ele.delete_cols;

        stepCount++;
        steps.push(Data_Cleansing_object);
        previous = true;
      } else if (ele.nodeName === 'C360') {
        // console.log()
      } else {
        const multiJoin_object = new Object();
        multiJoin_object['method_name'] = 'MultiTableJoin';
        multiJoin_object['step_name'] = `${ele.step_name}_${stepCount}`;
        multiJoin_object['step_number'] = stepCount;
        multiJoin_object['params'] = new Object();
        multiJoin_object['params']['df'] = ele.formField.alias;
        multiJoin_object['params']['join_condition'] = ele.formField.join_conditions;
        multiJoin_object['params']['select_cols'] = ele.formField.select_cols;
        multiJoin_object['params']['join_filter'] = ele.formField.join_filter ? ele.formField.join_filter : '';
        multiJoin_object['params']['persist'] = ele.formField.persist;
        multiJoin_object['params']['distinct_rows'] = ele.formField.distinct_rows;
        if (ele.formField.persist === true) {
          multiJoin_object['params']['persist_type'] = ele.formField.persist_type;
        } else {
          multiJoin_object['params']['persist_type'] = '';
        }
        multiJoin_object['params']['tables'] = new Object();

        for (let i = 1; i <= Object.keys(ele.formField.tables).length; i++) {
          multiJoin_object['params']['tables'][`table${i}`] = ele.formField.tables[`table${i}`];
        }

        multiJoin_object['params']['joins'] = new Object();

        for (let j = 1; j <= Object.keys(ele.formField.joins).length; j++) {
          multiJoin_object['params']['joins'][`join${j}`] = ele.formField.joins[`join${j}`];
        }

        multiJoin_object['params']['action'] = ele.formField.action ? ele.formField.action : '';

        stepCount++;
        steps.push(multiJoin_object);
        previous = true;
      }
    });

  // steps.push(read_object_arr[0]);
  // steps.push(execute_sql_object_arr[0]);

  const main = {
    name: '',
    transformer_execution_details: {},
    spark_config: {},
    udf: {},
    steps,
  };

  return main;
}
