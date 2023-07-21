/* global grecaptcha */

/* global ajax_object */

function submitForm(messageDiv, form, file, recaptchaResponse) {
	const xhr = new XMLHttpRequest();
	const formData = new FormData(form);
	formData.append('action', 'send_email');

	if (recaptchaResponse) {
		formData.append('recaptcha_response', recaptchaResponse);
	}

	if (file) {
		formData.delete("brochure")
		formData.append("brochure", file)
	}

	xhr.open('POST', ajax_object.ajaxurl, true);

	xhr.onload = function() {
		if (xhr.status === 200) {
			const response = JSON.parse(xhr.responseText);
			if (response.data) {
				// Display the success message in the div
				messageDiv.textContent = response.data.message;
				form.reset();
			} else {
				// Display the error message in the div
				messageDiv.textContent = response.data.message;
				console.log(response.data);
			}
		} else {
			// Display the AJAX error message in the div
			messageDiv.textContent = "An error occurred with the AJAX request";
		}
	};

	xhr.send(formData);
}

window.addEventListener("load", function() {
	const brochureLinks = document.querySelectorAll("a[href*=\"#brochure\"]")
	const modalForm = document.querySelector("#modal-form")
	const modalFormClose = document.querySelector("#modal-form-close")
	let file // variable for storing the file URL

	// Check if modalForm is initially in 'block' display
	if (modalForm && getComputedStyle(modalForm).display === "block") {
		document.body.style.overflow = "hidden"
	}

	if (brochureLinks && modalForm && modalFormClose) {
		brochureLinks.forEach(function(element) {
			element.addEventListener("click", function(e) {
				e.preventDefault()

				// Retrieve the full href including query parameters
				const href = element.getAttribute("href")

				// Check if href contains '?'
				if (href.includes("?")) {
					// Split the href on the '?' character to get the parameters
					const parts = href.split("?")

					// Check if we have parameters
					if (parts.length > 1) {
						// Split the parameters on the '=' character to get the file URL
						const params = parts[1].split("=")

						// Check if we have a file parameter
						if (params[0] === "FILE_ID") {
							file = params[1]
						}
					}
				}

				modalForm.style.display = "block"
				document.body.style.overflow = "hidden"
			})
		})

		modalFormClose.addEventListener("click", function() {
			modalForm.style.display = "none"
			document.body.style.overflow = "auto"
			document.body.style.overflowX = "hidden"
		})

		window.addEventListener("click", function(e) {
			if (e.target === modalForm) {
				modalForm.style.display = "none"
				document.body.style.overflow = "auto"
				document.body.style.overflowX = "hidden"
			}
		})

		window.addEventListener("keydown", function(e) {
			if (e.key === "Escape") {
				modalForm.style.display = "none"
				document.body.style.overflow = "auto"
				document.body.style.overflowX = "hidden"
			}
		})
	}

	// on form submit
	const form = document.querySelector("#modal-form form")
	if (form) {
		form.addEventListener("submit", function(e) {
			e.preventDefault()
			const recaptchaInput = form.querySelector('input[name="recaptcha_site_key"]');
			const messageDiv = form.querySelector('.influactive-form-message');

			if (recaptchaInput && grecaptcha) {
				const recaptcha_site_key = recaptchaInput.value;
				grecaptcha.ready(function() {
					grecaptcha.execute(recaptcha_site_key, {action: 'submit'}).then(function(token) {
						submitForm(messageDiv, form, file, token);
						setTimeout(function() {
							messageDiv.textContent = '';
						}, 5000);
					});
				});
			} else {
				submitForm(messageDiv, form, file);
				setTimeout(function() {
					messageDiv.textContent = '';
				}, 5000);
			}
		});
	}
})
