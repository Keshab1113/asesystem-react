import "./App.css";
import { Routes, Route } from "react-router-dom";
import Layout from "./layout";
import Home from "./pages/Home/Home"

function App() {
  

  return (
    <>
    <Routes>
        <Route path="/" element={<Layout/>}>
          <Route index element={<Home/>} />
          {/* <Route path="/login" element={<Login />} /> */}
          {/* <Route path="/signup" element={<Signup />} /> */}
        </Route>
      </Routes>
    </>
  );
}

export default App;
