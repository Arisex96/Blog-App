import z from "zod";
//npm publish --access public
//npm i @kr96.aditya2/common-app
export const signupInput = z.object({
    email: z.string().email(),
    password: z.string().min(3),
    name: z.string().optional(),
});

export type SignupType = z.infer<typeof signupInput>;

export const signinInput = z.object({
    email: z.string().email(),
    password: z.string().min(3),
});

export type SigninType = z.infer<typeof signinInput>;

export const createPostInput = z.object({
    title: z.string().min(3),
    content: z.string().min(3),
});

export type CreatePostType = z.infer<typeof createPostInput>;

export const updatePostInput = z.object({
    title: z.string().optional(),
    content: z.string().optional(),
});

export type UpdatePostType = z.infer<typeof updatePostInput>;