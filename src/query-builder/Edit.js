import React from 'react';
import CodeEditor from '@uiw/react-textarea-code-editor';
import Editor, { useMonaco } from '@monaco-editor/react';

const Edit = ({ setQuery, value, setValue }) => {
  const monaco = useMonaco();
  function handleEditorChange(value, event) {
    // console.log('here is the current model value:', value);
    setValue(value);
  }
  return (
    <>
      <div>
        {/* <CodeEditor
          value={value}
          language="sql"
          placeholder="Write your Query here..."
          onChange={(evn) => setValue(evn.target.value)}
          padding={15}
          style={{
            fontSize: 16,
            height: 200,
            backgroundColor: '#ffe8d6',
            fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
          }}
        /> */}
        <Editor
          height="50vh"
          defaultLanguage="sql"
          defaultValue={value}
          theme="vs-dark"
          style={{
            padding: '50px !important',
            height: '200px',
          }}
          onChange={handleEditorChange}
        />
      </div>
    </>
  );
};

export default Edit;
