import { withAuth } from "next-auth/middleware";

export default withAuth(
  function proxy() {},
  {
    pages: {
      signIn: "/admin/login",
    },

    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        // Public admin authentication pages
        if (
          pathname === "/admin/login" ||
          pathname === "/admin/forgot-password" ||
          pathname === "/admin/reset-password"
        ) {
          return true;
        }

        // All other /admin routes require admin authentication
        return token?.role === "admin";
      },
    },
  }
);

export const config = {
  matcher: ["/admin/:path*"],
};
