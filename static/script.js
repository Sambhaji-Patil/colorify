document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const fileInput = document.getElementById("file-input")
  const uploadArea = document.getElementById("upload-area")
  const previewContainer = document.getElementById("image-preview-container")
  const previewImage = document.getElementById("preview-image")
  const removeImageBtn = document.getElementById("remove-image")
  const colorizeBtn = document.getElementById("colorize-btn")
  const renderFactorInput = document.getElementById("render_factor")
  const renderFactorValue = document.getElementById("render-factor-value")
  const originalImage = document.getElementById("original-image")
  const colorizedImage = document.getElementById("colorized-image")
  const enhancementCanvas = document.getElementById("enhancement-canvas")
  const finalImage = document.getElementById("final-image")
  const downloadBtn = document.getElementById("download-btn")
  const startOverBtn = document.getElementById("start-over")
  const resetEnhancementsBtn = document.getElementById("reset-enhancements")
  const applyEnhancementsBtn = document.getElementById("apply-enhancements")

  // Add these constants at the top with the other DOM elements
  const facebookBtn = document.querySelector(".social-btn.facebook")
  const twitterBtn = document.querySelector(".social-btn.twitter")
  const pinterestBtn = document.querySelector(".social-btn.pinterest")
  const emailBtn = document.querySelector(".social-btn.email")

  // Enhancement sliders
  const brightnessSlider = document.getElementById("brightness")
  const contrastSlider = document.getElementById("contrast")
  const sharpnessSlider = document.getElementById("sharpness")
  const saturationSlider = document.getElementById("saturation")
  const vibranceSlider = document.getElementById("vibrance")

  // Enhancement values
  const brightnessValue = document.getElementById("brightness-value")
  const contrastValue = document.getElementById("contrast-value")
  const sharpnessValue = document.getElementById("sharpness-value")
  const saturationValue = document.getElementById("saturation-value")
  const vibranceValue = document.getElementById("vibrance-value")

  // Step elements
  const steps = document.querySelectorAll(".step")
  const stepContents = document.querySelectorAll(".step-content")

  // Variables
  let uploadedFile = null
  let colorizedImageUrl = null
  let finalImagePublicUrl = null // Store the public URL of the final image
  const ctx = enhancementCanvas.getContext("2d")
  let enhancedImageData = null

  // Event Listeners
  uploadArea.addEventListener("click", () => fileInput.click())
  uploadArea.addEventListener("dragover", handleDragOver)
  uploadArea.addEventListener("dragleave", handleDragLeave)
  uploadArea.addEventListener("drop", handleDrop)
  fileInput.addEventListener("change", handleFileSelect)
  removeImageBtn.addEventListener("click", removeImage)
  colorizeBtn.addEventListener("click", colorizeImage)
  renderFactorInput.addEventListener("input", updateRenderFactorValue)
  resetEnhancementsBtn.addEventListener("click", resetEnhancements)
  applyEnhancementsBtn.addEventListener("click", applyEnhancements)
  startOverBtn.addEventListener("click", startOver)

  // Enhancement sliders event listeners
  brightnessSlider.addEventListener("input", updateEnhancementValue)
  contrastSlider.addEventListener("input", updateEnhancementValue)
  sharpnessSlider.addEventListener("input", updateEnhancementValue)
  saturationSlider.addEventListener("input", updateEnhancementValue)
  vibranceSlider.addEventListener("input", updateEnhancementValue)

  // Add these event listeners with the other event listeners
  facebookBtn.addEventListener("click", () => shareOnFacebook())
  twitterBtn.addEventListener("click", () => shareOnTwitter())
  pinterestBtn.addEventListener("click", () => shareOnPinterest())
  emailBtn.addEventListener("click", () => shareViaEmail())

  // Functions
  function handleDragOver(e) {
    e.preventDefault()
    uploadArea.classList.add("drag-over")
  }

  function handleDragLeave(e) {
    e.preventDefault()
    uploadArea.classList.remove("drag-over")
  }

  function handleDrop(e) {
    e.preventDefault()
    uploadArea.classList.remove("drag-over")

    if (e.dataTransfer.files.length) {
      handleFiles(e.dataTransfer.files)
    }
  }

  function handleFileSelect(e) {
    if (e.target.files.length) {
      handleFiles(e.target.files)
    }
  }

  function handleFiles(files) {
    const file = files[0]

    if (file && file.type.match("image.*")) {
      uploadedFile = file

      const reader = new FileReader()
      reader.onload = (e) => {
        previewImage.src = e.target.result
        previewContainer.style.display = "block"
        uploadArea.style.display = "none"
        colorizeBtn.disabled = false
      }
      reader.readAsDataURL(file)
    }
  }

  function removeImage() {
    previewImage.src = ""
    previewContainer.style.display = "none"
    uploadArea.style.display = "flex"
    colorizeBtn.disabled = true
    uploadedFile = null
    fileInput.value = ""
  }

  function updateRenderFactorValue() {
    renderFactorValue.textContent = renderFactorInput.value
  }

  function colorizeImage() {
    if (!uploadedFile) return

    // Move to step 2 (loading)
    goToStep(2)

    // Create form data
    const formData = new FormData()
    formData.append("image", uploadedFile)
    formData.append("model", document.getElementById("model").value)
    formData.append("render_factor", renderFactorInput.value)

    // Make actual API call to Flask backend
    fetch("/colorize", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok")
        }
        return response.json()
      })
      .then((data) => {
        // Get the original image for comparison
        originalImage.src = previewImage.src

        // Set the colorized image with the URL from the server
        colorizedImage.src = data.image_url
        colorizedImageUrl = data.image_url

        // Prepare the canvas for enhancements
        colorizedImage.onload = () => {
          enhancementCanvas.width = colorizedImage.width
          enhancementCanvas.height = colorizedImage.height
          resetEnhancements()

          // Move to step 3 (enhance)
          goToStep(3)
        }
      })
      .catch((error) => {
        console.error("Error during colorization:", error)
        alert("An error occurred during colorization. Please try again.")
        goToStep(1)
      })
  }

  function updateEnhancementValue(e) {
    const slider = e.target
    const valueElement = document.getElementById(`${slider.id}-value`)
    valueElement.textContent = slider.value

    applyEnhancementsToCanvas()
  }

  function applyEnhancementsToCanvas() {
    if (!colorizedImage.complete) return

    const brightness = Number.parseFloat(brightnessSlider.value)
    const contrast = Number.parseFloat(contrastSlider.value)
    const saturation = Number.parseFloat(saturationSlider.value)
    const sharpness = Number.parseFloat(sharpnessSlider.value)
    const vibrance = Number.parseFloat(vibranceSlider.value)

    // Reset canvas
    ctx.clearRect(0, 0, enhancementCanvas.width, enhancementCanvas.height)
    ctx.drawImage(colorizedImage, 0, 0, enhancementCanvas.width, enhancementCanvas.height)

    // Get image data
    const imageData = ctx.getImageData(0, 0, enhancementCanvas.width, enhancementCanvas.height)
    const data = imageData.data

    // Apply enhancements
    for (let i = 0; i < data.length; i += 4) {
      // Get RGB values
      let r = data[i]
      let g = data[i + 1]
      let b = data[i + 2]

      // Apply brightness
      r = r * brightness
      g = g * brightness
      b = b * brightness

      // Apply contrast
      const factor = (259 * (contrast * 100 + 255)) / (255 * (259 - contrast * 100))
      r = factor * (r - 128) + 128
      g = factor * (g - 128) + 128
      b = factor * (b - 128) + 128

      // Apply saturation
      const gray = 0.2989 * r + 0.587 * g + 0.114 * b
      r = gray + saturation * (r - gray)
      g = gray + saturation * (g - gray)
      b = gray + saturation * (b - gray)

      // Apply vibrance (simplified)
      const max = Math.max(r, g, b)
      const avg = (r + g + b) / 3
      const amt = (max - avg) * 2 * vibrance

      if (r !== max) r += (max - r) * amt
      if (g !== max) g += (max - g) * amt
      if (b !== max) b += (max - b) * amt

      // Apply sharpness (simplified edge detection)
      if (sharpness > 0 && i > 0 && i < data.length - 4) {
        const prevR = data[i - 4]
        const prevG = data[i - 3]
        const prevB = data[i - 2]

        r = r + (r - prevR) * sharpness
        g = g + (g - prevG) * sharpness
        b = b + (b - prevB) * sharpness
      }

      // Clamp values
      data[i] = Math.max(0, Math.min(255, r))
      data[i + 1] = Math.max(0, Math.min(255, g))
      data[i + 2] = Math.max(0, Math.min(255, b))
    }

    // Put the image data back
    ctx.putImageData(imageData, 0, 0)
    enhancedImageData = imageData
  }

  function resetEnhancements() {
    // Reset sliders to default values
    brightnessSlider.value = 1.0
    contrastSlider.value = 1.0
    sharpnessSlider.value = 0
    saturationSlider.value = 1.0
    vibranceSlider.value = 0

    // Update displayed values
    brightnessValue.textContent = 1.0
    contrastValue.textContent = 1.0
    sharpnessValue.textContent = 0
    saturationValue.textContent = 1.0
    vibranceValue.textContent = 0

    // Clear canvas and redraw original colorized image
    if (colorizedImage.complete) {
      ctx.clearRect(0, 0, enhancementCanvas.width, enhancementCanvas.height)
      ctx.drawImage(colorizedImage, 0, 0, enhancementCanvas.width, enhancementCanvas.height)
    }
  }

  function applyEnhancements() {
    // Create a temporary canvas to get the final image
    const tempCanvas = document.createElement("canvas")
    tempCanvas.width = enhancementCanvas.width
    tempCanvas.height = enhancementCanvas.height
    const tempCtx = tempCanvas.getContext("2d")

    // Draw the enhanced image
    if (enhancedImageData) {
      tempCtx.putImageData(enhancedImageData, 0, 0)
    } else {
      tempCtx.drawImage(colorizedImage, 0, 0, tempCanvas.width, tempCanvas.height)
    }

    // Get the data URL
    const finalImageDataUrl = tempCanvas.toDataURL("image/jpeg", 0.9)

    // Set the final image
    finalImage.src = finalImageDataUrl

    // Set the download link
    downloadBtn.href = finalImageDataUrl
    downloadBtn.download = "colorized-image.jpg"

    // Upload the enhanced image to get a public URL for sharing
    uploadEnhancedImage(finalImageDataUrl)

    // Add WhatsApp button if it doesn't exist
    if (!document.querySelector(".social-btn.whatsapp")) {
      const whatsappBtn = document.createElement("button")
      whatsappBtn.className = "social-btn whatsapp"
      whatsappBtn.innerHTML = '<i class="fab fa-whatsapp"></i>'
      whatsappBtn.addEventListener("click", shareOnWhatsApp)

      // Add WhatsApp button after Pinterest
      document.querySelector(".social-btn.pinterest").insertAdjacentElement("afterend", whatsappBtn)

      // Add WhatsApp style
      const style = document.createElement("style")
      style.textContent = ".social-btn.whatsapp { background-color: #25D366; }"
      document.head.appendChild(style)
    }

    // Move to step 4 (share)
    goToStep(4)
  }

  // Function to upload the enhanced image to the server
  function uploadEnhancedImage(dataUrl) {
    // Convert data URL to blob
    const blob = dataURLtoBlob(dataUrl)

    // Create form data
    const formData = new FormData()
    formData.append("enhanced_image", blob, "enhanced-image.jpg")

    // Show loading indicator for share buttons
    const socialBtns = document.querySelectorAll(".social-btn")
    socialBtns.forEach((btn) => {
      btn.disabled = true
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'
    })

    // Upload to server
    fetch("/save_enhanced", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok")
        }
        return response.json()
      })
      .then((data) => {
        // Store the public URL
        finalImagePublicUrl = data.image_url

        // Re-enable share buttons
        socialBtns.forEach((btn) => {
          btn.disabled = false
        })

        // Restore original icons
        facebookBtn.innerHTML = '<i class="fab fa-facebook-f"></i>'
        twitterBtn.innerHTML = '<i class="fab fa-twitter"></i>'
        pinterestBtn.innerHTML = '<i class="fab fa-pinterest-p"></i>'
        emailBtn.innerHTML = '<i class="fas fa-envelope"></i>'
        if (document.querySelector(".social-btn.whatsapp")) {
          document.querySelector(".social-btn.whatsapp").innerHTML = '<i class="fab fa-whatsapp"></i>'
        }
      })
      .catch((error) => {
        console.error("Error uploading enhanced image:", error)

        // Re-enable share buttons but show warning
        socialBtns.forEach((btn) => {
          btn.disabled = false
          btn.innerHTML = '<i class="fas fa-exclamation-triangle"></i>'
        })

        // Alert user
        alert("Unable to prepare image for sharing. Social sharing may not work properly.")
      })
  }

  // Helper function to convert data URL to Blob
  function dataURLtoBlob(dataURL) {
    const parts = dataURL.split(";base64,")
    const contentType = parts[0].split(":")[1]
    const raw = window.atob(parts[1])
    const rawLength = raw.length
    const uInt8Array = new Uint8Array(rawLength)

    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i)
    }

    return new Blob([uInt8Array], { type: contentType })
  }

  function startOver() {
    // Reset everything and go back to step 1
    removeImage()
    resetEnhancements()

    // Clear all image sources
    originalImage.src = "/placeholder.svg"
    colorizedImage.src = "/placeholder.svg"
    finalImage.src = "/placeholder.svg"

    // Clear canvas
    if (ctx) {
      ctx.clearRect(0, 0, enhancementCanvas.width, enhancementCanvas.height)
    }

    // Reset all variables
    uploadedFile = null
    colorizedImageUrl = null
    finalImagePublicUrl = null
    enhancedImageData = null

    // Reset download button
    downloadBtn.href = "#"
    downloadBtn.download = ""

    // Reset social buttons if they were modified
    const socialBtns = document.querySelectorAll(".social-btn")
    socialBtns.forEach((btn) => {
      btn.disabled = false
    })

    // Restore original icons
    if (facebookBtn) facebookBtn.innerHTML = '<i class="fab fa-facebook-f"></i>'
    if (twitterBtn) twitterBtn.innerHTML = '<i class="fab fa-twitter"></i>'
    if (pinterestBtn) pinterestBtn.innerHTML = '<i class="fab fa-pinterest-p"></i>'
    if (emailBtn) emailBtn.innerHTML = '<i class="fas fa-envelope"></i>'
    if (document.querySelector(".social-btn.whatsapp")) {
      document.querySelector(".social-btn.whatsapp").innerHTML = '<i class="fab fa-whatsapp"></i>'
    }

    // For a complete reset, reload the page
    // This is the most reliable way to ensure a fresh start
    window.location.reload()

    // If we don't reload, at least go to step 1
    goToStep(1)
  }

  function goToStep(stepNumber) {
    // Update steps
    steps.forEach((step, index) => {
      if (index + 1 < stepNumber) {
        step.classList.remove("active")
        step.classList.add("completed")
      } else if (index + 1 === stepNumber) {
        step.classList.add("active")
        step.classList.remove("completed")
      } else {
        step.classList.remove("active", "completed")
      }
    })

    // Update content
    stepContents.forEach((content, index) => {
      if (index + 1 === stepNumber) {
        content.classList.add("active")
      } else {
        content.classList.remove("active")
      }
    })
  }

  // Function to share on Facebook
  function shareOnFacebook() {
    if (finalImagePublicUrl) {
      // Use Web Share API if available and on mobile
      if (navigator.share && isMobile()) {
        navigator
          .share({
            title: "My Colorized Image",
            text: "Check out this image I colorized with ColoriFy!",
            url: finalImagePublicUrl,
          })
          .catch((error) => {
            console.error("Error sharing:", error)
            // Fallback to traditional method
            traditionalFacebookShare()
          })
      } else {
        // Traditional Facebook sharing
        traditionalFacebookShare()
      }
    } else {
      alert("Please wait while we prepare your image for sharing.")
    }
  }

  function traditionalFacebookShare() {
    const shareUrl = encodeURIComponent(finalImagePublicUrl || window.location.href)
    const shareTitle = encodeURIComponent("Check out my colorized image with ColoriFy!")

    window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${shareTitle}`, "_blank")
  }

  // Function to share on Twitter (X.com)
  function shareOnTwitter() {
    if (finalImagePublicUrl) {
      const shareText = encodeURIComponent("Check out this image I colorized with ColoriFy!")
      const shareUrl = encodeURIComponent(finalImagePublicUrl)

      window.open(`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`, "_blank")
    } else {
      alert("Please wait while we prepare your image for sharing.")
    }
  }

  // Function to share on Pinterest
  function shareOnPinterest() {
    if (finalImagePublicUrl) {
      const shareUrl = encodeURIComponent(window.location.href)
      const imageUrl = encodeURIComponent(finalImagePublicUrl)
      const description = encodeURIComponent("Colorized with ColoriFy")

      window.open(
        `https://pinterest.com/pin/create/button/?url=${shareUrl}&media=${imageUrl}&description=${description}`,
        "_blank",
      )
    } else {
      alert("Please wait while we prepare your image for sharing.")
    }
  }

  // Function to share via Email
  function shareViaEmail() {
    const subject = encodeURIComponent("Check out my colorized image!")
    let body = encodeURIComponent("I colorized this image using ColoriFy.")

    if (finalImagePublicUrl) {
      body += encodeURIComponent("\n\nView the image here: " + finalImagePublicUrl)
    }

    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }

  // Function to share via WhatsApp
  function shareOnWhatsApp() {
    let shareText = encodeURIComponent("Check out this image I colorized with ColoriFy!")

    if (finalImagePublicUrl) {
      shareText += encodeURIComponent("\n\n" + finalImagePublicUrl)
    } else {
      shareText += encodeURIComponent("\n\n" + window.location.href)
    }

    window.open(`https://wa.me/?text=${shareText}`, "_blank")
  }

  // Helper function to detect mobile devices
  function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }

  // Initialize
  updateRenderFactorValue()
})

