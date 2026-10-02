import React from "react";
import ReactJson from "@microlink/react-json-view";

function JsonViewer({ data }) {

    const copyJson = async () => {
        try {
            await navigator.clipboard.writeText(
                JSON.stringify(data, null, 2)
            );
            alert("JSON copied to clipboard!");
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    return (
        <div
            style={{
                background: "#1e1e1e",
                borderRadius: "8px",
                padding: "20px",
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginBottom: "10px",
                }}
            >
                <button
                    onClick={copyJson}
                    style={{
                        padding: "8px 16px",
                        cursor: "pointer",
                        borderRadius: "5px",
                        border: "none",
                    }}
                >
                    📋 Copy JSON
                </button>
            </div>

            <div
                style={{
                    overflow: "auto",
                    maxHeight: "80vh",
                }}
            >
                <ReactJson
                    src={data}
                    theme="monokai"
                    collapsed={false}
                    displayDataTypes={false}
                    displayObjectSize={true}
                    enableClipboard={true}
                    name={false}
                />
            </div>
        </div>
    );
}

export default JsonViewer;