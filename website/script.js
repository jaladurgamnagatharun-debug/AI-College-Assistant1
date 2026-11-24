/**
 * ============================================================
 * EduAI - AI College Assistant
 * script.js
 *
 * AWS SERVICES:
 * - Amazon Cognito
 * - API Gateway
 * - AWS Lambda
 * - Amazon Bedrock
 * - Bedrock Knowledge Base
 * - Amazon DynamoDB
 * ============================================================
 */


/* ============================================================
   1. AWS CONFIGURATION
   ============================================================ */

// ---------- Amazon Cognito ----------
const poolData = {
    UserPoolId: "ap-south-1_FqDPJVI29",
    ClientId: "1ok8jho3917fom0j9ako4ds92k"
};

const userPool =
    new AmazonCognitoIdentity.CognitoUserPool(poolData);


// ---------- API Gateway ----------
const API_BASE_URL =
    "https://uyytcks970.execute-api.ap-south-1.amazonaws.com";

const ASK_API_URL =
    `${API_BASE_URL}/ask`;

const HISTORY_API_URL =
    `${API_BASE_URL}/history`;


// ---------- Bedrock Knowledge Base ----------
const KNOWLEDGE_BASE_ID = "7ENYUIY431";


// ---------- AWS Region ----------
const AWS_REGION = "ap-south-1";


/* ============================================================
   2. DOM ELEMENTS
   ============================================================ */

// ---------- Login ----------
const loginPage =
    document.getElementById("loginPage");

const loginEmailInput =
    document.getElementById("loginEmail");

const loginPasswordInput =
    document.getElementById("loginPassword");

const customLoginButton =
    document.getElementById("customLoginButton");
// Forgot Password elements
const forgotPasswordPage = document.getElementById("forgotPasswordPage");
const forgotPasswordLink = document.getElementById("forgotPasswordLink");

const resetEmailInput = document.getElementById("resetEmail");
const sendResetCodeButton = document.getElementById("sendResetCodeButton");

const resetPasswordSection =
    document.getElementById("resetPasswordSection");

const resetCodeInput =
    document.getElementById("resetCode");

const newPasswordInput =
    document.getElementById("newPassword");

const confirmPasswordInput =
    document.getElementById("confirmPassword");

const resetPasswordButton =
    document.getElementById("resetPasswordButton");

const backToLogin =
    document.getElementById("backToLogin");

// Cognito user used during password reset
let resetCognitoUser = null;


// ---------- Application ----------
const appLayout =
    document.getElementById("appLayout");


// ---------- Dashboard ----------
const dashboardPage =
    document.getElementById("dashboardPage");


// ---------- Subjects ----------
const subjectsPage =
    document.getElementById("subjectsPage");

const cnMaterialsPage =
    document.getElementById("cnMaterialsPage");

const cnMaterialsButton =
    document.getElementById("cnMaterialsButton");

const cnUnit1Button =
    document.getElementById("cnUnit1Button");


// ---------- AI Chat ----------
const chatPage =
    document.getElementById("chatPage");

const chatMessages =
    document.getElementById("chatMessages");

const questionInput =
    document.getElementById("questionInput");

const sendButton =
    document.getElementById("sendButton");


// ---------- Chat History ----------
const chatHistoryPage =
    document.getElementById("chatHistoryPage");

const historyContainer =
    document.getElementById("historyContainer");

const chatHistoryLink =
    document.getElementById("chatHistoryLink");


// ---------- Subjects navigation ----------
const subjectsLink =
    document.getElementById("subjectsLink");


// ---------- Logout ----------
const logoutButton =
    document.getElementById("logoutButton");


/* ============================================================
   3. PAGE NAVIGATION
   ============================================================ */

/*
   Your HTML contains:
   dashboardPage
   subjectsPage
   cnMaterialsPage
   chatPage
   chatHistoryPage

   IMPORTANT:
   cnMaterialsPage is inside subjectsPage.

   Therefore, when CN Materials is opened,
   subjectsPage must also remain visible.
*/

