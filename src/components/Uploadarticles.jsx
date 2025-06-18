import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../style/Addarticle.css";

const Uploadarticles = () => {
  const navigate = useNavigate();

  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedMain, setSelectedMain] = useState("");
  const [selectedSub, setSelectedSub] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [youtubeURL, setYoutubeURL] = useState("");
  const [imageone, setImageone] = useState(null);
  const [imagetwo, setImagetwo] = useState(null);
  const [contentType, setContentType] = useState("");

  // Fetch Main Categories
  useEffect(() => {
    axios
      .get("https://tnreaders.in/mobile/main-category")
      .then((res) => {
        const allowedCategories = (res.data || []).filter(
          (cat) => cat.status === "allow"
        );
        setMainCategories(allowedCategories);
      })
      .catch((err) => console.error("Main category error", err));
  }, []);

  // Fetch Sub Categories
  useEffect(() => {
    if (selectedMain) {
      axios
        .get(`https://tnreaders.in/mobile/sub-category?id=${selectedMain}`)
        .then((res) => setSubCategories(res.data || []))
        .catch((err) => console.error("Sub category error", err));
    }
  }, [selectedMain]);

  // Handle Submit
  const handleSubmit = async () => {
    const formData = {
      title: title || "",
      user_id: "84",
      message: description || "",
      category_id: selectedSub ? String(selectedSub) : "",
      youtube_url: youtubeURL || "",
      content_type: contentType || "",
      app_thumbnail: imageone || "",
      web_thumbnail: imagetwo || ""
    };

    try {
      await axios.post("https://tnreaders.in/mobile/upload-post", formData);
      alert("Post submitted successfully!");
      navigate("/list-article"); // ✅ navigate instead of reload
    } catch (err) {
      console.error("Submission error", err);
      alert("Error submitting post.");
    }
  };
  return (
    <div className="alignthem">
      <div className="add-post-container">
        <div className="d-flex justify-content-between align-items-center">
          <h2 className="form-title">Add Articles</h2>
          <button
            className="btn btn-secondary"
            onClick={() => navigate("/list-article")}
          >
            Back to List Articles
          </button>
        </div>

        <div className="form-group">
          <label className="form-label">Content Type</label>
          <div className="radio-group">
            {["article", "shorts", "videos"].map((type) => (
              <label key={type} className="radio-label">
                <input
                  type="radio"
                  name="contentType"
                  value={type}
                  className="checking"
                  checked={contentType === type}
                  onChange={() => setContentType(type)}
                />
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </label>
            ))}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Main Category</label>
            <select
              className="form-select"
              value={selectedMain}
              onChange={(e) => setSelectedMain(e.target.value)}
            >
              <option value="">Select Main Category</option>
              {mainCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Sub Category</label>
            <select
              className="form-select"
              value={selectedSub}
              onChange={(e) => setSelectedSub(e.target.value)}
            >
              <option value="">Select Sub Category</option>
              {subCategories.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Title</label>
          <input
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            type="text"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            className="form-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">YouTube URL</label>
          <input
            className="form-input"
            value={youtubeURL}
            onChange={(e) => setYoutubeURL(e.target.value)}
            type="text"
          />
        </div>

        <div className="form-group">
          <label className="form-label">App_Thumbnail</label>
          <input
            className="form-input"
            type="text"
            value={imageone}
            onChange={(e) => setImageone(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Web_Thumbnail</label>
          <input
            className="form-input"
            type="text"
            value={imagetwo}
            onChange={(e) => setImagetwo(e.target.value)}
          />
        </div>

        <button className="submit-button" onClick={handleSubmit}>
          சமர்ப்பிக்கவும்
        </button>
      </div>
    </div>
  );
};

export default Uploadarticles;
