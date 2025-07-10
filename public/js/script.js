const resumeInput = document.getElementById("resumeInput");
const filePreview = document.getElementById("filePreview");
const jdInput = document.getElementById("jdInput");
const jdPreview = document.getElementById("jdPreview");
const uploadForm = document.getElementById("uploadForm");
const resumePreviewContent = document.getElementById("resumePreviewContent");
const jdPreviewContent = document.getElementById("jdPreviewContent");
const jdModeToggle = document.getElementById("jdModeToggle");
const jdFileInput = document.getElementById("jdFileInput");
const jdTextInput = document.getElementById("jdTextInput");
const jdTextArea = document.getElementById("jdTextArea");
const analyzeBtn = document.getElementById("analyzeBtn");
const loadingSpinner = document.getElementById("loadingSpinner");

function updateSubmitButton() {
  const hasResume = resumeInput.files && resumeInput.files.length > 0;
  const hasJdFile = jdInput.files && jdInput.files.length > 0;
  const hasJdText = jdTextArea.value.trim().length > 0;
  const isTextMode = jdModeToggle.checked;

  analyzeBtn.disabled = !hasResume || (!hasJdFile && !hasJdText) || (isTextMode && !hasJdText) || (!isTextMode && !hasJdFile);
}

jdModeToggle.addEventListener("change", () => {
  if (jdModeToggle.checked) {
    jdFileInput.classList.add("d-none");
    jdTextInput.classList.remove("d-none");
    jdInput.value = "";
    jdPreview.classList.remove("show");
    jdPreviewContent.innerHTML = "";
  } else {
    jdFileInput.classList.remove("d-none");
    jdTextInput.classList.add("d-none");
    jdTextArea.value = "";
  }
  updateSubmitButton();
});

resumeInput.addEventListener("change", () => {
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
    removeBtn.onclick = () => {
      resumeInput.value = "";
      filePreview.classList.remove("show");
      resumePreviewContent.classList.remove("show");
      resumePreviewContent.innerHTML = "";
      updateSubmitButton();
    };
    previewDiv.appendChild(removeBtn);

    resumePreviewContent.appendChild(previewDiv);
    filePreview.classList.add("show");
  }
  updateSubmitButton();
});

jdInput.addEventListener("change", () => {
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
    removeBtn.onclick = () => {
      jdInput.value = "";
      jdPreview.classList.remove("show");
      jdPreviewContent.classList.remove("show");
      jdPreviewContent.innerHTML = "";
      updateSubmitButton();
    };
    previewDiv.appendChild(removeBtn);

    jdPreviewContent.appendChild(previewDiv);
    jdPreview.classList.add("show");
  }
  updateSubmitButton();
});

jdTextArea.addEventListener("input", updateSubmitButton);

uploadForm.addEventListener("submit", (event) => {
  const hasResume = resumeInput.files && resumeInput.files.length > 0;
  const hasJdFile = jdInput.files && jdInput.files.length > 0;
  const hasJdText = jdTextArea.value.trim().length > 0;

  if (!hasResume || (!hasJdFile && !hasJdText)) {
    event.preventDefault();
    alert("Please select a resume and provide a job description (file or text).");
    return;
  }

  if (hasJdFile && hasJdText) {
    event.preventDefault();
    alert("Please provide either a job description file or text, not both.");
    return;
  }

  analyzeBtn.disabled = true;
  loadingSpinner.classList.remove("d-none");
});

document.querySelectorAll(".view-details").forEach(button => {
  button.addEventListener("click", function () {
    const target = this.getAttribute("data-target");
    const content = document.getElementById(`${target}PreviewContent`);
    content.classList.toggle("show");
    this.textContent = content.classList.contains("show") ? "Hide Details" : "View Details";
  });
});