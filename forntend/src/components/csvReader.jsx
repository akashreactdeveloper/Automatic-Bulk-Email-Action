import React, { useState } from "react";
import "./csvReader.css"; // Import the CSS file

function FileUploader() {
    const [csvFile, setCsvFile] = useState(null);
    const [pdfFile, setPdfFile] = useState(null);

    const handleCsvFileChange = (event) => {
        setCsvFile(event.target.files[0]);
    };

    const handlePdfFileChange = (event) => {
        setPdfFile(event.target.files[0]);
    };

    const handleUploadAndSend = async () => {
        if (!csvFile || !pdfFile) {
            alert("Please upload both a CSV and a PDF file.");
            return;
        }

        const formData = new FormData();
        formData.append("csvFile", csvFile);
        formData.append("pdfFile", pdfFile);

        try {
            const response = await fetch("http://localhost:3000/send-email", {
                method: "POST",
                body: formData,
            });
            const result = await response.json();
            alert(result.message);
        } catch (error) {
            console.error("Error sending files:", error);
            alert("Failed to send emails");
        }
    };

    return (
        <div className="container">
            <h1>Upload CSV and PDF to Send Emails</h1>
            <div className="upload-section">
                <div className="upload-box">
                    <h2>Upload CSV file of users</h2>
                    <input type="file" accept=".csv" onChange={handleCsvFileChange} />
                </div>
                <div className="upload-box">
                    <h2>Upload Attachment PDF file</h2>
                    <input
                        type="file"
                        accept="application/pdf"
                        onChange={handlePdfFileChange}
                    />
                </div>
                <button className="upload-button" onClick={handleUploadAndSend}>
                    Upload Files and Send Emails
                </button>
            </div>
        </div>
    );
}

export default FileUploader;
