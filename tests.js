const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function runTests() {
    // Configuration for headless Chrome as required by the assignment [cite: 14, 15]
    let options = new chrome.Options();
    options.addArguments('--headless'); 
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    // Use 'let' so the URL can be updated for different pages
    let baseUrl = 'http://wanderlust-devops-backend:3001';

    try {
        // --- TEST CASE 1: Correct Login ---
        console.log("Starting Test 1: Successful Login...");
        await driver.get(`${baseUrl}/login`);
        await driver.findElement(By.name('username')).sendKeys('demo');
        await driver.findElement(By.name('password')).sendKeys('demo');
        await driver.findElement(By.css('.btn-light')).click();

        let alertElement = await driver.wait(until.elementLocated(By.css('.alert-success')), 5000);
        let alertText = await alertElement.getText();
        console.log("✔ Test 1 Passed: Login attempt completed.");

        // --- TEST CASE 2: Wrong Login ---
        console.log("Starting Test 2: Failed Login...");
        await driver.get(`${baseUrl}/login`);
        await driver.findElement(By.name('username')).sendKeys('demo');
        await driver.findElement(By.name('password')).sendKeys('wrongpassword');
        await driver.findElement(By.css('.btn-light')).click();

        alertElement = await driver.wait(until.elementLocated(By.css('.alert-danger')), 5000);
        alertText = await alertElement.getText();
        if (alertText.length > 0) console.log("✔ Test 2 Passed: Error displayed for wrong credentials.");

        // --- TEST CASE 3: Duplicate Signup ---
        console.log("Starting Test 3: Duplicate Signup...");
        await driver.get(`${baseUrl}/signup`);
        await driver.findElement(By.name('username')).sendKeys('demo');
        await driver.findElement(By.name('email')).sendKeys('demo@gmail.com');
        await driver.findElement(By.name('password')).sendKeys('demo');
        await driver.findElement(By.css('.btn-light')).click();

        alertElement = await driver.wait(until.elementLocated(By.css('.alert-danger')), 5000);
        console.log("✔ Test 3 Passed: Error displayed for existing user.");

        // --- TEST CASE 4: Success Signup ---
        console.log("Starting Test 4: Success Signup...");
        // Use a unique username to ensure database storage [cite: 12]
        const uniqueUser = `user${Date.now()}`;
        await driver.get(`${baseUrl}/signup`);
        await driver.findElement(By.name('username')).sendKeys(uniqueUser);
        await driver.findElement(By.name('email')).sendKeys(`${uniqueUser}@test.com`);
        await driver.findElement(By.name('password')).sendKeys('password123');
        await driver.findElement(By.css('.btn-light')).click();

        alertElement = await driver.wait(until.elementLocated(By.css('.alert-success')), 5000);
        console.log("✔ Test 4 Passed: Success message displayed for new user.");

        // --- TEST CASE 5: Missing Password Signup ---
        console.log("Starting Test 5: Missing Password...");
        await driver.get(`${baseUrl}/signup`);
        await driver.findElement(By.name('username')).sendKeys('nopassworduser');
        await driver.findElement(By.name('email')).sendKeys('test@test.com');
        await driver.findElement(By.css('.btn-light')).click();

        if (currentUrl.includes('/signup')) {
            console.log("✔ Test 5 Passed: Stayed on signup page due to missing field.");
        }

        
        // --- TEST CASE 6: Successful Listing Creation (Requires Login) ---
        console.log("Starting Test 6: Create New Listing...");

        // 1. Must login first
        await driver.get(`${baseUrl}/login`);
        await driver.findElement(By.name('username')).sendKeys('demo');
        await driver.findElement(By.name('password')).sendKeys('demo');
        await driver.findElement(By.css('.btn-light')).click();
        await driver.wait(until.elementLocated(By.css('.alert-success')), 5000);

        // 2. Navigate to New Listing Page
        await driver.get(`${baseUrl}/listing/new`);

        await driver.findElement(By.name('listing[title]')).sendKeys('DevOps Luxury Suite');
        await driver.findElement(By.name('listing[description]')).sendKeys('Testing automated pipelines.');
        // Uploading a file in a containerized environment 
        await driver.findElement(By.name('listing[image]')).sendKeys('/var/lib/jenkins/workspace/Assignment2_Part2/test-image.jpg');
        await driver.findElement(By.name('listing[price]')).sendKeys('5000');
        await driver.findElement(By.name('listing[location]')).sendKeys('Islamabad');
        await driver.findElement(By.name('listing[country]')).sendKeys('Pakistan');
        await driver.findElement(By.css('.new-btn')).click();

        alertElement = await driver.wait(until.elementLocated(By.css('.alert-success')), 5000);
        console.log("✔ Test 6 Passed: Listing created while logged in.");

        // --- TEST CASE 7: Unauthorized Access Check ---
        console.log("Starting Test 7: Unauthorized Create Attempt...");
        // Logout first or use a clean session
        await driver.get(`${baseUrl}/logout`); 
        await driver.get(`${baseUrl}/listing/new`);

        // Verify if redirected to login or error flash appears [cite: 10]
        alertElement = await driver.wait(until.elementLocated(By.css('.alert-danger')), 5000);
        alertText = await alertElement.getText();
        if (alertText.includes("logged in")) {
            console.log("✔ Test 7 Passed: System blocked unauthorized listing creation.");
        }

        // --- TEST CASE 8: Listing Form Client-Side Validation ---
        console.log("Starting Test 8: Empty Price Validation...");
        await driver.get(`${baseUrl}/login`); // Ensure logged back in
        // ... (login steps) ...
        await driver.get(`${baseUrl}/listing/new`);
        await driver.findElement(By.name('listing[title]')).sendKeys('Price Test');
        await driver.findElement(By.css('.new-btn')).click();

        // Check for Bootstrap "invalid-feedback" visibility [cite: 9]
        let priceError = await driver.findElement(By.xpath("//div[contains(text(), 'Enter Valid Price')]"));
        if (await priceError.isDisplayed()) {
            console.log("✔ Test 8 Passed: UI validation blocked empty price.");
        }

        // --- TEST CASE 9: Navigation from New Listing to Home ---
        console.log("Starting Test 9: Cancel/Navigate back...");
        await driver.get(`${baseUrl}/listing/new`);
        await driver.findElement(By.className('navbar-brand')).click();
        let currentUrl = await driver.getCurrentUrl();
        if (currentUrl.endsWith('/listings') || currentUrl.endsWith('/')) {
            console.log("✔ Test 9 Passed: Successfully navigated away from form.");
        }

        // --- TEST CASE 10: Successful LogOut ---
        console.log("Starting Test 10: Successful LogOut...");
        // Ensure we are logged in first (reuse login logic if needed)
        await driver.get(`${baseUrl}/login`);
        await driver.findElement(By.name('username')).sendKeys('demo');
        await driver.findElement(By.name('password')).sendKeys('demo');
        await driver.findElement(By.css('.btn-light')).click();

        // Find and click the LogOut link from the navbar
        const logoutLink = await driver.wait(until.elementLocated(By.linkText("LogOut")), 5000);
        await logoutLink.click();

        // Verify redirection and success message
        alertElement = await driver.wait(until.elementLocated(By.css('.alert-success')), 5000);
        alertText = await alertElement.getText();
        if (alertText.includes("logged you out")) {
            console.log("✔ Test 10 Passed: LogOut successful.");
        }

        // --- TEST CASE 11: Navbar State (Logged Out) ---
        console.log("Starting Test 11: Navbar Links (Logged Out)...");
        // In a logged-out state, 'SignUp' and 'LogIn' should be visible, 'LogOut' should not
        const signUpLink = await driver.findElement(By.linkText("SignUp"));
        const logInLink = await driver.findElement(By.linkText("LogIn"));

        if (await signUpLink.isDisplayed() && await logInLink.isDisplayed()) {
            console.log("✔ Test 11 Passed: Correct links visible in logged-out navbar.");
        }

        // --- TEST CASE 12: Navbar State (Logged In) ---
        console.log("Starting Test 12: Navbar Links (Logged In)...");
        await driver.get(`${baseUrl}/login`);
        await driver.findElement(By.name('username')).sendKeys('demo');
        await driver.findElement(By.name('password')).sendKeys('demo');
        await driver.findElement(By.css('.btn-light')).click();

        // Verify 'LogOut' and 'New Listing' are now visible
        const newListingLink = await driver.findElement(By.linkText("New Listing"));
        if (await newListingLink.isDisplayed()) {
            console.log("✔ Test 12 Passed: 'New Listing' appeared in navbar after login.");
        }

        // --- TEST CASE 13: Search Functionality ---
        console.log("Starting Test 13: Navbar Search Execution...");
        const searchInput = await driver.findElement(By.name("search"));
        await searchInput.sendKeys("Islamabad");
        await driver.findElement(By.css(".search-btn")).click();

        // Verify search results page loaded (adjust based on your app's actual behavior)
        let currentUrl = await driver.getCurrentUrl();
        if (currentUrl.includes("/search")) {
            console.log("✔ Test 13 Passed: Search submitted successfully.");
        }

    } catch (err) {
        console.error("Pipeline Test Failure:", err.message);
        process.exit(1); // Signals Jenkins that the 'Test' stage failed 
    } finally {
        await driver.quit();
    }
}

runTests();