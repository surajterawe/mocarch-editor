import { Close } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import React from "react";

const Tab = ({
  fileName,
  isActive,
  file,
 
  onClick,
  removeItemFromTabArray,
  index,
}) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "10px",
        cursor: "pointer",
        borderRight: "1px solid #00000020",
        padding: "10px 10px 10px 10px",
      }}
      className={`tab ${isActive ? "active" : ""}`}
      onClick={() => {
        onClick(file);
      }}
    >
      {fileName}
      <IconButton
        onClick={(event) => {
          event.stopPropagation();
          removeItemFromTabArray(index);
        }}
      >
        <Close />
      </IconButton>
    </div>
  );
};

export default Tab;