function showPage(pageId) {

    // Hide normal pages
    if (dashboardPage) {
        dashboardPage.style.display = "none";
    }

    if (subjectsPage) {
        subjectsPage.style.display = "none";
    }

    if (chatPage) {
        chatPage.style.display = "none";
    }

    if (chatHistoryPage) {
        chatHistoryPage.style.display = "none";
    }


    // CN materials is nested inside Subjects
    if (cnMaterialsPage) {
        cnMaterialsPage.style.display = "none";
    }


    // Show requested page
    if (pageId === "dashboardPage") {

        if (dashboardPage) {
            dashboardPage.style.display = "block";
        }

    }

    else if (pageId === "subjectsPage") {

        if (subjectsPage) {
            subjectsPage.style.display = "block";
        }

    }

    else if (pageId === "cnMaterialsPage") {

        // Parent must be visible
        if (subjectsPage) {
            subjectsPage.style.display = "block";
        }

        if (cnMaterialsPage) {
            cnMaterialsPage.style.display = "block";
        }

    }

    else if (pageId === "chatPage") {

        if (chatPage) {
            chatPage.style.display = "block";
        }

    }

    else if (pageId === "chatHistoryPage") {

        if (chatHistoryPage) {
            chatHistoryPage.style.display = "block";
        }

        loadChatHistory();
    }
}


// Make showPage available to inline HTML onclick
window.showPage = showPage;


/* ============================================================
   4. SIDEBAR NAVIGATION
   ============================================================ */


/*
   Dashboard link
   Your HTML doesn't have an ID for Dashboard,
   so we find it using its text.
*/

function setupSidebarNavigation() {

    const sidebarLinks =
        document.querySelectorAll(".sidebar a, .sidebar button");

    sidebarLinks.forEach(link => {

        const text =
            link.textContent.trim().toLowerCase();


        // Dashboard
        if (text.includes("dashboard")) {

            link.addEventListener("click", function (e) {

                e.preventDefault();

                showPage("dashboardPage");

            });

        }


        // AI Chat
        else if (
            text.includes("ai chat") ||
            text.includes("ai assistant")
        ) {

            link.addEventListener("click", function (e) {

                e.preventDefault();

                showPage("chatPage");

            });

        }

    });


    // Subjects
    if (subjectsLink) {

        subjectsLink.addEventListener("click", function (e) {

            e.preventDefault();

            showPage("subjectsPage");

        });

    }


    // Chat History
    if (chatHistoryLink) {

        chatHistoryLink.addEventListener("click", function (e) {

            e.preventDefault();

            showPage("chatHistoryPage");

        });

    }


    // CN Materials
    if (cnMaterialsButton) {

        cnMaterialsButton.addEventListener("click", function () {

            showPage("cnMaterialsPage");

        });

    }


    // CN Unit 1
    if (cnUnit1Button) {

        cnUnit1Button.addEventListener("click", function () {

            alert(
                "Computer Networks Unit 1 materials are available in the AI College Assistant Knowledge Base."
            );

        });

    }
}


/* ============================================================
   5. AUTHENTICATION - AMAZON COGNITO
   ============================================================ */


/*
   Check whether the user already has a valid Cognito session.
*/

function checkAuthState() {

    try {

        const cognitoUser =
            userPool.getCurrentUser();


        if (!cognitoUser) {

            showLoggedOutUI();

            return;
        }


        cognitoUser.getSession(function (err, session) {

            if (err || !session || !session.isValid()) {

                showLoggedOutUI();

                return;
            }


            showLoggedInUI(
                cognitoUser.getUsername()
            );

        });

    }

    catch (error) {

        console.error(
            "Authentication check error:",
            error
        );

        showLoggedOutUI();
    }
}


/* ---------- Logged-in UI ---------- */

