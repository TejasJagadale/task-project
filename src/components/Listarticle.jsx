import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../style/Addarticle.css";

const Listarticle = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [editingPost, setEditingPost] = useState(null);
  const [viewingPost, setViewingPost] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const postsPerPage = 20;

  const [selectedMain, setSelectedMain] = useState("");
  const [selectedSub, setSelectedSub] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [youtubeURL, setYoutubeURL] = useState("");
  const [imageone, setImageone] = useState(null);
  const [imagetwo, setImagetwo] = useState(null);
  const [isSubCategoriesLoaded, setIsSubCategoriesLoaded] = useState(false);
  const [contentType, setContentType] = useState("");
  const [isEditLoading, setIsEditLoading] = useState(false);

  // Fetch posts with pagination
  useEffect(() => {
    fetchPosts();
  }, [currentPage]);

  const fetchPosts = () => {
    setIsLoading(true);
    axios
      .get(
        `https://tnreaders.in/mobile/list-posts?perPage=${postsPerPage}&currentPage=${currentPage}`
      )
      .then((response) => {
        setPosts(response.data.data || []);
        setTotalPosts(response.data.total || 0);
        setTotalPages(response.data.last_page || 1);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("API fetch error:", error);
        setIsLoading(false);
      });
  };

  console.log("posts", posts);

  // Fetch Main Categories on load
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

  // Fetch Sub Categories when main category changes
  useEffect(() => {
    if (selectedMain) {
      setIsSubCategoriesLoaded(false);
      axios
        .get(`https://tnreaders.in/mobile/sub-category?id=${selectedMain}`)
        .then((res) => {
          const subs = res.data || [];
          setSubCategories(subs);
          setIsSubCategoriesLoaded(true);
          setIsEditLoading(false); // Stop loading when subcategories are loaded
        })
        .catch((err) => {
          console.error("Sub category error", err);
          setIsEditLoading(false); // Also stop loading on error
        });
    }
  }, [selectedMain]);

  // Set the subcategory after subcategories are loaded and we're editing a post
  useEffect(() => {
    if (isSubCategoriesLoaded && editingPost && editingPost.category_id) {
      setSelectedSub(editingPost.category_id.toString() || "");
    }
  }, [isSubCategoriesLoaded, editingPost]);

  const handleEdit = async (post) => {
    setIsEditLoading(true);

    try {
      // Parallelize all data fetching
      const [mainCatRes, subCatRes] = await Promise.all([
        axios.get("https://tnreaders.in/mobile/main-category"),
        axios.get(
          `https://tnreaders.in/mobile/sub-category?id=${post.category.parent_id}`
        )
      ]);

      // Batch all state updates together
      setIsEditLoading(true);
      setEditingPost(post);
      setTitle(post.title || "");
      setDescription(post.description || "");
      setYoutubeURL(post.youtube_url || "");
      setContentType(post.content_type || "");
      setImageone(post.app_thumbnail || "");
      setImagetwo(post.web_thumbnail || "");

      const allowedCategories = (mainCatRes.data || []).filter(
        (cat) => cat.status === "allow"
      );
      setMainCategories(allowedCategories);
      setSubCategories(subCatRes.data || []);

      setSelectedMain(post.category.parent_id.toString());
      setSelectedSub(post.category_id.toString());
    } catch (err) {
      console.error("Edit load error:", err);
      alert("Failed to load edit data");
    } finally {
      setIsEditLoading(false);
    }
  };

  const handleView = (post) => {
    setViewingPost(post);
    setEditingPost(null);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    // Validate post_id is present when editing
    if (editingPost && !editingPost.id) {
      alert("Error: Post ID is missing for editing");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("user_id", "84");
    formData.append("category_id", selectedSub ? String(selectedSub) : "");
    formData.append("title", title || "");
    formData.append("message", description || "");
    formData.append("youtube_url", youtubeURL || "");
    formData.append("content_type", contentType || "");
    formData.append("app_thumbnail", imageone || "");
    formData.append("web_thumbnail", imagetwo || "");

    // Add post_id only when editing
    if (editingPost) {
      formData.append("post_id", editingPost.id.toString());
    }

    try {
      const endpoint = "https://tnreaders.in/mobile/upload-post";
      const response = await axios.post(endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      if (response.data.success) {
        alert(editingPost ? "Post updated!" : "Post submitted!");
        setEditingPost(null);
        fetchPosts();
      } else {
        alert(response.data.message || "Operation failed");
      }
    } catch (err) {
      console.error("Submission error", err);
      alert(err.response?.data?.message || "Error during submission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePostStatus = async (postId, currentStatus) => {
    const newStatus = currentStatus === "yes" ? "no" : "yes";
    setIsProcessing(true);

    try {
      await axios.post("https://tnreaders.in/mobile/update-status", {
        postId,
        isActive: newStatus
      });

      alert(
        `Post status updated to ${newStatus === "yes" ? "Active" : "Disabled"}`
      );
      setPosts(
        posts.map((post) =>
          post.id === postId ? { ...post, isActive: newStatus } : post
        )
      );
      if (viewingPost?.id === postId) {
        setViewingPost({
          ...viewingPost,
          isActive: newStatus
        });
      }
    } catch (err) {
      console.error("Status update error", err);
      alert("Error updating post status");
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleTrendingStatus = async (postId, currentTrendingStatus) => {
    const newTrendingStatus = currentTrendingStatus === 1 ? 0 : 1;
    const payloadStatus = currentTrendingStatus === 1 ? "no" : "yes"; // Convert to "yes"/"no" for payload
    setIsProcessing(true);

    try {
      // Log what we're sending
      console.log(
        "Updating trending status for post:",
        postId,
        "to:",
        payloadStatus
      );

      const response = await axios.post(
        "https://tnreaders.in/mobile/update-trending",
        {
          postId: postId, // No need to convert to string if backend expects number
          isActive: payloadStatus // Send as "yes" or "no"
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
          }
        }
      );

      console.log("API Response:", response.data);

      if (response.data.success) {
        // Update local state immediately using the numeric value (newTrendingStatus)
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? { ...post, istrending: newTrendingStatus }
              : post
          )
        );

        // Also update viewingPost if currently viewing this post
        if (viewingPost?.id === postId) {
          setViewingPost((prev) => ({
            ...prev,
            istrending: newTrendingStatus
          }));
        }

        alert(
          `Trending status updated to ${
            newTrendingStatus === 1 ? "Trending" : "Not Trending"
          }`
        );
      } else {
        alert(response.data.message || "Failed to update trending status");
      }
    } catch (err) {
      console.error("Error updating trending status:", {
        error: err,
        response: err.response,
        message: err.message
      });
      alert(`Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const Loader = () => (
    <div className="loader-container">
      <div className="loader"></div>
    </div>
  );
  return (
    <div className="container mt-4">
      {isLoading ? (
        <Loader />
      ) : !editingPost && !viewingPost ? (
        <>
          <h2 className="mb-4">Latest Posts</h2>
          <div className="botons">
            <Link
              to="/"
              style={{
                textDecoration: "none",
                backgroundColor: "#d3d3d3",
                padding: "10px",
                borderRadius: "8px",
                color: "black"
              }}
            >
              Home
            </Link>
            <button
              className="botons1"
              onClick={() => navigate("/add-articles")}
            >
              Add Articles
            </button>
          </div>
          <div className="row">
            {posts.length > 0 ? (
              posts.map((post) => (
                <div className="col-md-4 mb-4" key={post.id}>
                  <div className="card shadow-sm">
                    <img
                      src={post.web_thumbnail}
                      className="card-img-top"
                      style={{ height: "300px", objectFit: "contain" }}
                      alt={post.FullImgPath}
                      loading="lazy" // Add lazy loading
                      decoding="async" // Add async decoding
                    />
                    <div className="card-body">
                      <h5 className="card-title">{post.title}</h5>
                      <hr />
                      <div className="d-flex justify-content-between w-100">
                        <div>
                          <h5
                            className="card-title"
                            style={{
                              backgroundColor: "#e9ecef",
                              padding: "8px",
                              borderRadius: "5px",
                              width: "100%"
                            }}
                          >
                            {post.category.name}
                          </h5>
                        </div>
                        <div className="d-flex flex-column">
                          <div className="col-md-12">
                            <h6>Created At</h6>
                            <p>{new Date(post.created_at).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mt-3">
                        <div>
                          <button
                            className="btn btn-sm btn-primary me-2"
                            onClick={() => handleEdit(post)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-info text-white"
                            onClick={() => handleView(post)}
                          >
                            View
                          </button>
                        </div>
                        <div className="d-flex align-items-start flex-column justify-content-start">
                          {/* Trending Toggle */}
                          <div
                            className={`form-check form-switch me-3 ${
                              post.istrending === 1
                                ? "text-warning"
                                : "text-secondary"
                            }`}
                            onClick={() =>
                              toggleTrendingStatus(post.id, post.istrending)
                            }
                          >
                            <input
                              className="form-check-input"
                              type="checkbox"
                              role="switch"
                              checked={post.istrending === 1}
                              readOnly
                            />
                            <label className="form-check-label small ms-2">
                              {post.istrending === 1 ? "Trending" : "Normal"}
                            </label>
                          </div>

                          {/* Active Toggle */}
                          <div
                            className={`form-check form-switch ${
                              post.isActive === "yes"
                                ? "text-success"
                                : "text-danger"
                            }`}
                            onClick={() =>
                              togglePostStatus(post.id, post.isActive)
                            }
                          >
                            <input
                              className="form-check-input"
                              type="checkbox"
                              role="switch"
                              checked={post.isActive === "yes"}
                              readOnly
                            />
                            <label className="form-check-label small ms-2">
                              {post.isActive === "yes" ? "Active" : "Disabled"}
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="card-footer">
                      <small className="text-muted">
                        By {post.submasteruser.name}
                      </small>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12 text-center">
                <p>No posts found</p>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <nav aria-label="Page navigation">
                <ul className="pagination">
                  <li
                    className={`page-item ${
                      currentPage === 1 ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                  </li>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <li
                        key={pageNum}
                        className={`page-item ${
                          currentPage === pageNum ? "active" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      </li>
                    );
                  })}

                  <li
                    className={`page-item ${
                      currentPage === totalPages ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}

          <div className="text-center text-muted mt-2">
            Showing {(currentPage - 1) * postsPerPage + 1} to{" "}
            {Math.min(currentPage * postsPerPage, totalPosts)} of {totalPosts}{" "}
            posts
          </div>
        </>
      ) : viewingPost ? (
        <div className="view-post-container">
          <h2 className="mb-4">Post Details</h2>
          <div className="card">
            <div className="card-body">
              <div className="row mb-3">
                <div className="col-md-6">
                  <h4>Title</h4>
                  <p>{viewingPost.title}</p>
                </div>
                <div className="col-md-6">
                  <h4>Content Type</h4>
                  <p>{viewingPost.content_type}</p>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <h4>Main Category</h4>
                  <p>{viewingPost.main_category?.name || "N/A"}</p>
                </div>
                <div className="col-md-6">
                  <h4>Sub Category</h4>
                  <p>{viewingPost.sub_category?.name || "N/A"}</p>
                </div>
              </div>

              <div className="mb-3">
                <h4>Description</h4>
                <p>{viewingPost.description}</p>
              </div>

              {viewingPost.youtube_url && (
                <div className="mb-3">
                  <h4>YouTube URL</h4>
                  <a
                    href={viewingPost.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {viewingPost.youtube_url}
                  </a>
                </div>
              )}

              <div className="row mb-3">
                <div className="col-md-6">
                  <h4>App Thumbnail</h4>
                  {viewingPost.app_thumbnail && (
                    <img
                      src={viewingPost.app_thumbnail}
                      alt="App Thumbnail"
                      className="img-fluid"
                      style={{ maxHeight: "200px" }}
                    />
                  )}
                </div>
                <div className="col-md-6">
                  <h4>Web Thumbnail</h4>
                  {viewingPost.web_thumbnail && (
                    <img
                      src={viewingPost.web_thumbnail}
                      alt="Web Thumbnail"
                      className="img-fluid"
                      style={{ maxHeight: "200px" }}
                    />
                  )}
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <h4>Status</h4>
                  <div className="d-flex align-items-center">
                    <div className="me-3">
                      <p className="mb-0 me-2">Trending:</p>
                      {isProcessing ? (
                        <div className="ms-2">
                          <div
                            className="spinner-border spinner-border-sm text-primary"
                            role="status"
                          >
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </div>
                      ) : (
                        <div
                          className={`form-check form-switch ${
                            viewingPost.istrending === 1
                              ? "text-warning"
                              : "text-secondary"
                          }`}
                          onClick={() =>
                            toggleTrendingStatus(
                              viewingPost.id,
                              viewingPost.istrending
                            )
                          }
                        >
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            checked={viewingPost.istrending === 1}
                            readOnly
                          />
                          <label className="form-check-label small ms-2">
                            {viewingPost.istrending === 1
                              ? "Trending"
                              : "Normal"}
                          </label>
                        </div>
                      )}
                    </div>

                    <div>
                      <p className="mb-0 me-2">Active:</p>
                      {isProcessing ? (
                        <div className="ms-2">
                          <div
                            className="spinner-border spinner-border-sm text-primary"
                            role="status"
                          >
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </div>
                      ) : (
                        <div
                          className={`form-check form-switch ${
                            viewingPost.isActive === "yes"
                              ? "text-success"
                              : "text-danger"
                          }`}
                          onClick={() =>
                            togglePostStatus(
                              viewingPost.id,
                              viewingPost.isActive
                            )
                          }
                        >
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            checked={viewingPost.isActive === "yes"}
                            readOnly
                          />
                          <label className="form-check-label small ms-2">
                            {viewingPost.isActive === "yes"
                              ? "Active"
                              : "Disabled"}
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <h4>Author</h4>
                  <p>{viewingPost.submasteruser?.name || "N/A"}</p>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <h4>Created At</h4>
                  <p>{new Date(viewingPost.created_at).toLocaleString()}</p>
                </div>
                <div className="col-md-6">
                  <h4>Updated At</h4>
                  <p>{new Date(viewingPost.updated_at).toLocaleString()}</p>
                </div>
              </div>

              <div className="d-flex justify-content-between">
                <button
                  className="btn btn-secondary"
                  onClick={() => setViewingPost(null)}
                >
                  Back to List
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    handleEdit(viewingPost);
                    setViewingPost(null);
                  }}
                >
                  Edit Post
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="alignthem">
          {isEditLoading ? (
            <Loader />
          ) : (
            <div className="add-post-container">
              <h2 className="form-title">
                {editingPost ? "Edit Article" : "Add Article"}
              </h2>
              {isSubmitting && (
                <div className="text-center mb-3">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Processing your request...</p>
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Content Type</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="contentType"
                      value="article"
                      className="checking"
                      checked={contentType === "article"}
                      onChange={() => setContentType("article")}
                    />
                    Article
                  </label>

                  <label className="radio-label">
                    <input
                      type="radio"
                      name="contentType"
                      value="shorts"
                      checked={contentType === "shorts"}
                      onChange={() => setContentType("shorts")}
                      className="checking"
                    />
                    Shorts
                  </label>

                  <label className="radio-label">
                    <input
                      type="radio"
                      name="contentType"
                      value="videos"
                      className="checking"
                      checked={contentType === "videos"}
                      onChange={() => setContentType("videos")}
                    />
                    Videos
                  </label>
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
                    {mainCategories.length > 0 &&
                      mainCategories.map((cat) => (
                        <option key={cat.id} value={cat.id.toString()}>
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
                    {subCategories.length > 0 &&
                      subCategories.map((sub) => (
                        <option key={sub.id} value={sub.id.toString()}>
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

              <div className="form-buttons">
                <button
                  className="submit-button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Processing...
                    </>
                  ) : editingPost ? (
                    "Update Article"
                  ) : (
                    "Submit Article"
                  )}
                </button>
                <button
                  className="submit-button cancel"
                  onClick={() => setEditingPost(null)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Listarticle;
