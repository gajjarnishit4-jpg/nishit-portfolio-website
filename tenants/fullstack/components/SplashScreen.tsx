import { BrandLogo } from "@/tenants/fullstack/components/BrandPrimitives";

export function SplashScreen() {
  return (
    <div
      className="site-splash site-splash--simple"
      aria-hidden="true"
    >
      <div className="site-splash__simple-lockup">
        <BrandLogo splash />
        <p>WEB · MOBILE · SHOPIFY · WORDPRESS · SOFTWARE</p>
      </div>
      <div className="site-splash__progress" aria-hidden="true"><span /></div>
    </div>
  );
}