function showLoggedInUI(username) {

    if (loginPage) {
        loginPage.style.display = "none";
    }

    if (appLayout) {
        appLayout.style.display = "flex";
    }

    // Open Dashboard after login
    showPage("dashboardPage");

    console.log(
        "Logged in user:",
        username
    );
}


/* ---------- Logged-out UI ---------- */

function showLoggedOutUI() {

    if (loginPage) {
        loginPage.style.display = "flex";
    }

    if (appLayout) {
        appLayout.style.display = "none";
    }
}


/* ============================================================
   6. COGNITO LOGIN
   ============================================================ */

function handleLogin() {

    if (!loginEmailInput || !loginPasswordInput) {

        console.error(
            "Login input elements were not found."
        );

        return;
    }


    const email =
        loginEmailInput.value.trim();

    const password =
        loginPasswordInput.value;


    // Validate
    if (!email || !password) {

        alert(
            "Please enter both email and password."
        );

        return;
    }


    // Disable login button
    if (customLoginButton) {

        customLoginButton.disabled = true;

        customLoginButton.innerHTML =
            "Logging in...";

    }


    /*
       Cognito Authentication Details
    */

    const authenticationDetails =
        new AmazonCognitoIdentity.AuthenticationDetails({

            Username: email,

            Password: password

        });


    /*
       Cognito User
    */

    const userData = {

        Username: email,

        Pool: userPool

    };


    const cognitoUser =
        new AmazonCognitoIdentity.CognitoUser(
            userData
        );


    /*
       Authenticate
    */

    cognitoUser.authenticateUser(
        authenticationDetails,
        {

            // ---------- SUCCESS ----------
            onSuccess: function (result) {

                console.log(
                    "Cognito login successful."
                );


                /*
                   Tokens are automatically managed
                   by amazon-cognito-identity-js.
                */

                if (customLoginButton) {

                    customLoginButton.disabled =
                        false;

                    customLoginButton.innerHTML =
                        'Login <span>→</span>';

                }


                // Remember me handling
                const rememberMeCheckbox = document.getElementById("rememberMe");
                if (rememberMeCheckbox && rememberMeCheckbox.checked) {
                    localStorage.setItem("eduai_remember_email", email);
                } else {
                    localStorage.removeItem("eduai_remember_email");
                }

                // Open application
                showLoggedInUI(email);

            },


            // ---------- FAILURE ----------
            onFailure: function (err) {

                console.error(
                    "Cognito login failed:",
                    err
                );


                if (customLoginButton) {

                    customLoginButton.disabled =
                        false;

                    customLoginButton.innerHTML =
                        'Login <span>→</span>';

                }


                alert(
                    err.message ||
                    "Login failed. Please check your email and password."
                );

            },


            // ---------- NEW PASSWORD ----------
            newPasswordRequired:
                function () {

                    if (customLoginButton) {

                        customLoginButton.disabled =
                            false;

                        customLoginButton.innerHTML =
                            'Login <span>→</span>';

                    }


                    alert(
                        "A new password is required. Please complete the password setup in Cognito."
                    );

                }

        }
    );
}


/* ============================================================
   7. LOGOUT
   ============================================================ */

function handleLogout() {

    try {

        const cognitoUser =
            userPool.getCurrentUser();


        if (cognitoUser) {

            cognitoUser.signOut();

        }


        // Clear application tokens if present
        localStorage.removeItem("access_token");
        localStorage.removeItem("id_token");
        localStorage.removeItem("refresh_token");


        showLoggedOutUI();


        // Clear login fields
        if (loginPasswordInput) {

            loginPasswordInput.value = "";

        }


        console.log(
            "User logged out."
        );

    }

    catch (error) {

        console.error(
            "Logout error:",
            error
        );

    }
}


/* ---------- Login button ---------- */

if (customLoginButton) {

    customLoginButton.addEventListener(
        "click",
        handleLogin
    );

}


/* ---------- Enter key on password ---------- */

if (loginPasswordInput) {

    loginPasswordInput.addEventListener(
        "keydown",
        function (e) {

            if (e.key === "Enter") {

                e.preventDefault();

                handleLogin();

            }

        }
    );

}
 
