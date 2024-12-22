import { Hono } from "hono";
import { sign, decode, verify } from "hono/jwt";
import { getCookie, setCookie } from "hono/cookie";
import { createPostInput, updatePostInput } from "@kr96.aditya2/common-app";

export const blogRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
  Variables: {
    prisma: any;
    user_id: any;
  };
}>();

// Middleware for login checks
blogRouter.use("/*", async (c, next) => {
  console.log("middleware----------");

  const prisma = c.var.prisma;

  //console.log(c);

  try {
    const user_token = getCookie(c, "token");
    console.log(user_token);
    if (!user_token) {
      return c.json({
        message: "Unauthorized: Token not found",
        success: false,
      });
    }

    const decoded = await verify(user_token, c.env.JWT_SECRET);
    const decoded_id = decoded.id as string;

    console.log("id->" + decoded_id);

    if (!decoded_id) {
      throw new Error("Invalid token");
    }

    const user = await prisma.user.findUnique({
      where: {
        id: decoded_id,
      },
    });
    if (!user) {
      return c.json({
        message: "Unauthorized: User does not exist",
        success: false,
      });
    }

    console.log("user is signing in!!");

    c.set("user_id", user.id);
    console.log("USER ID------");
    console.log(c.get("user_id"));

    await next();
  } catch (error) {
    console.log("Authorization failed:", error);
    return c.json({ message: "Unauthorized", success: false });
  }
});

// Create a new blog post
blogRouter.post("/create-post", async (c) => {
  console.log("creating a blog---------");

  const user_id = c.get("user_id");
  const prisma = c.var.prisma;

  const body = await c.req.json();
  const check1 = createPostInput.safeParse(body);
  if (!check1.success) {
    console.log(check1.error.message);
    return c.json({ message: check1.error.message,success:false });
  }

  const post = await prisma.post.create({
    data: {
      title: body.title,
      content: body.content,
      authorId: user_id,
    },
  });
  console.log("post was created----");
  console.log(post);

  return c.json({
    message: "Post was created",
    success: true,
    id: post.id,
  });
});

// Update an existing blog post
blogRouter.put("/update", async (c) => {
  console.log("updating a blog---------");

  const user_id = c.get("user_id");
  const prisma = c.var.prisma;

  const body = await c.req.json();
  const check1 = updatePostInput.safeParse(body);
  if (!check1.success) {
    c.status(400);
    return c.json({ error: "invalid input" });
  }

  const old_post = await prisma.post.findUnique({
    where: {
      id: body.id,
    },
  });

  if (!old_post) {
    return c.json({ message: "Post not found", success: false });
  }

  const new_post = await prisma.post.update({
    where: {
      id: body.id,
      authorId: user_id,
    },
    data: {
      title: body.title,
      content: body.content,
    },
  });

  console.log("post was updated");

  return c.json({
    message: "post was updated",
    old_post: old_post,
    new_post: new_post,
  });
});

// Get a specific blog post by ID
blogRouter.get("/get-blog/:id", async (c) => {
  const id = c.req.param("id");
  const prisma = c.var.prisma;

  const post = await prisma.post.findUnique({
    where: {
      id,
    },
  });

  if (post === null) {
    return c.json({ message: "Post not found" });
  }

  return c.json(post);
});

// Get all blog posts by the logged-in user
blogRouter.get("/get-all", async (c) => {
  const user_id = c.get("user_id");
  const prisma = c.var.prisma;

  const posts = await prisma.post.findMany();


  return c.json(posts);
});

// Batch find authors
blogRouter.post("/find-authors", async (c) => {
  const { authorIds } = await c.req.json();
  const prisma = c.var.prisma;

  const authors = await prisma.user.findMany({
    where: {
      id: { in: authorIds },//expecting array of authorIds??

    },
    select: {
      id: true,
      name: true,
    },
  });

  interface Author {
    id: string;
    name: string;
  }

  interface AuthorList {
    [key: string]: string;
  }

  const author_list_obj: AuthorList = {};

  authors.reduce((acc: AuthorList, it: Author) => {
    acc[it.id] = it.name;
    return acc;
  }, author_list_obj);

  console.log(author_list_obj);
  return c.json({ success: true, author_list_obj });

});


