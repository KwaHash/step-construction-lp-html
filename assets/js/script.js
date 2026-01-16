// Questionnaire state
let currentStep = 1;
const totalSteps = 7;
let selectedOptions = {};

// Capture URL parameters and referrer URL on page load
const urlParams = new URLSearchParams(window.location.search);
const referrerUrl = window.location.href; // Full URL with parameters

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  showQuestion(currentStep);
  updatePreviousButtonVisibility();
  initializeQuestionnaire();
});

function showQuestion(step, direction = 'forward') {
  const allQuestions = document.querySelectorAll('.question-step');
  const currentQuestion = document.querySelector(`.question-step[data-step="${step}"]`);
  const previousQuestion = document.querySelector('.question-step.active');
  
  if (!currentQuestion) return;
  
  // If there's a previous question, fade it out first
  if (previousQuestion && previousQuestion !== currentQuestion) {
    previousQuestion.classList.add('fade-out');
    
    setTimeout(() => {
      previousQuestion.classList.remove('active', 'fade-out');
      previousQuestion.style.display = 'none';
      
      // Show and fade in new question
      currentQuestion.style.display = 'block';
      // Force reflow to ensure display change is applied
      currentQuestion.offsetHeight;
      currentQuestion.classList.add('active');
      
      // Restore saved selections after transition
      restoreSelections(step);
    }, 200); // Half of transition duration
  } else {
    // First load or no previous question
    allQuestions.forEach(q => {
      q.classList.remove('active', 'fade-out');
      q.style.display = 'none';
    });
    
    currentQuestion.style.display = 'block';
    // Force reflow and add slight delay for smooth initial fade-in
    currentQuestion.offsetHeight;
    requestAnimationFrame(() => {
      currentQuestion.classList.add('active');
    });
    
    // Restore saved selections
    restoreSelections(step);
  }
}

function restoreSelections(step) {
  const currentQuestion = document.querySelector(`.question-step[data-step="${step}"]`);
  if (!currentQuestion) return;
  
  const savedSelection = selectedOptions[step];
  if (!savedSelection) return;
  
  // Handle different question types
  const hasCheckboxes = currentQuestion.querySelector('.checkbox-section');
  const hasForm = currentQuestion.querySelector('.form-section');
  
  if (hasCheckboxes) {
    // Restore checkbox selections
    if (Array.isArray(savedSelection)) {
      savedSelection.forEach(value => {
        const checkbox = currentQuestion.querySelector(`input[value="${value}"]`);
        if (checkbox) {
          checkbox.checked = true;
        }
      });
    }
  } else if (hasForm) {
    // Restore form values
    if (typeof savedSelection === 'object') {
      const nameInput = document.getElementById('name');
      const emailInput = document.getElementById('email');
      const phoneInput = document.getElementById('phone');
      const companyInput = document.getElementById('company');
      
      if (nameInput && savedSelection.name) nameInput.value = savedSelection.name;
      if (emailInput && savedSelection.email) emailInput.value = savedSelection.email;
      if (phoneInput && savedSelection.phone) phoneInput.value = savedSelection.phone;
      if (companyInput && savedSelection.company) companyInput.value = savedSelection.company;
    }
  } else {
    // Restore button selection
    const button = currentQuestion.querySelector(`.option-btn[data-value="${savedSelection}"]`);
    if (button) {
      button.classList.add('selected');
    }
  }
}

function initializeQuestionnaire() {
  const currentQuestion = document.querySelector(`.question-step[data-step="${currentStep}"]`);
  if (!currentQuestion) return;
  
  // Set up event listeners based on question type
  const hasCheckboxes = currentQuestion.querySelector('.checkbox-section');
  const hasForm = currentQuestion.querySelector('.form-section');
  
  if (hasForm) {
    setupFormListeners();
  } else if (hasCheckboxes) {
    setupCheckboxListeners();
  } else {
    setupButtonListeners();
  }
  
  // Set up next button
  const nextButton = document.getElementById('next-btn');
  // Remove existing listeners to avoid duplicates
  const newNextButton = nextButton.cloneNode(true);
  nextButton.parentNode.replaceChild(newNextButton, nextButton);
  newNextButton.addEventListener('click', handleNextStep);
  
  // Set up previous button
  const prevButton = document.getElementById('prev-btn');
  const newPrevButton = prevButton.cloneNode(true);
  prevButton.parentNode.replaceChild(newPrevButton, prevButton);
  newPrevButton.addEventListener('click', handlePreviousStep);
  
  // Show/hide previous button
  updatePreviousButtonVisibility();
  // Update next button visibility and state
  updateNextButtonState();
  updateNextButtonText();
}

