const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const signupBtn = document.getElementById('signup-btn');
const errorMsg = document.getElementById('error-msg');

async function signup() {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
        errorMsg.textContent = 'Please enter both email and password';
        return;
    }
    
    signupBtn.disabled = true;
    errorMsg.textContent = '';
    try {
        const response = await fetch('/auth/signup', {
            method: 'POST',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify({ email, password })
        })

        if (response.ok) {
            window.location.href = '/login.html';
        } else {
            const error = await response.json();
            if (error.message === 'Validation Error' && Array.isArray(error.errors)) {
                errorMsg.textContent = error.errors.join(', ');
            } else {
                errorMsg.textContent = error.message;
            }
        }
    } catch (error) {
        console.log(error)
        errorMsg.textContent = 'Something went wrong! Try Again!'
    }
    finally {
        signupBtn.disabled = false;
    }
}


signupBtn.addEventListener('click', signup)