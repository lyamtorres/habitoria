import React from "react";

const Container: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
    return <div style={{ 
        backgroundColor: "#FFFFFF", 
        height: "600px", 
        width: "300px", 
        border: "16px solid #EDECEE"
    }}>{children}</div>;
};

export default Container;