function setupButtonListeners() {
  const currentQuestion = document.querySelector(`.question-step[data-step="${currentStep}"]`);
  if (!currentQuestion) return;
  
  const optionButtons = currentQuestion.querySelectorAll('.option-btn');
  optionButtons.forEach(button => {
    // Remove existing listeners
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);
    
    newButton.addEventListener('click', () => {
      handleOptionSelect(newButton);
    });
  });
}

function setupCheckboxListeners() {
  const currentQuestion = document.querySelector(`.question-step[data-step="${currentStep}"]`);
  if (!currentQuestion) return;
  
  const checkboxes = currentQuestion.querySelectorAll('.checkbox-option input');
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      handleCheckboxChange();
    });
  });
}

function setupFormListeners() {
  const formInputs = document.querySelectorAll('.form-group input');
  formInputs.forEach(input => {
    input.addEventListener('input', () => {
      handleFormChange();
    });
  });
}

function handleOptionSelect(button) {
  const currentQuestion = document.querySelector(`.question-step[data-step="${currentStep}"]`);
  if (!currentQuestion) return;
  
  // Remove selected class from all options in current question
  const allOptions = currentQuestion.querySelectorAll('.option-btn');
  allOptions.forEach(btn => btn.classList.remove('selected'));
  
  // Add selected class to clicked option
  button.classList.add('selected');
  
  // Save selection
  selectedOptions[currentStep] = button.dataset.value;
  
  updateNextButtonState();
  
  // Auto-advance to next step (except for step 7 which is the form)
  if (currentStep < 7) {
    // Small delay to show the selection before transitioning
    setTimeout(() => {
      handleNextStep();
    }, 300);
  }
}

function handleCheckboxChange() {
  const currentQuestion = document.querySelector(`.question-step[data-step="${currentStep}"]`);
  if (!currentQuestion) return;
  
  const checkboxes = currentQuestion.querySelectorAll('.checkbox-option input:checked');
  const selectedValues = Array.from(checkboxes).map(cb => cb.value);
  
  if (selectedValues.length > 0) {
    selectedOptions[currentStep] = selectedValues;
  } else {
    delete selectedOptions[currentStep];
  }
  
  updateNextButtonState();
  
  // Auto-advance to next step if at least one checkbox is selected (except for step 7)
  if (currentStep < 7 && selectedValues.length > 0) {
    // Small delay to show the selection before transitioning
    setTimeout(() => {
      handleNextStep();
    }, 300);
  }
}

function handleFormChange() {
  const name = document.getElementById('name')?.value.trim();
  const email = document.getElementById('email')?.value.trim();
  const phone = document.getElementById('phone')?.value.trim();
  const company = document.getElementById('company')?.value.trim();
  
  if (name && email && phone) {
    selectedOptions[currentStep] = {
      name,
      email,
      phone,
      company: company || ''
    };
  } else {
    delete selectedOptions[currentStep];
  }
  
  updateNextButtonState();
}

function updateNextButtonState() {
  const nextButton = document.getElementById('next-btn');
  const currentQuestion = document.querySelector(`.question-step[data-step="${currentStep}"]`);
  if (!currentQuestion) return;
  
  // Only show next button on step 7 (form step)
  if (currentStep === 7) {
    nextButton.style.display = 'block';
    const hasForm = currentQuestion.querySelector('.form-section');
    
    if (hasForm) {
      const name = document.getElementById('name')?.value.trim();
      const email = document.getElementById('email')?.value.trim();
      const phone = document.getElementById('phone')?.value.trim();
      nextButton.disabled = !(name && email && phone);
    } else if (currentQuestion.querySelector('.checkbox-section')) {
      const checked = currentQuestion.querySelectorAll('.checkbox-option input:checked');
      nextButton.disabled = checked.length === 0;
    } else {
      const selected = currentQuestion.querySelector('.option-btn.selected');
      nextButton.disabled = !selected;
    }
  } else {
    // Hide next button for steps 1-6
    nextButton.style.display = 'none';
  }
}

