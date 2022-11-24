export default function convertToRequiredFormat(getJobFromLocalStorage) {
  const steps = [];

  let previous = true;

  let stepCount = 1;
  let read_object_boolean = false;
  let read_boolean = true;
  let read_object_index = 0;
  let read_object;
  const read_object_arr = [];

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
        read_object['params']['definitions'][read_object_index]['delimiter'] = ele.formField.delimiter;
        read_object['params']['definitions'][read_object_index]['path'] = ele.formField.path;
        read_object['params']['definitions'][read_object_index]['source'] = ele.formField.source;
        read_object['params']['definitions'][read_object_index]['sourceId'] = ele.formField.sourceId;
        read_object['params']['definitions'][read_object_index]['entity'] = ele.formField.entity;
        read_object['params']['definitions'][read_object_index]['mapping'] = ele.formField.mapping;

        const validation = [];

        ele.fetchedHeader.forEach((item) => {
          const obj = {};

          if (item.mapping) {
            obj[`${item.mapping}`] = item.validation;
            validation.push(obj);
          }
        });

        if (ele.formField.mapping.length > 0) {
          read_object['params']['definitions'][read_object_index]['validation'] = validation;
        }

        read_object_index++;
        read_object_arr.push(read_object);
        if (read_boolean) {
          steps.push(read_object_arr[0]);
          read_boolean = false;
        }
        stepCount++;
        previous = true;
      } else if (ele.nodeName === 'Write') {
        const write_object = new Object();
        write_object['method_name'] = 'Write';
        write_object['step_name'] = `${ele.step_name}_${stepCount}`;
        write_object['step_number'] = stepCount;
        write_object['params'] = new Object();
        write_object['params']['format'] = ele.formField.format;
        write_object['params']['overwrite'] = ele.formField.overwrite;
        write_object['params']['df'] = ele.formField.df;
        write_object['params']['alias'] = ele.formField.alias;
        write_object['params']['path'] = ele.formField.path;
        write_object['params']['partition'] = ele.formField.partition;
        write_object['params']['persist'] = ele.formField.persist;
        if (ele.formField.persist === true) {
          write_object['params']['persist_type'] = ele.formField.persist_type;
        } else {
          write_object['params']['persist_type'] = '';
        }
        stepCount++;
        steps.push(write_object);
        previous = true;
      } else if (ele.nodeName === 'Attribute Selection') {
        const attribute_object = new Object();
        attribute_object['method_name'] = 'Attribute Selection';
        attribute_object['step_name'] = `${ele.step_name}_${stepCount}`;
        attribute_object['step_number'] = stepCount;
        attribute_object['params'] = new Object();
        attribute_object['params']['df'] = ele.formField.alias;

        const attribute = [];

        if (ele.attribute.length > 0) {
          ele.attribute.forEach((el) => {
            const obj = {
              attribute: el.attribute,
              rule: el.rule ? el.rule : 'aggregation',
              source_name: el.source,
            };

            attribute.push(obj);
          });

          attribute_object['params']['attributes'] = attribute;
        }

        stepCount++;
        steps.push(attribute_object);
        previous = true;
      } else {
        const multiJoin_object = new Object();
        multiJoin_object['method_name'] = 'MultiTableJoin';
        multiJoin_object['step_name'] = `${ele.step_name}_${stepCount}`;
        multiJoin_object['step_number'] = stepCount;
        multiJoin_object['params'] = new Object();
        multiJoin_object['params']['df'] = ele.formField.alias;
        multiJoin_object['params']['fuzzy_match'] = ele.formField.fuzzy_match;
        multiJoin_object['params']['exact_match'] = ele.formField.exact_match;
        multiJoin_object['params']['threshold'] = ele.formField.threshold;
        multiJoin_object['params']['algo'] = ele.formField.algo;

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