/* ---------- Password Visibility Toggle ---------- */
const togglePasswordVisibility = document.getElementById("togglePasswordVisibility");
if (togglePasswordVisibility && loginPasswordInput) {
    togglePasswordVisibility.addEventListener("click", function () {
        const isPassword = loginPasswordInput.type === "password";
        loginPasswordInput.type = isPassword ? "text" : "password";
        togglePasswordVisibility.setAttribute("aria-label", isPassword ? "Hide password" : "Show password");
        togglePasswordVisibility.innerHTML = isPassword ? `
            <svg class="eye-off-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                <line x1="2" x2="22" y1="2" y2="22"/>
            </svg>
        ` : `
            <svg class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                <circle cx="12" cy="12" r="3"/>
            </svg>
        `;
    });
}

/* ---------- Prefill Remembered Email ---------- */
const rememberMeCheckbox = document.getElementById("rememberMe");
const savedRememberEmail = localStorage.getItem("eduai_remember_email");
if (savedRememberEmail && loginEmailInput) {
    loginEmailInput.value = savedRememberEmail;
    if (rememberMeCheckbox) {
        rememberMeCheckbox.checked = true;
    }
}

/* ---------- Google Login Handler ---------- */
const googleLoginButton = document.getElementById("googleLoginButton");
if (googleLoginButton) {
    googleLoginButton.addEventListener("click", function () {
        alert("Google federated sign-in is managed via your AWS Cognito User Pool Identity Providers.");
    });
}


/* ---------- Logout button ---------- */

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        function (e) {

            e.preventDefault();

            handleLogout();

        }
    );

}


/* ============================================================
   8. GET COGNITO ACCESS TOKEN
   ============================================================ */
function getIdToken() {

    return new Promise(function (resolve, reject) {

        const cognitoUser =
            userPool.getCurrentUser();

        if (!cognitoUser) {
            reject(
                new Error("User is not logged in.")
            );
            return;
        }

        cognitoUser.getSession(
            function (err, session) {

                if (err) {
                    reject(err);
                    return;
                }

                if (!session || !session.isValid()) {
                    reject(
                        new Error(
                            "Cognito session has expired."
                        )
                    );
                    return;
                }

                const idToken =
                    session
                        .getIdToken()
                        .getJwtToken();

                resolve(idToken);
            }
        );
    });
}



/* ============================================================
   9. AI CHAT UI
   ============================================================ */

function appendMessage(
    text,
    isUser = false
) {

    if (!chatMessages) {

        return;
    }


    const messageWrapper =
        document.createElement("div");


    messageWrapper.className =
        `message ${
            isUser
                ? "user-message"
                : "ai-message"
        }`;


    // Avatar
    const avatar =
        document.createElement("div");

    avatar.className =
        "message-avatar";

    avatar.textContent =
        isUser ? "👤" : "🤖";


    // Content
    const content =
        document.createElement("div");

    content.className =
        "message-content";


    // Author
    const author =
        document.createElement("strong");

    author.textContent =
        isUser
            ? "You"
            : "AI Assistant";


    // Message
    const body =
        document.createElement("p");

    body.textContent = text;


    content.appendChild(author);

    content.appendChild(body);

    messageWrapper.appendChild(avatar);

    messageWrapper.appendChild(content);


    chatMessages.appendChild(
        messageWrapper
    );


    chatMessages.scrollTop =
        chatMessages.scrollHeight;
}


/* ============================================================
   10. AI CHAT - API GATEWAY → LAMBDA → BEDROCK
   ============================================================ */

