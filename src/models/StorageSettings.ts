import mongoose, { Schema, model, models } from "mongoose";

const StorageSettingsSchema = new Schema(
  {
    activeStorageProvider: { type: String, default: "local" },
    doEndpoint: { type: String, default: "nyc3.digitaloceanspaces.com" },
    doRegion: { type: String, default: "nyc3" },
    doKey: { type: String, default: "" },
    doSecret: { type: String, default: "" },
    doBucket: { type: String, default: "snapshop-spaces" },

    s3Bucket: { type: String, default: "snapshop-bucket" },
    s3Region: { type: String, default: "us-east-1" },
    s3Key: { type: String, default: "" },
    s3Secret: { type: String, default: "" },

    gcsBucket: { type: String, default: "snapshop-gcs" },
    gcsKey: { type: String, default: "" },
    gcsSecret: { type: String, default: "" },

    b2Bucket: { type: String, default: "snapshop-b2" },
    b2Endpoint: { type: String, default: "s3.us-west-004.backblazeb2.com" },
    b2KeyId: { type: String, default: "" },
    b2Key: { type: String, default: "" },
  },
  { timestamps: true }
);

const StorageSettings = models.StorageSettings || model("StorageSettings", StorageSettingsSchema);
export default StorageSettings;
