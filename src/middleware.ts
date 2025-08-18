import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware() {
    // Middleware personalizado pode ser adicionado aqui
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    // Rotas que precisam de autenticação
    "/dashboard/:path*",
    "/profile/:path*",
    "/api/protected/:path*",
  ],
};