async function handleSendMessage() {

    if (!questionInput) {

        return;
    }


    const question =
        questionInput.value.trim();


    if (!question) {

        return;
    }


    // Display user question
    appendMessage(
        question,
        true
    );


    // Clear input
    questionInput.value = "";


    // Disable send button
    if (sendButton) {

        sendButton.disabled = true;

    }


    // Typing indicator
    const typingId =
        "typing-" + Date.now();


    const typingEl =
        document.createElement("div");


    typingEl.className =
        "message ai-message";


    typingEl.id =
        typingId;


    typingEl.innerHTML = `
        <div class="message-avatar">🤖</div>

        <div class="message-content">
            <strong>AI Assistant</strong>
            <p>Thinking...</p>
        </div>
    `;


    if (chatMessages) {

        chatMessages.appendChild(
            typingEl
        );

        chatMessages.scrollTop =
            chatMessages.scrollHeight;

    }


    try {

        /*
           Get Cognito access token
        */

      const idToken =
    await getIdToken();


        /*
           Send question to API Gateway
        */

        console.log(
            "Sending question to:",
            ASK_API_URL
        );


        const response =
            await fetch(
                ASK_API_URL,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",
                    "Authorization":
                           `Bearer ${idToken}`

                    },

                    body:
                        JSON.stringify({

                            question:
                                question

                        })

                }
            );


        /*
           Remove typing indicator
        */

        const typingElement =
            document.getElementById(
                typingId
            );

        if (typingElement) {

            typingElement.remove();

        }


        /*
           Handle HTTP errors
        */

        if (!response.ok) {

           if (response.status === 401) {

    appendMessage(
        "API Gateway rejected the authentication token. Please check the Cognito authorizer configuration.",
        false
    );

    console.error(
        "API Gateway returned 401 Unauthorized."
    );

    return;
}


            if (response.status === 403) {

                appendMessage(
                    "You are not authorized to access the AI Assistant.",
                    false
                );

                return;
            }


            throw new Error(
                `API request failed: ${response.status}`
            );

        }


        /*
           Read API response
        */

        const data =
            await response.json();


        console.log(
            "AWS API response:",
            data
        );


        /*
           API Gateway + Lambda usually returns:

           {
               "answer": "..."
           }

           But this also supports:

           {
               "response": "..."
           }

           or

           {
               "body": "{\"answer\":\"...\"}"
           }
        */

        let answer =
            data.answer ||
            data.response ||
            data.message;


        // If API Gateway returns stringified body
        if (!answer && data.body) {

            try {

                const bodyData =
                    typeof data.body === "string"
                        ? JSON.parse(data.body)
                        : data.body;


                answer =
                    bodyData.answer ||
                    bodyData.response ||
                    bodyData.message;

            }

            catch (parseError) {

                console.error(
                    "Could not parse API body:",
                    parseError
                );

            }

        }


        /*
           Final fallback
        */

        if (!answer) {

            answer =
                "The AI received your question, but no answer was returned from the backend.";

        }


        /*
           Display AI answer
        */

        appendMessage(
            answer,
            false
        );

    }

    catch (error) {

        console.error(
            "AI request error:",
            error
        );


        // Remove typing
        const typingElement =
            document.getElementById(
                typingId
            );

        if (typingElement) {

            typingElement.remove();

        }


        /*
           Display useful error
        */

        appendMessage(
            "Unable to connect to the AI Assistant. Please check your AWS API Gateway, Lambda, or login session.",
            false
        );

    }

    finally {

        // Enable send button
        if (sendButton) {

            sendButton.disabled = false;

        }

    }

}


/* ============================================================
   11. SEND BUTTON
   ============================================================ */

if (sendButton) {

    sendButton.addEventListener(
        "click",
        handleSendMessage
    );

}


/* ============================================================
   12. ENTER KEY → SEND QUESTION
   ============================================================ */

if (questionInput) {

    questionInput.addEventListener(
        "keydown",
        function (e) {

            if (e.key === "Enter") {

                e.preventDefault();

                handleSendMessage();

            }

        }
    );

}


/* ============================================================
   13. DASHBOARD → AI CHAT
   ============================================================ */

/*
   Your Dashboard contains buttons that use:

   onclick="showPage('chatPage')"

   Because showPage() is attached to window,
   those buttons will continue to work.
*/


