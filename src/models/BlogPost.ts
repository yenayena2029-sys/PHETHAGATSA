import mongoose, { Schema, model, models } from "mongoose";

const BlogPostSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    content: { type: String, required: true },
    thumbnail: { type: String, default: "" },
    author: { type: String, default: "Admin" },
    published: { type: Boolean, default: false },
  },
  { timestamps: true }
);

if (models.BlogPost) {
  delete (models as any).BlogPost;
}
const BlogPost = model("BlogPost", BlogPostSchema);
export default BlogPost;
