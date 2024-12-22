import { Hono } from "hono";
import { userRouter } from "./routes/user";
import { blogRouter } from "./routes/blog";
import { cors } from "hono/cors"; // Import the cors middleware from hono/cors


import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

export const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
    NODE_ENV: string;
  };
  Variables: {
    prisma: any;
    user_id: any;
  };
}>();

// Apply CORS middleware
app.use(cors({
  origin: 'https://blog-app-git-main-kr96adityas-projects.vercel.app/', // Allow only this origin
  credentials: true, // Allow cookies and credentials
}));

// Prisma client setup and injecting into context
app.use("/*", async (c, next) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  //console.log("entering");

  c.set("prisma", prisma); // stores custom var to c object

  await next();
});

// Define routes
app.route("/api/v1/user", userRouter);
app.route("/api/v1/blog", blogRouter);

export default app;