/* ============================================================
   14. CHAT HISTORY
   ============================================================ */

async function loadChatHistory() {

    if (!historyContainer) {

        return;
    }


    historyContainer.innerHTML =
        "<p>Loading chat history...</p>";


    try {

        /*
           Get Cognito token
        */
const idToken =
    await getIdToken();


        /*
           Call:

           GET /history
        */

        const response =
            await fetch(
                HISTORY_API_URL,
                {

                    method: "GET",

                    headers: {

                       "Authorization":
    `Bearer ${idToken}`,

                        "Content-Type":
                            "application/json"

                    }

                }
            );


        if (!response.ok) {

            if (response.status === 401) {

                historyContainer.innerHTML =
                    "<p>Your login session has expired. Please login again.</p>";

                handleLogout();

                return;
            }


            throw new Error(
                `History API failed: ${response.status}`
            );

        }


        const data =
            await response.json();


        console.log(
            "Chat history:",
            data
        );


        /*
           Support several possible Lambda response formats
        */

        let history =
            data.history ||
            data.items ||
            data.chatHistory ||
            data;


        /*
           If body is stringified JSON
        */

        if (
            data.body &&
            typeof data.body === "string"
        ) {

            try {

                const bodyData =
                    JSON.parse(data.body);


                history =
                    bodyData.history ||
                    bodyData.items ||
                    bodyData.chatHistory ||
                    bodyData;

            }

            catch (error) {

                console.error(
                    "History body parsing error:",
                    error
                );

            }

        }


        /*
           Ensure array
        */

        if (!Array.isArray(history)) {

            history = [];

        }


        /*
           No history
        */

        if (history.length === 0) {

            historyContainer.innerHTML =
                "<p>No previous chat history found.</p>";

            return;

        }


        /*
           Clear container
        */

        historyContainer.innerHTML = "";


        const list =
            document.createElement("ul");


        list.style.listStyle =
            "none";

        list.style.padding =
            "0";


        /*
           Display every history item
        */

        history.forEach(function (item) {

            const li =
                document.createElement("li");


            li.style.padding =
                "15px 18px";


            li.style.marginBottom =
                "10px";


            li.style.background =
                "#f5f7fb";


            li.style.borderRadius =
                "10px";


            /*
               Support different DynamoDB field names
            */

            const question =
                item.question ||
                item.query ||
                item.prompt ||
                "Previous question";


            const answer =
                item.answer ||
                item.response ||
                "";


            const timestamp =
                item.timestamp ||
                item.date ||
                "";


            li.innerHTML = `
                <strong>${escapeHTML(question)}</strong>

                ${
                    timestamp
                        ? `<br>
                           <small>
                               ${escapeHTML(String(timestamp))}
                           </small>`
                        : ""
                }

                ${
                    answer
                        ? `<p style="margin-top:8px;">
                               ${escapeHTML(answer)}
                           </p>`
                        : ""
                }
            `;


            list.appendChild(li);

        });


        historyContainer.appendChild(
            list
        );

    }

    catch (error) {

        console.error(
            "Chat history error:",
            error
        );


        historyContainer.innerHTML =
            "<p>Unable to load chat history. Please try again.</p>";

    }

}


/* ============================================================
   15. HTML ESCAPE
   ============================================================ */

function escapeHTML(value) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );
}


/* ============================================================
   16. INITIALIZATION
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "EduAI application starting..."
        );


        console.log(
            "AWS Region:",
            AWS_REGION
        );


        console.log(
            "Cognito User Pool:",
            poolData.UserPoolId
        );


        console.log(
            "API Gateway:",
            API_BASE_URL
        );


        console.log(
            "Bedrock Knowledge Base:",
            KNOWLEDGE_BASE_ID
        );


        /*
           Setup navigation
        */

        setupSidebarNavigation();


        /*
           Check Cognito login
        */

        checkAuthState();

    }
);
// =====================================================
// FORGOT PASSWORD - RESET PASSWORD
// =====================================================

