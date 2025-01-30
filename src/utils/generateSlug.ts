import { Document, Model } from "mongoose";
import slugify from "slugify";

const generateSlug = async <T extends Document>(
    newDoc: T,
    model: Model<T>,
    nameField: string,
    name: string
): Promise<void> => {

    let slug = slugify(name, { lower: true, strict: true })
    let counter = 0;


    while (true) {
        const existingDoc = await model.findOne({ slug }).exec();

        if (!existingDoc) {
            break;
        }

        ++counter;
        slug = slugify(`${name} ${counter}`, { lower: true, strict: true });
    }

    newDoc.set({
        [nameField]: counter > 0 ? `${name} ${counter}` : name,
        slug
    })

}

export default generateSlug