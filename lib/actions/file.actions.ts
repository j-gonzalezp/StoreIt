"use server";
import { RenameFileProps, UploadFileProps } from "@/types";
import { InputFile } from "node-appwrite/file";
import { ID, Models, Query } from "node-appwrite";
import { appwriteConfig } from "../appwrite/config";
import { getFileType, constructFileUrl, parseStringify } from "../utils";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { createAdminClient } from "../appwrite";
import { error } from "console";
import { stringify } from "querystring";


const handleError = (error: unknown, message: string) => {
    console.log(error, message);
    throw error;
};

export const uploadFile = async ({ file, ownerId, accountId, path }: UploadFileProps) => {
    const { storage, databases } = await createAdminClient();
    try {
        const inputFile = InputFile.fromBuffer(file, file.name);
        const bucketFile = await storage.createFile(appwriteConfig.bucketId, ID.unique(), file);
        const fileDocument = {
            type: getFileType(bucketFile.name).type,
            name: bucketFile.name,
            url: constructFileUrl(bucketFile.$id),
            extension: getFileType(bucketFile.name).extension,
            size: String(bucketFile.sizeOriginal),
            owner: ownerId,
            accountId,
            bucketFileId: bucketFile.$id,
        };

        const newFile = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.filesCollectionId,
            ID.unique(),
            fileDocument,
        ).catch(async (error: unknown) => {
            await storage.deleteFile(appwriteConfig.bucketId, bucketFile.$id);
            handleError(error, "failed to create file document");
        });

        revalidatePath(path);
        return parseStringify(newFile);
    } catch (error) {
        handleError(error, "Failed to upload file");
    }
};
const createQueries = (currentUser: Models.Document) => {
    const queries = [
        Query.or([
            Query.equal("owner", [currentUser.$id]),
            Query.contains("users", [currentUser.email])
        ])
    ]
    return queries
}
export const getFiles = async () => {
    const { databases } = await createAdminClient();
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) throw new Error("User not authenticated");
        const queries = createQueries(currentUser)
        const files = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.filesCollectionId,
            queries,
        )
        return parseStringify(files)
    } catch (error) {
        handleError(error, "Failed to get files");
    }
};

export const renameFile = async ({
    fileId,
    name,
    extension,
    path,
  }: RenameFileProps) => {
    const { databases } = await createAdminClient();
  
    try {
      const newName = `${name}.${extension}`;
      const updatedFile = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.filesCollectionId,
        fileId,
        {
          name: newName,
        },
      );
  
      if (typeof path === 'string') {
        revalidatePath(path);
      } else {
        revalidatePath('/');
      }
      return parseStringify(updatedFile);
    } catch (error) {
      handleError(error, "Failed to rename file");
    }
  };