// import { Hono } from "hono";

// import { sign, decode, verify } from "hono/jwt";

// import { getCookie, setCookie } from "hono/cookie";

// import { createPostInput, updatePostInput } from "@kr96.aditya2/common-app"

// export const blogRouter = new Hono<{
//   Bindings: {
//     DATABASE_URL: string;
//     JWT_SECRET: string;
//   };
//   Variables: {
//     prisma: any;
//     user_id: any;
//   };
// }>();

// // Middleware for login checks
// blogRouter.use("/*", async (c, next) => {
//   console.log("middleware----------");

//   const prisma = c.var.prisma;

//   try {
//     const user_token = getCookie(c, "token");
//     if (!user_token) {
//       return c.json({ message: "Unauthorized: Token not found",success:false });
//     }

//     const decoded = await verify(user_token, c.env.JWT_SECRET);

//     const decoded_id = decoded.id as string;

//     console.log("id->" + decoded_id);

//     if (!decoded_id) {
//       throw new Error("Invalid token");
//     }

//     const user = await prisma.user.findUnique({
//       where: {
//         id: decoded_id,
//       },
//     });
//     if (!user) {
//       return c.json({ message: "Unauthorized: User does not exist",success:false});
//     }

//     console.log("user is signing in!!");

//     c.set("user_id", user.id);
//     console.log("USER ID------");
//     console.log(c.get("user_id"));

//     await next();
//   } catch (error) {
//     console.log("Authorization failed:", error);
//     return c.json({ message: "Unauthorized" ,success:false});
//   }
// });

// blogRouter.post("/create", async (c) => {
//   console.log("creating a blog---------");

//   const user_id = c.get("user_id");
//   //console.log(user_id);
//   const prisma = c.var.prisma;

//   const body = await c.req.json();
//   //title,content
//   const check1 = createPostInput.safeParse(body);
//     if (!check1.success) {
//       c.status(400);
//       return c.json({ error: "invalid input" });
//     }

//   //console.log(body);

//   const post = await prisma.post.create({
//     data: {
//       title: body.title,
//       content: body.content,
//       authorId: user_id,
//     },
//   });
//   console.log("post was created----");
//   console.log(post);
//   return c.json({
//     message: "post was created",
//     id: post.id,
//   });
// });

// blogRouter.put("/update", async (c) => {
//   console.log("updating a blog---------");

//   const user_id = c.get("user_id");
//   const prisma = c.var.prisma;

//   const body = await c.req.json();
//   //title,content
//   const check1 = updatePostInput.safeParse(body);
//     if (!check1.success) {
//       c.status(400);
//       return c.json({ error: "invalid input" });
//     }

//   const old_post = await prisma.post.findUnique({
//     where: {
//       id: body.id,
//     },
//   });

//   if (!old_post) {
//     throw new Error("Post not found");
//   }

//   const new_post = await prisma.post.update({
//     where: {
//       id: body.id,
//       authorId: user_id,
//     },
//     data: {
//       title: body.title,
//       content: body.content,
//     },
//   });

//   console.log("post was updated");

//   return c.json({
//     message: "post was updated",
//     old_post: old_post,
//     new_post: new_post,
//   });
// });

// blogRouter.get("/get-blog/:id", async (c) => {
//   const id = c.req.param("id");
//   const prisma = c.var.prisma;

//   const post = await prisma.post.findUnique({
//     where: {
//       id,
//     },
//   });

//   if(post === null){
//     return c.json({message:"Post not found"});
//   }

//   return c.json(post);
// });

// blogRouter.get("/get-all", async (c) => {
//   const user_id = c.get("user_id");
//   const prisma = c.var.prisma;

//   const posts = await prisma.post.findMany({
//     where: {
//       authorId: user_id,
//     },
//   });

//   return c.json(posts);
// });
