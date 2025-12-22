
import './App.css'

import {Navigate, Route, Routes} from 'react-router'
import LoginForm from './pages/LoginForm'
import SignUpForm from './pages/SignUpForm'
import { Toaster } from 'sonner'
import Home from "./pages/Home.tsx";
import ProfileRecommendations from "./pages/ProfileRecommendations.tsx"
import Home2 from "./pages/Home2.tsx";
import {useAuth} from "@/config/AuthProvider.tsx";
import Profile from "@/pages/Profile.tsx";
import RecommendationPage from "@/pages/recommendation-page.tsx";
import CropPredictionPage from "@/pages/prediction-page.tsx";






function App() {


    const { isLoggedIn } = useAuth();
    document.body.style.overflow = 'auto';


  return (
    <>


      




      <Toaster richColors/>
    
      <Routes>
         <Route path="/" element={ <Home2/> }/>
         <Route path="/recommendation" element={ <RecommendationPage/> }/>
         <Route path="/prediction" element={ <CropPredictionPage/> }/>
        <Route path="/profile" element={ isLoggedIn ? <ProfileRecommendations/> : <Navigate to = "/login" replace/>}/>
        <Route path="/login" element={!isLoggedIn ? <LoginForm/> : <Navigate to="/"/>}/>
        <Route path="/signup" element={ !isLoggedIn ? <SignUpForm /> : <Navigate to="/"/>} /> {/* SignUp Route */}
      </Routes>
    
    </>
  )
}


export default App
