import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
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
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import Logo from "@/components/ui/logo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const loginSchema = insertUserSchema.extend({
  rememberMe: z.boolean().optional(),
});

const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(1, "Confirm password is required"),
  fullName: z.string().min(1, "Full name is required"),
  terms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export function AuthForms() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const { loginMutation, registerMutation } = useAuth();

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      terms: false,
    },
  });

  function onLoginSubmit(data: LoginFormValues) {
    loginMutation.mutate({
      username: data.username,
      password: data.password,
    });
  }

  function onRegisterSubmit(data: RegisterFormValues) {
    registerMutation.mutate({
      username: data.username,
      password: data.password,
    });
  }

  return (
    <div className="w-full max-w-md px-6">
      <div className="text-center mb-10">
        <Logo size="md" className="mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          {activeTab === "login" ? "Welcome to ParkPal" : "Create an Account"}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          {activeTab === "login" 
            ? "Sign in to start using the app" 
            : "Sign up for your 7-day free trial"}
        </p>
      </div>

      <Tabs 
        defaultValue="login" 
        value={activeTab} 
        onValueChange={(value) => setActiveTab(value as "login" | "register")}
        className="w-full"
      >
        <TabsList className="hidden">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>

        <TabsContent value="login" className="mt-0">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex items-center justify-between">
                  <FormField
                    control={loginForm.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="rememberMe" 
                          checked={field.value} 
                          onCheckedChange={field.onChange}
                        />
                        <label
                          htmlFor="rememberMe"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Remember me
                        </label>
                      </div>
                    )}
                  />
                  <div className="text-sm">
                    <a href="#" className="font-medium text-primary hover:text-primary-dark">
                      Forgot password?
                    </a>
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </Form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    Or
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button variant="outline" className="w-full" type="button">
                  Google
                </Button>
                <Button variant="outline" className="w-full" type="button">
                  Apple
                </Button>
              </div>
            </div>
          </div>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => setActiveTab("register")}
                className="font-medium text-primary hover:text-primary-dark"
              >
                Sign up
              </button>
            </p>
          </div>
        </TabsContent>

        <TabsContent value="register" className="mt-0">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                <FormField
                  control={registerForm.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="terms"
                  render={({ field }) => (
                    <div className="flex items-start space-x-2">
                      <Checkbox 
                        id="terms" 
                        checked={field.value} 
                        onCheckedChange={field.onChange}
                        className="mt-1"
                      />
                      <div className="grid gap-1.5 leading-none">
                        <label
                          htmlFor="terms"
                          className="text-sm text-gray-700 dark:text-gray-300"
                        >
                          I agree to the{" "}
                          <a href="#" className="text-primary hover:text-primary-dark">
                            Terms of Service
                          </a>{" "}
                          and{" "}
                          <a href="#" className="text-primary hover:text-primary-dark">
                            Privacy Policy
                          </a>
                        </label>
                        <FormMessage />
                      </div>
                    </div>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </Form>
          </div>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setActiveTab("login")}
                className="font-medium text-primary hover:text-primary-dark"
              >
                Sign in
              </button>
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AuthForms;
