import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import ProtectedRoute from "./Route/ProtectedRoute";
import CalendarHeader from "./Components/CalenderHeader";
import CalendarPage from "./Pages/CalenderPage";
import "./App.css";

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
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
