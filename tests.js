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

        // Checking for any error alert (danger or specific validation)
        alertElement = await driver.wait(until.elementLocated(By.css('.alert-danger')), 5000);
        console.log("✔ Test 5 Passed: Error message displayed for missing field.");

        // --- ADD TESTS 6 THROUGH 15 BELOW TO MEET REQUIREMENTS  ---
        // Suggestions:
        // 6. Navigate to Home
        // 7. Check if listings are visible
        // 8. Test invalid email format in signup
        // 9. Test logout functionality
        // 10. Test unauthorized access to restricted routes
        // 11-15. Field-specific validations for listing forms

    } catch (err) {
        console.error("Pipeline Test Failure:", err.message);
        process.exit(1); // Signals Jenkins that the 'Test' stage failed 
    } finally {
        await driver.quit();
    }
}

runTests();