function handleNextStep() {
  const currentQuestion = document.querySelector(`.question-step[data-step="${currentStep}"]`);
  if (!currentQuestion) return;
  
  const hasForm = currentQuestion.querySelector('.form-section');
  
  // Validate form if it's the last step
  if (hasForm) {
    const name = document.getElementById('name')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    const phone = document.getElementById('phone')?.value.trim();
    
    if (!name || !email || !phone) {
      alert('必須項目を入力してください');
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('正しいメールアドレスを入力してください');
      return;
    }
  }
  
  // Move to next step
  if (currentStep < totalSteps) {
    currentStep++;
    updateProgress();
    showQuestion(currentStep, 'forward');
    // Delay initialization to allow transition to complete
    setTimeout(() => {
      initializeQuestionnaire();
    }, 400);
  } else {
    // All steps completed
    handleCompletion();
  }
}

function updatePreviousButtonVisibility() {
  const prevButton = document.getElementById('prev-btn');
  if (currentStep > 1) {
    prevButton.style.display = 'block';
  } else {
    prevButton.style.display = 'none';
  }
}

function handlePreviousStep() {
  if (currentStep > 1) {
    currentStep--;
    updateProgress();
    showQuestion(currentStep, 'backward');
    // Delay initialization to allow transition to complete
    setTimeout(() => {
      initializeQuestionnaire();
    }, 400);
  }
}

function updateProgress() {
  // Update step number
  document.getElementById('current-step').textContent = currentStep;
  
  // Update progress bar
  const progressSegments = document.querySelectorAll('.progress-segment');
  progressSegments.forEach((segment, index) => {
    if (index < currentStep) {
      segment.classList.add('filled');
    } else {
      segment.classList.remove('filled');
    }
  });
  
  // Update previous button visibility
  updatePreviousButtonVisibility();
  
  // Update next button visibility, state, and text
  updateNextButtonState();
  updateNextButtonText();
}

function updateNextButtonText() {
  const nextButton = document.getElementById('next-btn');
  if (currentStep === 7) {
    nextButton.textContent = '送信する';
  } else {
    // Button is hidden for steps 1-6, but keep text for consistency
    nextButton.textContent = '次へ進む';
  }
}

async function handleCompletion() {
  const formData = selectedOptions[7]; // Step 7 contains form data
  const rowData = [
    new Date().toLocaleString('ja-JP'), // Timestamp
    selectedOptions[1] || '', // Question 1
    selectedOptions[2] || '', // Question 2
    selectedOptions[3] || '', // Question 3
    selectedOptions[4] || '', // Question 4
    selectedOptions[5] || '', // Question 5
    selectedOptions[6] || '', // Question 6
    formData?.name || '', // Name
    formData?.email || '', // Email
    formData?.phone || '', // Phone
    formData?.company || '', // Company
    referrerUrl.replace('index.html', 'thanks.html') || '' // Referrer URL with parameters, replacing index.html with thanks.html
  ];

  // Google Apps Script Web App URL
  // Get it from: Deploy > Manage deployments > (your deployment) > Copy URL
  const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_SCRIPT_URL_HERE';
  
  try {
    // Show loading state
    const nextButton = document.getElementById('next-btn');
    nextButton.disabled = true;
    nextButton.textContent = '送信中...';

    // Send data without Content-Type header to avoid CORS preflight
    // Google Apps Script will parse JSON from postData.contents automatically
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'cors',
      body: JSON.stringify({ data: rowData }),
      redirect: 'follow'
    });
    
    const responseText = await response.text();
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Parse JSON response
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', responseText);
      if (response.ok) {
        result = { success: true, message: 'Data submitted successfully' };
      } else {
        throw new Error('Invalid response format from server');
      }
    }
    
    if (result.success) {
      // Pass URL parameters to thank you page
      const thankYouUrl = new URL('thanks.html', window.location.origin);
      // Copy all URL parameters to thank you page
      urlParams.forEach((value, key) => {
        thankYouUrl.searchParams.append(key, value);
      });
      window.location.href = thankYouUrl.toString();
    } else {
      throw new Error(result.error || 'Unknown error');
    }
    
  } catch (error) {
    console.error('Error submitting data:', error);
    alert('送信に失敗しました。もう一度お試しください。\n\nエラー: ' + error.message);
    
    const nextButton = document.getElementById('next-btn');
    nextButton.disabled = false;
    nextButton.textContent = '送信する';
  }
}
