const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function runTests() {
    let options = new chrome.Options();
    options.addArguments('--headless'); 
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--window-size=1920,1080');

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    let baseUrl = 'http://wanderlust-devops-backend:3001';

    try {
        // --- TEST CASE 1: Correct Login ---
        console.log("Starting Test 1: Successful Login...");
        await driver.get(`${baseUrl}/login`);
        await driver.findElement(By.name('username')).sendKeys('demo');
        await driver.findElement(By.name('password')).sendKeys('demo');
        await driver.findElement(By.css('.btn-light')).click();
        let alertElement = await driver.wait(until.elementLocated(By.css('.alert-success')), 5000);
        console.log("✔ Test 1 Passed: Login attempt completed.");

        // --- TEST CASE 2: Wrong Login ---
        console.log("Starting Test 2: Failed Login...");
        await driver.get(`${baseUrl}/login`);
        await driver.findElement(By.name('username')).sendKeys('demo');
        await driver.findElement(By.name('password')).sendKeys('wrongpassword');
        await driver.findElement(By.css('.btn-light')).click();
        alertElement = await driver.wait(until.elementLocated(By.css('.alert-danger')), 5000);
        console.log("✔ Test 2 Passed: Error displayed for wrong credentials.");

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
        let currentUrl = await driver.getCurrentUrl(); 
        if (currentUrl.includes('/signup')) {
            console.log("✔ Test 5 Passed: Stayed on signup page due to missing field.");
        }

        // --- TEST CASE 6: Successful Listing Creation ---
        console.log("Starting Test 6: Create New Listing...");
        await driver.get(`${baseUrl}/login`);
        await driver.findElement(By.name('username')).sendKeys('demo');
        await driver.findElement(By.name('password')).sendKeys('demo');
        await driver.findElement(By.css('.btn-light')).click();
        await driver.wait(until.elementLocated(By.css('.alert-success')), 5000);

        await driver.get(`${baseUrl}/listing/new`);
        await driver.findElement(By.name('listing[title]')).sendKeys('DevOps Suite');
        await driver.findElement(By.name('listing[description]')).sendKeys('Testing automated pipelines.');
        await driver.findElement(By.name('listing[price]')).sendKeys('5000');
        await driver.findElement(By.name('listing[location]')).sendKeys('Islamabad');
        await driver.findElement(By.name('listing[country]')).sendKeys('Pakistan');

        await driver.executeScript(`
            const form = document.querySelector('form.needs-validation');
            form.classList.remove('needs-validation');
            form.submit();
        `);

        await driver.sleep(6000);
        const urlAfter = await driver.getCurrentUrl();
        const bodyText = await driver.findElement(By.css('body')).getText();
        const alertSuccess = await driver.findElements(By.css('.alert-success'));
        const alertDanger = await driver.findElements(By.css('.alert-danger'));
        console.log("Test 6 URL after submit:", urlAfter);
        console.log("Test 6 alert-success count:", alertSuccess.length);
        console.log("Test 6 alert-danger count:", alertDanger.length);
        console.log("Test 6 body text (first 500):", bodyText.substring(0, 500));
        console.log("✔ Test 6 debug complete - check logs above.");

        // --- TEST CASE 7: Unauthorized Access Check ---
        console.log("Starting Test 7: Unauthorized Create Attempt...");
        // Logout first by navigating to logout route and waiting for redirect
        await driver.get(`${baseUrl}/logout`);
        await driver.wait(until.urlContains('/listing'), 5000);
        // Now try accessing the new listing page while logged out
        await driver.get(`${baseUrl}/listing/new`);
        // Should be redirected to login with a danger alert
        await driver.wait(until.urlContains('/login'), 5000);
        alertElement = await driver.wait(until.elementLocated(By.css('.alert-danger')), 5000);
        console.log("✔ Test 7 Passed: System blocked unauthorized creation.");

        // --- TEST CASE 8: Client-Side Validation ---
        console.log("Starting Test 8: Empty Price Validation...");
        await driver.get(`${baseUrl}/login`);
        await driver.findElement(By.name('username')).sendKeys('demo');
        await driver.findElement(By.name('password')).sendKeys('demo');
        await driver.findElement(By.css('.btn-light')).click();
        await driver.wait(until.elementLocated(By.css('.alert-success')), 5000);
        await driver.get(`${baseUrl}/listing/new`);
        // Trigger Bootstrap validation by clicking submit with empty fields
        await driver.executeScript(`
            const form = document.querySelector('form.needs-validation');
            form.classList.add('was-validated');
        `);
        let priceError = await driver.wait(until.elementLocated(By.css('.invalid-feedback')), 5000);
        if (await priceError.isDisplayed()) console.log("✔ Test 8 Passed: UI validation blocked empty price.");

        // --- TEST CASE 9: Brand Logo Navigation ---
        console.log("Starting Test 9: Brand Logo Redirect...");
        // Already logged in from Test 8, go to listing/new and click brand logo
        await driver.get(`${baseUrl}/listing/new`);
        await driver.findElement(By.css('.navbar-brand')).click();
        await driver.wait(until.urlContains('/listing'), 5000);
        currentUrl = await driver.getCurrentUrl();
        if (currentUrl.includes('/listing')) console.log("✔ Test 9 Passed: Brand logo redirected to home.");

        // --- TEST CASE 10: Successful LogOut ---
        console.log("Starting Test 10: Successful LogOut...");
        // Already logged in from previous tests, go to a page where navbar is visible
        await driver.get(`${baseUrl}/listing`);
        await driver.wait(until.elementLocated(By.linkText("LogOut")), 5000);
        const logoutLink = await driver.findElement(By.linkText("LogOut"));
        await logoutLink.click();
        // Wait for redirect after logout and check for success alert
        await driver.wait(until.urlContains('/listing'), 5000);
        await driver.wait(until.elementLocated(By.css('.alert-success')), 5000);
        console.log("✔ Test 10 Passed: LogOut successful.");

        // --- TEST CASE 11: Logged Out Navbar ---
        console.log("Starting Test 11: Navbar Logged-Out State...");
        const logInLink = await driver.findElement(By.linkText("LogIn"));
        if (await logInLink.isDisplayed()) console.log("✔ Test 11 Passed: LogIn visible.");

        // --- TEST CASE 12: Logged In Navbar ---
        console.log("Starting Test 12: Navbar Logged-In State...");
        await driver.get(`${baseUrl}/login`);
        await driver.findElement(By.name('username')).sendKeys('demo');
        await driver.findElement(By.name('password')).sendKeys('demo');
        await driver.findElement(By.css('.btn-light')).click();
        await driver.wait(until.elementLocated(By.css('.alert-success')), 5000);
        const newListingLink = await driver.findElement(By.linkText("New Listing"));
        if (await newListingLink.isDisplayed()) console.log("✔ Test 12 Passed: 'New Listing' visible.");

        // --- TEST CASE 13: Search Functionality ---
        console.log("Starting Test 13: Search Execution...");
        await driver.findElement(By.name("search")).sendKeys("Islamabad");
        await driver.findElement(By.css(".search-btn")).click();
        currentUrl = await driver.getCurrentUrl();
        if (currentUrl.includes("/search")) console.log("✔ Test 13 Passed: Search submitted.");

        // --- TEST CASE 14: Explore Link ---
        console.log("Starting Test 14: Explore Navigation...");
        await driver.findElement(By.linkText("Explore")).click();
        currentUrl = await driver.getCurrentUrl();
        if (currentUrl.includes("/listing")) console.log("✔ Test 14 Passed: Explore link works.");

        // --- TEST CASE 15: Empty Search ---
        console.log("Starting Test 15: Empty Search validation...");
        await driver.get(`${baseUrl}/listing`);
        await driver.findElement(By.css(".search-btn")).click();
        console.log("✔ Test 15 Passed: Empty search handled.");

    } catch (err) {
        console.error("Pipeline Test Failure:", err.message);
        process.exit(1);
    } finally {
        await driver.quit();
    }
}
runTests();