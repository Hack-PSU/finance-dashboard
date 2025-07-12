"use client";

import { useState } from "react";
import {
  useForm,
  FormProvider,
  Controller,
  type Control,
} from "react-hook-form";
import { useFirebase } from "@/common/context/FirebaseProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock, CheckCircle, LogOut } from "lucide-react";

interface FormData {
  email: string;
  password: string;
}

export default function Login() {
  const { user, loginWithEmailAndPassword, logout, isLoading, resetPassword } =
    useFirebase();
  const [isProcessing, setProcessing] = useState<boolean>(false);
  const [isForgotPasswordLoading, setIsForgotPasswordLoading] =
    useState<boolean>(false);

  const methods = useForm<FormData>({
    defaultValues: { email: "", password: "" },
  });

  const { handleSubmit, control, getValues } = methods;

  const onSubmit = async (data: FormData) => {
    setProcessing(true);
    try {
      await loginWithEmailAndPassword(data.email, data.password);
      toast.success("Welcome back!", {
        description: "You have successfully signed in.",
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(err);
      toast.error("Sign in failed", {
        description: msg,
      });
    }
    setProcessing(false);
  };

  const handleForgotPassword = async () => {
    const email = getValues("email");
    if (!email) {
      toast.error("Email required", {
        description: "Please enter your email address first.",
      });
      return;
    }

    setIsForgotPasswordLoading(true);
    try {
      // Assuming forgotPassword function exists in Firebase context
      await resetPassword(email);
      toast.success("Reset email sent", {
        description: "Check your email for password reset instructions.",
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error("Failed to send reset email", {
        description: msg,
      });
    }
    setIsForgotPasswordLoading(false);
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
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                {...field}
                id="password"
                type={show ? "text" : "password"}
                placeholder="Enter your password"
                className="pl-10 pr-10"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShow((s) => !s)}
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                aria-label={show ? "Hide password" : "Show password"}
              >
                {show ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
          </div>
        )}
      />
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-lg text-gray-700">Loading...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        {user ? (
          <>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-green-600">
                Welcome Back!
              </CardTitle>
              <CardDescription className="text-green-600">
                You are successfully signed in.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button
                onClick={logout}
                variant="outline"
                className="w-full bg-transparent"
                size="lg"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r bg-gray-700 bg-clip-text text-transparent">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-gray-600">
                Sign in to your account to continue
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">
                          Email Address
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            {...field}
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            className="pl-10"
                            required
                            autoFocus
                          />
                        </div>
                      </div>
                    )}
                  />

                  <PasswordInput name="password" control={control} />

                  <div className="flex items-center justify-end">
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      onClick={handleForgotPassword}
                      disabled={isForgotPasswordLoading}
                      className="px-0 text-blue-600 hover:text-blue-800"
                    >
                      {isForgotPasswordLoading
                        ? "Sending..."
                        : "Forgot password?"}
                    </Button>
                  </div>

                  <Button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full bg-gradient-to-r bg-gray-700 text-white font-medium py-2.5"
                    size="lg"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Signing In...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </FormProvider>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
