"use client";

import React, { useState } from "react";
import { useForm, FormProvider, Controller, Control } from "react-hook-form";
import { useFirebase } from "@/common/context/FirebaseProvider";

interface FormData {
  email: string;
  password: string;
}

export default function Login() {
  const { loginWithEmailAndPassword, isAuthenticated, logout } = useFirebase();
  const [loginError, setLoginError] = useState<string>("");
  const [isLoading, setLoading] = useState<boolean>(false);

  const methods = useForm<FormData>({
    defaultValues: { email: "", password: "" },
  });
  const { handleSubmit, control } = methods;

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setLoginError("");
    try {
      await loginWithEmailAndPassword(data.email, data.password);
    } catch (error) {
      let errorMessage = "";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else {
        errorMessage = String(error);
      }
      console.error(error);
      setLoginError(errorMessage);
    }
    setLoading(false);
  };

  const PasswordInput = ({
    name,
    control,
  }: {
    name: keyof FormData;
    control: Control<FormData>;
  }) => {
    const [showPassword, setShowPassword] = useState<boolean>(false);

    const toggleShowPassword = () => setShowPassword((prev) => !prev);

    return (
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div className="relative">
            <input
              {...field}
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full px-4 py-2 border rounded mt-2 text-black"
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-600"
              onClick={toggleShowPassword}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        )}
      />
    );
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-lg">
        {isAuthenticated ? (
          <>
            <h2 className="text-2xl font-bold text-center text-green-600">
              Success
            </h2>
            <p className="text-green-600 text-center">You are now logged in.</p>
            <button
              type="button"
              className="w-full py-2 px-4 bg-red-600 text-white rounded hover:bg-red-700 mt-4"
              onClick={handleLogout}
            >
              Log Out
            </button>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-center text-black">Sign In</h2>
            <FormProvider {...methods}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="email"
                      placeholder="Email Address"
                      className="w-full px-4 py-2 border rounded text-black"
                      required
                      autoFocus
                    />
                  )}
                />
                <PasswordInput name="password" control={control} />
                {loginError && (
                  <div className="text-red-500 text-sm mt-2 text-center">
                    {loginError}
                  </div>
                )}
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </button>
                <button
                  type="button"
                  className="w-full py-2 px-4 bg-red-600 text-white rounded hover:bg-red-700 mt-4"
                  onClick={handleLogout}
                >
                  Log Out
                </button>
              </form>
            </FormProvider>
          </>
        )}
      </div>
    </div>
  );
}
