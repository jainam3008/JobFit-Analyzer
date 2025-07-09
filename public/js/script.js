const resumeInput = document.getElementById("resumeInput");
const filePreview = document.getElementById("filePreview");
const jdInput = document.getElementById("jdInput");
const jdPreview = document.getElementById("jdPreview");
const uploadForm = document.getElementById("uploadForm");
const resumePreviewContent = document.getElementById("resumePreviewContent");
const jdPreviewContent = document.getElementById("jdPreviewContent");

resumeInput.addEventListener("change", function () {
  if (resumeInput.files && resumeInput.files.length > 0) {
    const file = resumeInput.files[0];
    const fileType = file.type;

    resumePreviewContent.innerHTML = "";
    const previewDiv = document.createElement("div");
    previewDiv.className = "preview-content";

    if (fileType === "application/pdf") {
      const fileLink = document.createElement("a");
      fileLink.href = URL.createObjectURL(file);
      fileLink.target = "_blank";
      fileLink.textContent = file.name;
      previewDiv.appendChild(fileLink);
    } else {
      const fileNameSpan = document.createElement("span");
      fileNameSpan.textContent = file.name;
      previewDiv.appendChild(fileNameSpan);
    }

    const removeBtn = document.createElement("span");
    removeBtn.className = "remove-file";
    removeBtn.textContent = "×";
    removeBtn.onclick = function () {
      resumeInput.value = "";
      filePreview.classList.remove("show");
      resumePreviewContent.classList.remove("show");
      resumePreviewContent.innerHTML = "";
    };
    previewDiv.appendChild(removeBtn);

    resumePreviewContent.appendChild(previewDiv);
    filePreview.classList.add("show");
  }
});

jdInput.addEventListener("change", function () {
  if (jdInput.files && jdInput.files.length > 0) {
    const file = jdInput.files[0];
    const fileType = file.type;

    jdPreviewContent.innerHTML = "";
    const previewDiv = document.createElement("div");
    previewDiv.className = "preview-content";

    if (fileType === "application/pdf") {
      const fileLink = document.createElement("a");
      fileLink.href = URL.createObjectURL(file);
      fileLink.target = "_blank";
      fileLink.textContent = file.name;
      previewDiv.appendChild(fileLink);
    } else {
      const fileNameSpan = document.createElement("span");
      fileNameSpan.textContent = file.name;
      previewDiv.appendChild(fileNameSpan);
    }

    const removeBtn = document.createElement("span");
    removeBtn.className = "remove-file";
    removeBtn.textContent = "×";
    removeBtn.onclick = function () {
      jdInput.value = "";
      jdPreview.classList.remove("show");
      jdPreviewContent.classList.remove("show");
      jdPreviewContent.innerHTML = "";
    };
    previewDiv.appendChild(removeBtn);

    jdPreviewContent.appendChild(previewDiv);
    jdPreview.classList.add("show");
  }
});

uploadForm.addEventListener("submit", function (event) {
  if (!resumeInput.files || resumeInput.files.length === 0 || !jdInput.files || jdInput.files.length === 0) {
    event.preventDefault();
    alert("Please select both a resume and a job description file to upload.");
  }
});

document.querySelectorAll(".view-details").forEach(button => {
  button.addEventListener("click", function () {
    const target = this.getAttribute("data-target");
    const content = document.getElementById(`${target}PreviewContent`);
    content.classList.toggle("show");
    this.textContent = content.classList.contains("show") ? "Hide Details" : "View Details";
  });
});