import {
  Autocomplete,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import MonacoEditor from "@monaco-editor/react";
import React, { useMemo } from "react";
import TextField from "@mui/material/TextField";
import { useForm } from "react-hook-form";
// import ArrowBackIcon from "@mui/icons-material/ArrowBack";
// import { useNavigate } from "react-router-dom";
import FolderTree from "react-folder-tree";
import { useEffect, useRef, useState } from "react";
import Tabs from "./tabs";

const language = {
  html: "html",
  js: "javascript",
  css: "css",
  json: "json",
};

const initialState = {
  name: "my-app",
  checked: 0.5, // half check: some children are checked
  isOpen: true, // this folder is opened, we can see it's children
  children: [{ name: "index.html", checked: 0 }],
};

export default function CodeEditor() {
  //   const navigate = useNavigate();
  const {
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fontSize: 14,
      language: "json",
      content: "",
    },
  });
  const fontSizeField = watch("fontSize");

  const editorOptions = {
    selectOnLineNumbers: true,
    fontSize: fontSizeField,
    automaticLayout: true,
    colorDecorators: true,
    wordWrap: "on",
    minimap: { enabled: false },
  };

  const [files, setFiles] = useState(null);
  const editorRef = useRef(null);
  const [clicked, setClicked] = useState("");
  const [tabsArray, setTabsArray] = useState([]);
  const [activeFile, setActiveFile] = useState("initialFile.js"); // Change to your initial file name

  const handleTabClick = (fileName) => {
    setClicked(fileName.location);
    setActiveFile(fileName);
  };

  const removeItemFromTabArray = (index) => {
    const currentArray = [...tabsArray];
    currentArray.splice(index, 1);
    if (currentArray.length >= 1) {
      if (index > 0) {
        setClicked(currentArray[index - 1].location);
      } else {
        setClicked(currentArray[0].location);
      }
    } else {
      setClicked("");
    }
    setTabsArray([...currentArray]);
  };

  // const getFileContent = (fileName) => {
  //   // Implement this function to get file content
  //   return ""; // Placeholder for demonstration
  // };

  const onChange = (newValue) => {
    setFiles({
      ...files,
      [clicked]: {
        ...files[clicked],
        value: newValue,
      },
    });
    setValue("content", newValue);
  };

  useEffect(() => {
    editorRef.current?.focus();
  }, [clicked]);
  const [treeState, setTreeState] = useState(initialState);
  const [updatedKeyvalue, setUpdatedKeyValue] = useState("");

  const onTreeStateChange = (state, event) => {
    if (updatedKeyvalue) {
      let currentValue = { ...files };
      const FilePathArray = updatedKeyvalue.split("/");
      if (currentValue[updatedKeyvalue]) {
        const fileName = FilePathArray[FilePathArray.length - 1];
        const extention = fileName?.split(".")[1];
        const updateValue = {
          name: event.params[0],
          language: language[extention?.toLowerCase()] || "",
          value: currentValue[updatedKeyvalue]?.value || "",
        };
        const location = getPathFromIndices(treeState, event.path);
        let currentTabValue = [...tabsArray];
        const index = currentTabValue.findIndex(
          (itemsValue) => itemsValue.location === updatedKeyvalue
        );
        if (index > -1) {
          currentTabValue[index] = {
            location,
            fileName: location.split("/")[location.split("/").length - 1],
          };
          setTabsArray([...currentTabValue]);
        }

        delete currentValue[updatedKeyvalue];
        currentValue[location] = updateValue;

        setFiles({ ...currentValue });
        setClicked(location);
        setUpdatedKeyValue("");
      }
    }

    setTreeState(state);
    // setTreeState(state)
  };

  const folderIcon = ({ onClick: defaultOnClick, nodeData }) => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
        class="bi bi-folder2-open"
        viewBox="0 0 16 16"
      >
        <path d="M1 3.5A1.5 1.5 0 0 1 2.5 2h2.764c.958 0 1.76.56 2.311 1.184C7.985 3.648 8.48 4 9 4h4.5A1.5 1.5 0 0 1 15 5.5v.64c.57.265.94.876.856 1.546l-.64 5.124A2.5 2.5 0 0 1 12.733 15H3.266a2.5 2.5 0 0 1-2.481-2.19l-.64-5.124A1.5 1.5 0 0 1 1 6.14V3.5zM2 6h12v-.5a.5.5 0 0 0-.5-.5H9c-.964 0-1.71-.629-2.174-1.154C6.374 3.334 5.82 3 5.264 3H2.5a.5.5 0 0 0-.5.5V6zm-.367 1a.5.5 0 0 0-.496.562l.64 5.124A1.5 1.5 0 0 0 3.266 14h9.468a1.5 1.5 0 0 0 1.489-1.314l.64-5.124A.5.5 0 0 0 14.367 7H1.633z" />
      </svg>
    );
  };

  const onClickHandler = (nodeData) => {
    const location = getPathFromIndices(treeState, nodeData.path);
    setUpdatedKeyValue(location);
    return;
  };

  const editIcon = ({ onClick: defaultOnClick, nodeData }) => {
    return (
      <div
        onClick={() => {
          onClickHandler(nodeData);
          defaultOnClick();
        }}
      >
        <svg
          stroke="currentColor"
          fill="currentColor"
          stroke-width="0"
          viewBox="0 0 1024 1024"
          class="icon OKIcon"
          height="1em"
          width="1em"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M912 190h-69.9c-9.8 0-19.1 4.5-25.1 12.2L404.7 724.5 207 474a32 32 0 0 0-25.1-12.2H112c-6.7 0-10.4 7.7-6.3 12.9l273.9 347c12.8 16.2 37.4 16.2 50.3 0l488.4-618.9c4.1-5.1.4-12.8-6.3-12.8z"></path>
        </svg>
      </div>
    );
  };

  const getPathFromIndices = (obj, indices) => {
    let path = obj.name;

    if (indices.length >= 1) {
      const childIdx = indices[0];
      if (obj.children && obj.children[childIdx]) {
        path += `/${obj.children[childIdx].name}`;

        if (indices.length >= 2) {
          const grandChildIdx = indices[1];
          if (
            obj.children[childIdx].children &&
            obj.children[childIdx].children[grandChildIdx]
          ) {
            path += `/${obj.children[childIdx].children[grandChildIdx].name}`;
          } else {
            console.error("Invalid path");
            return "";
          }
        }
      } else {
        console.error("Invalid path");
        return "";
      }
    }

    return path;
  };

    const [lastTapTime, setLastTapTime] = useState(0);
  const delay = 300; // Adjust as needed, this is in milliseconds

  const handleTap = () => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTapTime;

    if (tapLength < delay) {
      // Double tap detected
      console.log('Double tap!');
      // Add your double tap logic here
    }

    setLastTapTime(currentTime);
  };


  const onNameClick = ({ defaultOnClick, nodeData }) => {
    handleTap()
    defaultOnClick();
    const {
      // internal data
      path,
      isOpen,
    } = nodeData;

    if (isOpen !== true && isOpen !== false) {
      const location = getPathFromIndices(treeState, path);
      const FileName = location.split("/")[location.split("/").length - 1];
      // if(files.findIndex(item => item.name === location) === -1){
      const extention = FileName?.split(".")[1];

      if (tabsArray.findIndex((items) => items.location === location) === -1) {
        tabsArray.push({ location, fileName: FileName });
      }

      setClicked(location);
      if (files && Object.keys(files).includes(location)) {
        setFiles({
          ...files,
          [location]: {
            name: location,
            language: language[extention?.toLowerCase()] || "",
            value: files && files[location] ? files[location]?.value : "",
          },
        });
      } else if (!files) {
        setFiles({
          [location]: {
            name: location,
            language: language[extention?.toLowerCase()] || "",
            value: files && files[location] ? files[location]?.value : "",
          },
        });
      }
    }
  };

  const editorDidMount = (editor, monaco) => {
    // Access the editor instance
    // console.log("Editor instance:", editor);

    // Access the Monaco API
    // console.log("Monaco API:", monaco);

    // Add custom options to the editor
    editor.updateOptions({
      tabSize: 4,
      insertSpaces: true,
    });

    // Set up a completion item provider
    const completionProvider = monaco.languages.registerCompletionItemProvider(
      "json",
      {
        triggerCharacters: ['"', "["],
        provideCompletionItems: (model, position) => {
          const word = model.getWordUntilPosition(position);
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
          };

          let suggestions = [
            {
              label: "os_publisher: MicrosoftWindowsServer",
              kind: monaco.languages.CompletionItemKind.Constant,
              insertText: "MicrosoftWindowsServer",
              detail: "Microsoft Windows Server",
              insertTextRules:
                monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range: range,
            },
          ];

          // Check if the cursor is inside square brackets and preceded by a double quote
          const textBeforeCursor = model.getValueInRange(
            new monaco.Range(
              position.lineNumber,
              1,
              position.lineNumber,
              position.column
            )
          );
          const isDoubleQuoteInsideSquareBrackets =
            textBeforeCursor.includes('"[');

          if (isDoubleQuoteInsideSquareBrackets) {
            suggestions = suggestions.concat([
              {
                label: "Mx OS Publisher",
                kind: monaco.languages.CompletionItemKind.Variable,
                insertText: "os_publisher",
                detail: "Operating System Publisher",
                insertTextRules:
                  monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                range: range,
              },
              {
                label: "Mx OS Offer",
                kind: monaco.languages.CompletionItemKind.Variable,
                insertText: "os_offer",
                detail: "Operating System Offer",
                insertTextRules:
                  monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                range: range,
              },
              {
                label: "Mx OS SKU",
                kind: monaco.languages.CompletionItemKind.Variable,
                insertText: "os_sku",
                detail: "Operating System SKU",
                insertTextRules:
                  monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                range: range,
              },
              {
                label: "Mx OS Version",
                kind: monaco.languages.CompletionItemKind.Variable,
                insertText: "os_version",
                detail: "Operating System Version",
                insertTextRules:
                  monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                range: range,
              },
            ]);
          }

          return { suggestions: suggestions };
        },
      }
    );

    // Dispose of the completion provider when the editor is unmounted
    editor.onDidDispose(() => {
      completionProvider.dispose();
    });
  };

  const fontSizeOptions = useMemo(() => {
    return [
      { label: "12", id: 12 },
      { label: "14", id: 14 },
      { label: "16", id: 16 },
    ];
  }, []);

  const fontSizeFieldValue = useMemo(
    () => fontSizeOptions.find((option) => option.id === fontSizeField) ?? null,
    [fontSizeOptions, fontSizeField]
  );

  return (
    <Grid
      container
      m={1}
      spacing={2}
      style={{ width: "100%", height: "100%", margin: "0" }}
    >
      <Grid container direction="row">
        <Grid
          style={{ borderRight: "1px solid #00000040", padding: "30px" }}
          item
          xs={3}
          md={3}
        >
          <FolderTree
            data={initialState}
            initCheckedStatus="checked" // default: 0 [unchecked]
            initOpenStatus="custom" // default: 'open'
            onChange={onTreeStateChange}
            onNameClick={onNameClick}
            showCheckbox={false} // default: true
            iconComponents={{ OKIcon: editIcon, folderIcon: folderIcon }}
          />
        </Grid>
        <Grid item xs={9} md={9}>
          <Grid style={{ marginLeft: "30px" }} item xs={12} md={12}>
            <Grid container direction="row">
              <Grid item xs={12} md={6}>
                <Grid
                  container
                  direction="row"
                  justifyContent="flex-start"
                  alignItems="flex-start"
                  spacing={2}
                >
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <FormLabel>Font Size</FormLabel>
                      <Autocomplete
                        autoHighlight
                        getOptionLabel={(option) => option.label}
                        value={fontSizeFieldValue}
                        onChange={(_, data) => {
                          setValue("fontSize", data.id);
                        }}
                        isOptionEqualToValue={(option, data) =>
                          option.id === data.id
                        }
                        renderInput={(params) => (
                          <TextField
                            error={!!errors.fontSizeField}
                            {...params}
                            varient="outlined"
                            size="small"
                            fullWidth
                          />
                        )}
                        options={fontSizeOptions}
                        renderOption={(props, option) => (
                          <li {...props}>
                            <Stack
                              spacing={1}
                              direction="row"
                              justifyContent="flex-start"
                              alignItems="center"
                            >
                              <Typography fontSize={13} fontWeight={400}>
                                {option.label}
                              </Typography>
                            </Stack>
                          </li>
                        )}
                      />
                      <FormHelperText error={!!errors.fontSizeField}>
                        {errors.fontSizeField?.message}
                      </FormHelperText>
                    </FormControl>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} md={6} />
            </Grid>
          </Grid>
          <Grid
            item
            style={{
              width: "100vw",
              marginTop: "40px",
              height: "calc(100vh - 180px)",
            }}
            xs={12}
            md={12}
          >
            <Tabs
              files={tabsArray} // Add your file names here
              activeFile={activeFile}
              setClicked={setClicked}
              removeItemFromTabArray={removeItemFromTabArray}
              onTabClick={handleTabClick}
            />
            {clicked && (
              <React.Suspense fallback={<div>Loading Code Editor...</div>}>
                {files && clicked && (
                  <MonacoEditor
                    width="100%"
                    height="100%"
                    language={files[clicked]?.language || "plaintext"}
                    path={files[clicked]?.name}
                    value={files[clicked]?.value}
                    options={editorOptions}
                    onMount={editorDidMount}
                    onChange={onChange}
                  />
                )}
              </React.Suspense>
            )}
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
