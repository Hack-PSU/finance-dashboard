import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useFirebase } from "@/common/context/FirebaseProvider";

import FullScreenLoading from "@/components/FullScreenLoading/FullScreenLoading";

type AuthGuardProps = {
  children: React.ReactNode;
};

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoading, isAuthenticated } = useFirebase();

  useEffect(() => {
    if (pathname !== "/login" && !isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [pathname, isLoading, isAuthenticated, router]);

  if (pathname === "/login") {
    return <>{children}</>;
  }

  if (isLoading || !isAuthenticated) {
    return <FullScreenLoading />;
  }

  return <>{children}</>;
};

export default AuthGuard;
