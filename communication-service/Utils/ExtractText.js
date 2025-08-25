import path from "path";
import fs from "fs";
import pdf from "pdf-parse/lib/pdf-parse.js";

import { uploadDir } from "./FileHandle.js";

const extractTextFromPdf = async (pdfFile) => {
    const filePath = path.join(uploadDir, pdfFile.filename);
    const dataBuffer = fs.readFileSync(filePath);

    // remove uploaded file after reading
    fs.unlinkSync(filePath);

    try {
        const data = await pdf(dataBuffer);
        return data.text;
    } catch (err) {
        console.error("Error reading PDF:", err);
        return "";
    }
};

export { extractTextFromPdf };
