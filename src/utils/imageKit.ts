import ImageKit from 'imagekit';
import { Document } from 'mongoose';
import multer from 'multer';


const storage = multer.memoryStorage();
export const upload = multer({ storage: storage });


export const imagekit = new ImageKit({
    publicKey: process.env.PUBLIC_KEY_IMAGEKIT || '',
    privateKey: process.env.PRIVATE_KEY_IMAGEKIT || '',
    urlEndpoint: "https://ik.imagekit.io/r9vwbtuo5/"
});

export const processImage = async <T extends Document>(
    doc: T,
    buffer: Buffer<ArrayBufferLike>,
    nameField: string
): Promise<T> => {
    const { url } = await imagekit.upload({
        file: buffer.toString("base64"),
        fileName: "name.jpg",
    });
    doc.set({ [nameField]: url })
    return doc;
}