import { jsPDF } from "jspdf";
import { NodeBackendInstance } from "./AxiosInstance";
import { NodeBackendService } from "./Api's/ApiMiddleWare";
import ApiEndpoints from "./Api's/ApiEndpoints";

const savePdf = (content, title) => {
    const doc = new jsPDF();
    let y = 10;

    content.forEach((data, index) => {
        // Heading
        doc.setFont("helvetica", "bold");
        if (y > 280) {
            doc.addPage();
            y = 10;
        }
        doc.text(`Response ${index + 1}:`, 10, y);
        y += 8;

        // Text body
        doc.setFont("helvetica", "normal");
        const textLines = doc.splitTextToSize(data?.text || "", 180);
        textLines.forEach((line) => {
            if (y > 280) {
                doc.addPage();
                y = 10;
            }
            doc.text(line, 10, y);
            y += 7;
        });

        // Add spacing between entries
        y += 5;
    });

    doc.save(`${title}-ats-score.pdf`);
};


const downloadAtsPdf = async (body, pdfTitle) => {
    try {
        console.log("Sending request to generate ATS score via nodebackend service...");
        const res = await NodeBackendService(ApiEndpoints.generateATSScore, body, 'multipart/form-data');
        console.log(res.data);
        savePdf(res.data.response, pdfTitle);
    } catch (error) {
        alert("Something went wrong. Please try again later.");
        console.error(error)
    }
}

export { downloadAtsPdf }