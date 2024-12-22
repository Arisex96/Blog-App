import { Hono } from "hono";
import bcrypt from "bcryptjs";
import { sign } from "hono/jwt";
import { signinInput, signupInput } from "@kr96.aditya2/common-app";
import { setCookie } from "hono/cookie";

export const userRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
  Variables: {
    prisma: any;
    user_id: any;
  };
}>();

// Signup endpoint
userRouter.post("/signup", async (c) => {
  const prisma = c.var.prisma;
  const body = await c.req.json();

  const check1 = signupInput.safeParse(body);
  if (!check1.success) {
    c.status(400);
    return c.json({ message: "Invalid input" });
  }

  const hashedPassword = await bcrypt.hash(body.password, 10);

  try {
    const new_user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: hashedPassword,
      },
    });

    const jwt = await sign({ id: new_user.id }, c.env.JWT_SECRET);

    // Set the token in the cookies (secure, HttpOnly, SameSite)
    setCookie(c, "token", jwt, {
      httpOnly: true,
      sameSite: "None", // Required for cross-origin
      path: "/",
    });

    return c.json({ message: "User created successfully", success: true });
  } catch (e) {
    return c.json({
      success: false,
      message: "User already exists",
    });
  }
});

// Signin endpoint
userRouter.post("/signin", async (c) => {
  const prisma = c.var.prisma;
  const body = await c.req.json();

  const check1 = signinInput.safeParse(body);
  if (!check1.success) {
    c.status(400);
    return c.json({ message: "Invalid input", success: false });
  }

  const user = await prisma.user.findUnique({
    where: {
      email: body.email,
    },
  });

  if (!user) {
    return c.json({
      message: "User does not exist",
      success: false,
    });
  }

  if (!(await bcrypt.compare(body.password, user.password))) {
    return c.json({
      message: "Invalid Password",
      success: false,
    });
  }

  const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);

  // Set the token in the cookies (secure, HttpOnly, SameSite)
  setCookie(c, "token", jwt, {
    httpOnly: true, // Cookie cannot be accessed via JavaScript
    sameSite: "None", // Required for cross-site cookies
    secure: true, // Use Secure in production (HTTPS only)
    path: "/", // Ensure cookie is available on all routes
  });
  

  return c.json({ message: "User Login successfully", success: true, user_id: user.id });
});

// Root endpoint
userRouter.get("/", (c) => {
  return c.text("Hello Hono!");
});

// import { Hono } from "hono";

// import bcrypt from "bcryptjs";

// import { sign, decode, verify } from "hono/jwt";

// import { signinInput, signupInput } from "@kr96.aditya2/common-app";

// import { getCookie, setCookie } from "hono/cookie";

// export const userRouter = new Hono<{
//   Bindings: {
//     DATABASE_URL: string;
//     JWT_SECRET: string;
//   };
//   Variables: {
//     prisma: any;
//     user_id: any;
//   };
// }>();

// // Signup endpoint
// userRouter.post("/signup", async (c) => {
//   console.log("enter signup api-----------");

//   const prisma = c.var.prisma;

//   const body = await c.req.json();
//   console.log("body", body);

//   //email,name,password

//   const check1 = signupInput.safeParse(body);
//   if (!check1.success) {
//     c.status(400);
//     console.log("invalid input");
//     return c.json({ message: "Invalid input" });
//   }

//   const hashedPassword = await bcrypt.hash(body.password, 10);

//   try {
//     const new_user = await prisma.user.create({
//       data: {
//         name: body.name,
//         email: body.email,
//         password: hashedPassword,
//       },
//     });

//     console.log("New user created");

//     const jwt = await sign({ id: new_user.id }, c.env.JWT_SECRET);

//     console.log("JWT token created -> " + jwt);

//     // Set the token in the cookies (secure, HttpOnly, SameSite)
//     setCookie(c, "token", jwt);

//     return c.json({ message: "User created successfully", success: true });
//   } catch (e) {
//     console.log("Failed to create new user", e);
//     return c.json({
//       success: false,
//       message: "User already exists",
//     });
//   }
// });

// // Signin endpoint
// userRouter.post("/signin", async (c) => {
//   console.log("enter signin api-----------");

//   const prisma = c.var.prisma;

//   const body = await c.req.json();

//   //email,password

//   const check1 = signinInput.safeParse(body);
//   if (!check1.success) {
//     c.status(400);
//     return c.json({ message: "Invalid input", success: false });
//   }

//   const user = await prisma.user.findUnique({
//     where: {
//       email: body.email,
//     },
//   });

//   if (!user) {
//     console.log("User does not exist");
//     return c.json({
//       message: "User does not exist",
//       success: false,
//     });
//   }

//   console.log("User exists");

//   if (!(await bcrypt.compare(body.password, user.password))) {
//     console.log("Invalid password");
//     return c.json({
//       message: "Invalid Password",
//       success: false,
//     });
//   }

//   const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);

//   // Set the token in the cookies (secure, HttpOnly, SameSite)
//   setCookie(c, "token", jwt);

//   console.log("JWT token created -> " + jwt);

//   return c.json({ message: "User Login successfully", success: true ,user_id:user.id});
// });

// // Root endpoint
// userRouter.get("/", (c) => {
//   return c.text("Hello Hono!");
// });
