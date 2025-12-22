import React, {createContext, useContext, useState} from 'react'





interface userData {
    email: string;
    username: string;
    fullName: string;
    jwt: string;
}

interface AuthProviderProps {
    user: userData | null;
    isLoggedIn: boolean;
    login(data: userData): void,
    logout(): void,
    getAuthToken(): void,
}


const AuthContext = createContext<AuthProviderProps | null>(null);

const isTokenValid = (token: string) => {
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.exp > Date.now() / 1000;
    } catch (e) {
        console.log("Token is invalid", e);
        return false;
    }
};

export const useAuth = () => {
    const auth = useContext(AuthContext);
    if(!auth) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return auth;
}


const AuthProvider = ( { children } : { children: React.ReactNode }) => {


    const getInitialState = () => {

        const savedUser = localStorage.getItem("user");
        const savedToken = localStorage.getItem("jwt");

        if(savedUser && savedToken && isTokenValid(savedToken)) {
            return {
                isLoggedIn: true,
                user: JSON.parse(savedUser),
            }
        }

        return {
            isLoggedIn: false,
            user: null,
        }

    }


    const [authState, setAuthState] = useState(getInitialState());

    const login = (userData: userData) => {
        setAuthState(
            {
                isLoggedIn: true,
                user: userData
            }
        )

        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("jwt", userData.jwt)
    };

    const logout = () => {
        setAuthState(
            {
                isLoggedIn: false,
                user: null,
            }
        )
        localStorage.removeItem("user");
        localStorage.removeItem("jwt");
        console.log("logout is called !")

    }

    const getAuthToken = () => {
        return localStorage.getItem("jwt");
    }

    return (
        <AuthContext.Provider
        value={{
            isLoggedIn: authState.isLoggedIn,
            user: authState.user,
            login,
            logout,
            getAuthToken,
        }}
        >
            {children}
        </AuthContext.Provider>
    )
}


export default AuthProvider;
