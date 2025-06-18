import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/Addarticle.css";

const Uploadimages = () => {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage("");
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file first.");
      return;
    }

    const status = "disable";
    const type = "image";
    const mobile = "9487812715";
    const password = "mp786";

    const url = "https://tnreaders.in/web/upload-assets-mpeoples";

    const formData = new FormData();
    formData.append("status", status);
    formData.append("type", type);
    formData.append("phonenumber", mobile);
    formData.append("password", password);
    formData.append("asset", file);

    setUploading(true);
    setMessage("");

    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData
      });

      const responseData = await response.json();
      setUploading(false);

      if (response.ok) {
        alert("✅ Image added successfully!");
        navigate.push("/list-images"); // Changed to route back to the image list page
        navigate.refresh(); // Optional: refresh the page to show the new image
      } else {
        console.error("Upload failed", responseData);
        setMessage("❌ Upload failed.");
      }
    } catch (e) {
      console.error("An error occurred:", e);
      setUploading(false);
      setMessage(`❌ An error occurred: ${e.message}`);
    }
  };
  return (
    <div className="container mt-5 mb-5 p-2 mt-md-5 mb-md-5 p-md-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Upload Thumbnail</h2>
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/list-images")}
        >
          Back to Gallery
        </button>
      </div>

      <input
        type="file"
        accept="image/*"
        className="form-control mb-3"
        onChange={handleFileChange}
      />
      <button
        className="btn btn-primary"
        onClick={handleUpload}
        disabled={uploading}
      >
        {uploading ? "Uploading..." : "Upload Image"}
      </button>

      {message && <div className="alert mt-3">{message}</div>}
    </div>
  );
};

export default Uploadimages;
