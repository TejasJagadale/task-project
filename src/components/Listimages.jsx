import React, { useEffect, useState } from "react";
import axios from "axios";
import "../style/Addarticle.css";
import { Link } from "react-router-dom";

const Listimages = () => {
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalImages, setTotalImages] = useState(0);
  const imagesPerPage = 50; // Matching your existing perPage value

  const fetchImages = async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `https://tnreaders.in/web/view-assets-mpeoples?type=image&perPage=${imagesPerPage}&currentPage=${page}`
      );
      const data = response.data;
      setImages(data.data || []);
      setCurrentPage(data.current_page || 1);
      setTotalPages(data.last_page || 1);
      setTotalImages(data.total || 0);
    } catch (error) {
      console.error("Error fetching image data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (fullUrl) => {
    navigator.clipboard.writeText(fullUrl).then(() => {
      alert("Image URL copied to clipboard!");
    });
  };

  useEffect(() => {
    fetchImages(currentPage);
  }, [currentPage]);
  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-0">Image Gallery</h2>
        </div>
        <div className="d-flex justify-content-between align-items-center mb-4 gap-3">
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
          <Link to="/add-images" className="btn btn-primary">
            Upload Thumbnails
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          <div className="row">
            {images.map((img) => {
              const imgUrl = `${img.FullImgPath}/${img.asset}`;
              return (
                <div key={img.id} className="col-md-4 mb-4">
                  <div className="card h-100">
                    <img
                      src={imgUrl}
                      className="card-img-top"
                      alt={img.asset}
                      style={{ height: "300px", objectFit: "contain" }}
                    />
                    <div className="card-body">
                      <h5 className="card-title">{img.asset}</h5>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleCopy(imgUrl)}
                      >
                        Copy URL
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Enhanced Pagination Controls */}
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
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                    >
                      First
                    </button>
                  </li>

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

                  <li
                    className={`page-item ${
                      currentPage === totalPages ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      Last
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}

          <div className="text-center text-muted mt-2">
            Showing {(currentPage - 1) * imagesPerPage + 1} to{" "}
            {Math.min(currentPage * imagesPerPage, totalImages)} of{" "}
            {totalImages} images
          </div>
        </>
      )}
    </div>
  );
};

export default Listimages;