if (resetPasswordButton) {
    resetPasswordButton.addEventListener("click", function () {

        const code = resetCodeInput.value.trim();
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (!code) {
            alert("Please enter the OTP.");
            return;
        }

        if (!newPassword) {
            alert("Please enter a new password.");
            return;
        }

        if (newPassword !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        if (!resetCognitoUser) {
            alert("Please request an OTP first.");
            return;
        }

        resetPasswordButton.disabled = true;
        resetPasswordButton.innerHTML = "Resetting...";

        resetCognitoUser.confirmPassword(
            code,
            newPassword,
            {

                onSuccess: function () {

                    alert(
                        "Password reset successful! Please login with your new password."
                    );

                    // Clear reset fields
                    resetEmailInput.value = "";
                    resetCodeInput.value = "";
                    newPasswordInput.value = "";
                    confirmPasswordInput.value = "";

                    resetPasswordSection.style.display = "none";
                    sendResetCodeButton.style.display = "block";

                    sendResetCodeButton.disabled = false;
                    sendResetCodeButton.innerHTML =
                        'Send OTP <span>→</span>';

                    resetPasswordButton.disabled = false;
                    resetPasswordButton.innerHTML =
                        'Reset Password <span>✓</span>';

                    // Return to login page
                    forgotPasswordPage.style.display = "none";
                    loginPage.style.display = "flex";

                    resetCognitoUser = null;
                },

                onFailure: function (err) {

                    console.error(
                        "Password reset error:",
                        err
                    );

                    alert(
                        err.message ||
                        "Password reset failed. Please check the OTP and password."
                    );

                    resetPasswordButton.disabled = false;
                    resetPasswordButton.innerHTML =
                        'Reset Password <span>✓</span>';
                }
            }
        );
    });
}
// =====================================================
// FORGOT PASSWORD - SEND OTP
// =====================================================

if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener("click", function (e) {
        e.preventDefault();

        loginPage.style.display = "none";
        forgotPasswordPage.style.display = "flex";

        resetEmailInput.value = "";
        resetPasswordSection.style.display = "none";
        sendResetCodeButton.style.display = "block";
    });
}

if (sendResetCodeButton) {
    sendResetCodeButton.addEventListener("click", function () {

        const email = resetEmailInput.value.trim();

        if (!email) {
            alert("Please enter your registered email.");
            return;
        }

        resetCognitoUser = new AmazonCognitoIdentity.CognitoUser({
            Username: email,
            Pool: userPool
        });

        sendResetCodeButton.disabled = true;
        sendResetCodeButton.innerHTML = "Sending OTP...";

        resetCognitoUser.forgotPassword({

            onSuccess: function () {
                alert("OTP sent successfully to your email.");

                resetPasswordSection.style.display = "block";
                sendResetCodeButton.style.display = "none";
            },

            onFailure: function (err) {

                console.error("Forgot password error:", err);

                alert(
                    err.message ||
                    "Unable to send OTP. Please check your email."
                );

                sendResetCodeButton.disabled = false;
                sendResetCodeButton.innerHTML =
                    'Send OTP <span>→</span>';
            },

            inputVerificationCode: function (data) {

                console.log("Verification code sent:", data);

                resetPasswordSection.style.display = "block";
                sendResetCodeButton.style.display = "none";

                alert(
                    "OTP has been sent to your registered email."
                );
            }
        });
    });
}
// =====================================================
// BACK TO LOGIN
// =====================================================

if (backToLogin) {
    backToLogin.addEventListener("click", function (e) {

        e.preventDefault();

        forgotPasswordPage.style.display = "none";
        loginPage.style.display = "flex";

        resetPasswordSection.style.display = "none";
        sendResetCodeButton.style.display = "block";

        sendResetCodeButton.disabled = false;
        sendResetCodeButton.innerHTML =
            'Send OTP <span>→</span>';
    });
}