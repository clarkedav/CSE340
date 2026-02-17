// Select the form
const form = document.querySelector("#updateForm")

if (form) {
  const updateBtn = form.querySelector("button")

  // Start with the button disabled
  updateBtn.setAttribute("disabled", "true")

  // Enable the button only if the form changes
  form.addEventListener("change", function () {
    updateBtn.removeAttribute("disabled")
  })
}
