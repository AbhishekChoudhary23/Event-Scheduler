import "./App.css";
import Login from "./Pages/Login";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./Route/ProtectedRoute";
import Signup from "./Pages/Signup";
import CalendarHeader from "./Components/CalenderHeader";
import CalendarPage from "./Pages/CalenderPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route exact path="/home" element={<ProtectedRoute />}>
          <Route
            exact
            path="/home"
            element={
              <>
                <CalendarHeader /> 
                <CalendarPage />
              </>
            }
          />
          {/* <Route exact path="/home" element={<Home />} /> */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
