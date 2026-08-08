import {

    BrowserRouter,

    Routes,

    Route

} from "react-router-dom";

import LandingPage from "../pages/public/LandingPage";
import LoginPage from "../pages/public/LoginPage";
import RegisterPage from "../pages/public/RegisterPage";
import CandidateDashboard from "../pages/candidate/CandidateDashboard";
import RecruiterDashboard from "../pages/recruiter/RecruiterDashboard";
import MainLayout from "../components/layout/MainLayout";

function AppRoutes() {

    return (

        <BrowserRouter>

            <Routes>

                <Route element={<MainLayout />}>

                    <Route
                        path="/"
                        element={<LandingPage />}
                    />

                    <Route
                        path="/login"
                        element={<LoginPage />}
                    />

                    <Route
                        path="/register"
                        element={<RegisterPage />}
                    />

                </Route>

                <Route
                    path="/candidate/dashboard"
                    element={<CandidateDashboard />}
                />

                <Route
                    path="/recruiter/dashboard"
                    element={<RecruiterDashboard />}
                />

            </Routes>


        </BrowserRouter>

    );

}

export default AppRoutes;
