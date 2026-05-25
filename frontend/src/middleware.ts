export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/dashboard/:path*", "/roadmap/:path*", "/topic/:path*", "/question/:path*", "/patterns/:path*", "/stats/:path*", "/settings/:path*"],
};
