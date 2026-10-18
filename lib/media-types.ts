export type Category = "video" | "reel" | "picture";

export type MediaAsset = {
  publicId: string;
  url: string;
  resourceType: "image" | "video";
  width?: number;
  height?: number;
  duration?: number;
};

export type MediaItem = {
  id: string;
  category: Category;
  caption?: string;
  createdAt: string;
  assets: MediaAsset[];
};
