export const FULLSTACK_DOMAIN = "thefullstackguys.us";
export const FULLSTACK_ORIGIN = `https://${FULLSTACK_DOMAIN}`;
export const FULLSTACK_ROUTE_PREFIX = "/tenant/fullstack";

export function isFullstackHost(_host: string | null, _development = false) {
  void _host;
  void _development;
  // This checkout is the dedicated Fullstack Guys app, including on localhost.
  return true;
}
