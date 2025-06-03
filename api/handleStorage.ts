import moment from "moment";
import { supabase } from "../lib/supabase";
import getMimeFromFileType from "../utilities/getMimeFromFileType";
import { Bucket } from "@/types/general";

type UploadFilePayload = {
    id: string;
    uri: string;
    mimeType?: string | undefined;
    bucketName: Bucket;
    fileName: string;
    fileExtension: string;
}

type FileResponse = {
    uri: string;
    isSuccessful: boolean;
    message: string;
}

const uploadFile = async ({id, uri, mimeType, bucketName, fileName, fileExtension}: UploadFilePayload): Promise<FileResponse> => {
    try {
        const arraybuffer = await fetch(uri).then((res) => res.arrayBuffer())

        const fileExt: string = uri?.split('.').pop()?.toLowerCase() ?? fileExtension;
        const path: string = `${id}/${fileName ?? ''}${moment().toISOString()}.${fileExt}`
        const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(path, arraybuffer, {
                contentType: mimeType || getMimeFromFileType(fileExt),
            })
  
        if (error) {
          throw error
        }
  
        return {
            uri: data.path,
            isSuccessful: true,
            message: "upload successful",
        }

    } catch (error) {
        throw error;
    }
}



const deleteFile = async ({bucketName, uri}: {bucketName: Bucket, uri: string}): Promise<void> => {
    try {
        // console.log('deleting file', uri);
        const { error } = await supabase.storage.from(bucketName).remove([uri]);
        if (error) {
            throw error;
        }
    } catch (error) {
        throw error;
    }
}

// Check if file is PDF either by URI or mimeType
const isPDF = (uri: string, mimeType: string): boolean => {
    return uri.toLowerCase().includes('pdf') || 
           uri.toLowerCase().endsWith('.pdf') || 
           mimeType?.toLowerCase().includes('pdf');
};


type DownloadFilePayload = {
    bucketName: string;
    uri: string;
    base64?: boolean | undefined;
}

const downloadFile = async ({bucketName, uri, base64}: DownloadFilePayload): Promise<FileResponse> => {
    try {
        if (!base64) {
            const { data, error } = await supabase
                .storage
                .from(bucketName)
                .createSignedUrl(uri, 3600 * 24); // URL valid for 1 hour
            
            if (error) {
                throw error;
            }
    
            return {
                uri: data?.signedUrl,
                isSuccessful: true,
                message: "upload successful",
            }
        }

        const { data, error } = await supabase.storage.from(bucketName).download(uri);

        if (error) {
            throw error;
        }

        // Wrap FileReader in a Promise
        const base64Uri: string = await new Promise((resolve, reject) => {
            const fr:any = new FileReader();
            fr.readAsDataURL(data); // Convert Blob to Base64
            fr.onload = () => resolve(fr.result); // Resolve with Base64 string
            fr.onerror = () => reject(new Error('Error reading the Blob data'));
        });

        return {
            uri: base64Uri,
            isSuccessful: true,
            message: "upload successful",
        }
    } catch (error: any) {
        console.log('Error downloading file:', error.message);
        throw error;
    }
};

export default {
    uploadFile,
    deleteFile,
    downloadFile,
}