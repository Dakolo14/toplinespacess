import { makeRouteHandler } from "@keystatic/next/route-handler";
import config from "../../../../../keystatic.config";

const online = process.env.NODE_ENV === "development" || !!process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG;
const handler = makeRouteHandler({ config });
const off = () => new Response("Admin is not switched on for this deployment.", { status: 404 });

export const GET = online ? handler.GET : off;
export const POST = online ? handler.POST : off;
