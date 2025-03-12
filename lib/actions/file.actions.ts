"use server"
import { UploadFileProps } from "@/types"
import { InputFile } from "node-appwrite"
import { ID, Models, Query } from "node-appwrite"
import { appwriteConfig, } from "../appwrite/config"
import { getFileType, constructFileUrl, parseStringify } from "../utils"
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { createAdminClient } from "../appwrite"

const handleError = (error: unknown, message: string) => {
    console.log(error, message)
    throw error
}

export const uploadFile = async ({ file, ownerId, accountId, path }: UploadFileProps) => {
    const { storage, databases } = await createAdminClient()
    try {
        const inputFile = InputFile.fromBuffer(file, file.name)
        const bucketFile = await storage.createFile(appwriteConfig.bucketId, ID.unique(), file)
        const fileDocument = {
            type: getFileType(bucketFile.name).type,
            name: bucketFile.name,
            url: constructFileUrl(bucketFile.$id),
            extension: getFileType(bucketFile.name).extension,
            size: bucketFile.sizeOriginal,
            owner: ownerId,
            accountId,
            user: [],
            bucketFileId: bucketFile.$id
        }
        const newFile = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.filesCollectionId,
            ID.unique(),
            fileDocument,
        ).catch(async (error: unknown) => {
            await storage.deleteFile(appwriteConfig.bucketId, bucketFile.$id)
            handleError(error, "failed to create file document")
        })
        revalidatePath(path)
        return parseStringify(newFile)
    } catch (error) {
        handleError(error, "Failed to upload file")
    }
}