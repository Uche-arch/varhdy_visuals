import { z } from "zod";
import { CATEGORIES, MAX_CAPTION, MAX_PICTURES } from "@/lib/constants";
import type { Category } from "@/lib/media-types";

export const resourceTypeFor = (category: Category) =>
  category === "picture" ? "image" : "video";

export const signSchema = z.object({
  category: z.enum(CATEGORIES),
});

const assetSchema = z.object({
  publicId: z.string().min(1).max(300),
  resourceType: z.enum(["image", "video"]),
});

export const createMediaSchema = z
  .object({
    category: z.enum(CATEGORIES),
    caption: z.string().trim().max(MAX_CAPTION).optional(),
    assets: z.array(assetSchema).min(1).max(MAX_PICTURES),
  })
  .superRefine((data, ctx) => {
    const expected = resourceTypeFor(data.category);

    if (data.assets.some((a) => a.resourceType !== expected)) {
      ctx.addIssue({
        code: "custom",
        path: ["assets"],
        message: `A ${data.category} must contain ${expected} files only.`,
      });
    }
    if (data.category !== "picture" && data.assets.length !== 1) {
      ctx.addIssue({
        code: "custom",
        path: ["assets"],
        message: "Upload exactly one file at a time for videos and reels.",
      });
    }
    if (data.category === "video" && !data.caption?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["caption"],
        message: "Project videos need a caption.",
      });
    }
  });

export type CreateMediaInput = z.infer<typeof createMediaSchema>;
