// app/components/Login.tsx
"use client";

import React, { useState } from "react";
import { useForm, FormProvider, Controller, Control } from "react-hook-form";
import { useFirebase } from "@/common/context/FirebaseProvider";

interface FormData {
  email: string;
  password: string;
}

export default function Login() {
  const { user, loginWithEmailAndPassword, logout, isLoading } = useFirebase();
  const [loginError, setLoginError] = useState<string>("");
  const [isProcessing, setProcessing] = useState<boolean>(false);

  const methods = useForm<FormData>({
    defaultValues: { email: "", password: "" },
  });
  const { handleSubmit, control } = methods;

  const onSubmit = async (data: FormData) => {
    setProcessing(true);
    setLoginError("");
    try {
      await loginWithEmailAndPassword(data.email, data.password);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(err);
      setLoginError(msg);
    }
    setProcessing(false);
  };

  const PasswordInput = ({
    name,
    control,
  }: {
    name: keyof FormData;
    control: Control<FormData>;
  }) => {
    const [show, setShow] = useState(false);
    return (
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div className="relative">
            <input
              {...field}
              type={show ? "text" : "password"}
              placeholder="Password"
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-md placeholder-gray-400 
                         focus:outline-none focus:ring-2 focus:ring-[#F25C54]"
              required
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-600"
              aria-label={show ? "Hide password" : "Show password"}
            >
              {show ? "Hide" : "Show"}
            </button>
          </div>
        )}
      />
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <span className="text-xl text-gray-700">Loading…</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-sm border border-gray-200 space-y-6">
        {user ? (
          <>
            <h2 className="text-3xl font-bold text-center text-green-600">
              Success
            </h2>
            <p className="text-center text-green-600">You are now logged in.</p>
            <button
              onClick={logout}
              className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-md transition"
            >
              Log Out
            </button>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-bold text-center text-[#F25C54]">
              Sign In
            </h2>
            <FormProvider {...methods}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <input
                        {...field}
                        type="email"
                        placeholder="Email Address"
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-md placeholder-gray-400
                                   focus:outline-none focus:ring-2 focus:ring-[#F25C54]"
                        required
                        autoFocus
                      />
                    </div>
                  )}
                />

                <PasswordInput name="password" control={control} />

                {loginError && (
                  <p className="text-red-500 text-sm text-center" role="alert">
                    {loginError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-2 px-4 font-medium text-white rounded-md 
                             bg-gradient-to-r from-pink-500 to-orange-400
                             hover:from-pink-600 hover:to-orange-500
                             transition-colors disabled:opacity-50"
                >
                  {isProcessing ? "Signing In…" : "Sign In"}
                </button>
              </form>
            </FormProvider>
          </>
        )}
      </div>
    </div>
  );
}
