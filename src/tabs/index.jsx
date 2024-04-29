import React from "react";
import Tab from "../tab";

const Tabs = ({ files, activeFile, removeItemFromTabArray, onTabClick }) => {
  return (
    <div 
    style={{
        display : "flex",
        paddingLeft : "30px",
        paddingRight : "30px",
        marginBottom : "20px",
    }}
    className="tab-container">
      {files.map((file,index) => (
        <Tab
          key={file.location}
          removeItemFromTabArray={removeItemFromTabArray}
          index={index}
          file={file}
          fileName={file.fileName}
          isActive={file.fileName === activeFile}
          onClick={onTabClick}
        />
      ))}
    </div>
  );
};

export default Tabs;

