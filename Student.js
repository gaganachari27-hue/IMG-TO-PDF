const { jsPDF } = window.jspdf;

const dropArea = document.getElementById("drop-area");
const fileInput = document.getElementById("fileInput");
const preview = document.getElementById("preview");
const convertBtn = document.getElementById("convertBtn");
const loader = document.getElementById("loader");

let images = [];

dropArea.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", (e) => {
    handleFiles(e.target.files);
});

dropArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropArea.style.background = "#f2f2f2";
});

dropArea.addEventListener("dragleave", () => {
    dropArea.style.background = "";
});

dropArea.addEventListener("drop", (e) => {
    e.preventDefault();
    dropArea.style.background = "";
    handleFiles(e.dataTransfer.files);
});

function handleFiles(files) {
    for (let file of files) {
        if (file.type.startsWith("image/")) {
            images.push(file);
            displayPreview(file);
        }
    }
}

function displayPreview(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const div = document.createElement("div");
        div.classList.add("preview-item");

        const img = document.createElement("img");
        img.src = e.target.result;

        const removeBtn = document.createElement("button");
        removeBtn.innerText = "×";
        removeBtn.classList.add("remove-btn");

        removeBtn.onclick = function() {
            preview.removeChild(div);
            images = images.filter(imgFile => imgFile !== file);
        };

        div.appendChild(img);
        div.appendChild(removeBtn);
        preview.appendChild(div);
    };
    reader.readAsDataURL(file);
}

convertBtn.addEventListener("click", async () => {

    if (images.length === 0) {
        alert("Please upload images first.");
        return;
    }

    loader.style.display = "block";

    const pageSize = document.getElementById("pageSize").value;
    const orientation = document.getElementById("orientation").value;
    const pdfName = document.getElementById("pdfName").value || "ImgToPdf";

    const pdf = new jsPDF({
        orientation: orientation,
        unit: "mm",
        format: pageSize
    });

    for (let i = 0; i < images.length; i++) {

        const imgData = await readFile(images[i]);
        const img = new Image();
        img.src = imgData;

        await new Promise(resolve => img.onload = resolve);

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        const ratio = Math.min(pdfWidth / img.width, pdfHeight / img.height);

        const imgWidth = img.width * ratio;
        const imgHeight = img.height * ratio;

        const x = (pdfWidth - imgWidth) / 2;
        const y = (pdfHeight - imgHeight) / 2;

        if (i > 0) pdf.addPage();

        pdf.addImage(imgData, "JPEG", x, y, imgWidth, imgHeight);
    }

    pdf.save(pdfName + ".pdf");

    loader.style.display = "none";
});

function readFile(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
    });
}
