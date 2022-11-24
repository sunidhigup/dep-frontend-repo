import React from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-min-noconflict/ext-language_tools';
import 'ace-builds/src-min-noconflict/mode-mysql';
import 'ace-builds/src-noconflict/theme-solarized_light';
import { uniqueId } from 'lodash';

const Editor = ({ setQuery, value, setValue }) => {
  const onChange = (newValue) => {
    console.log(newValue);
    setValue(newValue);
  };

  return (
    <>
      <AceEditor
        // id="editor"
        aria-label="editor"
        mode="mysql"
        theme="solarized_light"
        name={uniqueId()}
        fontSize={16}
        minLines={15}
        maxLines={10}
        width="100%"
        showPrintMargin={false}
        showGutter
        placeholder="Write your Query here..."
        debounceChangePeriod={1000}
        editorProps={{ $blockScrolling: true }}
        setOptions={{
          enableBasicAutocompletion: false,
          enableLiveAutocompletion: false,
          enableSnippets: true,
          //   tabSize: 2,
          showLineNumbers: true,
          useWorker: false,
          displayIndentGuides: false,
        }}
        value={value}
        onChange={onChange}
      />
    </>
  );
};

export default Editor;
