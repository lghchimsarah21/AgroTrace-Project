"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import "../Styles/LoginForm.css";
import { toast } from "sonner"



import "../Styles/animatioForm.css"
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import api from "@/config/api";
import {useAuth} from "@/config/AuthProvider.tsx";

const loginSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});


interface loginRespone {
    jwt: string,
    message: string,
    fullName: string,
    email: string,
    username: string,

}





function AuthForm() {


  const [show, setShow] = useState(false);
  const { login} = useAuth();
  const navigate = useNavigate();


useEffect(() => {
  setTimeout(() => setShow(true), 100);// Delay to ensure animation is triggered
}, []);

  



   const form = useForm<z.infer<typeof loginSchema>>({
     resolver: zodResolver(loginSchema),
     defaultValues: {
       email: "",
       password: "",
     },
   });


  

  const logIn = async (values: z.infer<typeof loginSchema>) => {

    try {

  
    const response = await api.post<loginRespone>("/auth/signing", values);
    
    if(response.data.jwt) {
      localStorage.setItem("jwt", response.data.jwt);
      console.log("submitted data", values);
      console.log("response returned from spring", response);
      toast.success("Logged in successfuly");
      const userData = {
          email: response.data.email,
          username: response.data.username,
          fullName: response.data.fullName,
          jwt: response.data.jwt
      }
      login(userData);
      navigate("/");
    }

    } catch (error) {
      console.error(error);
      toast.error("Error, please try again")
    }

  }



  return (


    <div className="page-container">


      <div className="form-container">
        <div className="login-form">
           
          <Form {...form}>
            <form onSubmit={form.handleSubmit(logIn)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="flex flex-col space-y-4 form-input animationDelay1">
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="flex flex-col space-y-4 form-input animationDelay2">
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              
              <Button type="submit" className="button-form">Login</Button>
            </form>
          </Form>

          <Button variant="outline" className="mt-4 button-form" onClick={() => navigate("/signup")}>
            Switch to Sign Up
          </Button>
        </div>
      </div>

      <div className={`imageLogin login ${show ? "fade-in" : ""}`}>
        <img src='../../public/auth.jpg'/>
      </div>
    </div>
  );
}

export default AuthForm;
