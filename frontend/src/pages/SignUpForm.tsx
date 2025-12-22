"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import '../Styles/LoginForm.css'
import { useNavigate } from "react-router"
import '../Styles/animatioForm.css'
import { useEffect, useState } from "react"
import api from "@/config/api"
import { toast } from "sonner"
const formSchema = z
  .object({
    email: z.string().email({
      message: "Please enter a valid email address.",
    }),
    username: z.string().min(6,{
        message: "Please enter a valid username.",
      }),
    fullName: z.string().min(6,{
        message: "Please enter a valid fullname.",
      }),
    password: z.string().min(6, {
      message: "Password must be at least 6 characters.",
    }),
    confirmPassword: z.string().min(6, {
      message: "Confirm Password must be at least 6 characters.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });


  interface signupResponse {
    jwt: string,
    message: string,
    fullName: string,
    email: string,
    username: string,
  }

function SignUpForm() {


    const [show, setShow] = useState(false);
  
  useEffect(() => {
    setTimeout(() => setShow(true), 100); // Delay to ensure animation is triggered
  }, []);


  const navigate = useNavigate();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      username: "",
      fullName: "",
      password: "",
      confirmPassword: "",
    },
  });




  const signUp = async (values: z.infer<typeof formSchema>) => {

    try {

    
    const { confirmPassword, ...formData } = values;

    const response = await api.post<signupResponse>("/auth/signup", formData);
    if(response.data.jwt) {
      localStorage.setItem("jwt", response.data.jwt)
      console.log("Submitted data", formData);
      console.log("Register with success :", response.data.message);
      toast.success('Registeration with success')
      navigate("/login");
    }

  } catch (error: any) {
    toast.error('Registration failed, please try again');
    console.log("Error during registration : ", error.message);
  }
    
    
  }


  return (
    <div className="page-container">

<div className={`imageLogin signup ${show ? "fade-in" : ""}`}>
        <img src='../../public/auth.jpg'/>
      </div>

      <div className="form-container">
        <div className="login-form">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(signUp)} className="space-y-8">

              <div>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="flex flex-col space-y-4 form-input animationDelay3">
                      <FormLabel className="text-left">Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>


              <div>
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem className="flex flex-col space-y-4 form-input animationDelay4">
                      <FormLabel className="text-left">Username</FormLabel>
                      <FormControl>
                        <Input {...field} type="text" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>


              <div>
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem className="flex flex-col space-y-4 form-input animationDelay5">
                      <FormLabel className="text-left">Fullname</FormLabel>
                      <FormControl>
                        <Input {...field} type="text" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>


              <div>
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="flex flex-col space-y-4 form-input animationDelay6">
                      <FormLabel className="text-left">Password</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>   


              <div>
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem className="flex flex-col space-y-4 form-input animationDelay7">
                      <FormLabel className="text-left">Confirm Password</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>   



              <Button className="button-form button-form" type="submit">Signup</Button>
            </form>
          </Form>

                    <Button variant="outline" className="mt-4 button-form" onClick={() => navigate("/login")}>
                      Switch to Login in
                    </Button>

        </div>
      </div>

      
    </div>
  );
}

export default SignUpForm;
