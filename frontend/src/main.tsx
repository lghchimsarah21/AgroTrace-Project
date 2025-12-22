
import { createRoot } from 'react-dom/client'
import { BrowserRouter} from "react-router";
import './index.css'
import App from './App.tsx'
import AuthProvider from "@/config/AuthProvider.tsx";




createRoot(document.getElementById('root')!).render(
    <AuthProvider>
        <BrowserRouter>

            <App/>

        </BrowserRouter>
    </AuthProvider>
)
