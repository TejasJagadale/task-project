import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Listarticle from "./components/Listarticle";
import Listimages from "./components/Listimages";
import Uploadarticles from "./components/Uploadarticles";
import Uploadimages from "./components/Uploadimages";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/list-article" element={<Listarticle />} />
          <Route path="/list-images" element={<Listimages />} />
          <Route path="/add-articles" element={<Uploadarticles />} />
          <Route path="/add-images" element={<Uploadimages />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
