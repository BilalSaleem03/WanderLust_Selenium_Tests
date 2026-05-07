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

    try {
        // Replace with your service name 'backend' if running in the Docker network
        const baseUrl = 'http://3.27.160.224:3001/login';

        // --- TEST CASE 1: Correct Login ---
        console.log("Starting Test 1: Successful Login...");
        await driver.get(baseUrl);
        
        await driver.findElement(By.name('username')).sendKeys('demo');
        await driver.findElement(By.name('password')).sendKeys('demo');
        await driver.findElement(By.css('.btn-light')).click();

        // Check for success flash message
        let successFlash = await driver.wait(until.elementLocated(By.css('.alert-success')), 5000);
        let successText = await successFlash.getText();
        
        if (successText.includes("Password ot username is incorrect")) { 
            console.log("✔ Test 1 Passed: Correct login recognized.");
        } else {
            throw new Error("Test 1 Failed: Success message not found or incorrect.");
        }

        // --- TEST CASE 2: Wrong Login ---
        console.log("Starting Test 2: Failed Login...");
        await driver.get(baseUrl);

        await driver.findElement(By.name('username')).sendKeys('demo');
        await driver.findElement(By.name('password')).sendKeys('demo2');
        await driver.findElement(By.css('.btn-light')).click();

        // Check for error flash message
        let errorFlash = await driver.wait(until.elementLocated(By.css('.alert-danger')), 5000);
        let errorText = await errorFlash.getText();

        if (errorText.length > 0) {
            console.log("✔ Test 2 Passed: Error message displayed for wrong credentials.");
        } else {
            throw new Error("Test 2 Failed: Error message not displayed.");
        }


        console.log("Starting Test 3: Failed Signup...");

        baseUrl = 'http://3.27.160.224:3001/signup'
        await driver.get(baseUrl);

        await driver.findElement(By.name('username')).sendKeys('demo');
        await driver.findElement(By.name('email')).sendKeys('demo@gmail.com');
        await driver.findElement(By.name('password')).sendKeys('demo');
        await driver.findElement(By.css('.btn-light')).click();

        // Check for error flash message
        let errorFlash = await driver.wait(until.elementLocated(By.css('.alert-danger')), 5000);
        let errorText = await errorFlash.getText();

        if (errorText.length > 0) {
            console.log("✔ Test 3 Passed: Error message displayed...");
        } else {
            throw new Error("Test 3 Failed: Error message not displayed.");
        }
        
        
        console.log("Starting Test 4: Success Signup...");

        baseUrl = 'http://3.27.160.224:3001/signup'
        await driver.get(baseUrl);

        await driver.findElement(By.name('username')).sendKeys('demo5');
        await driver.findElement(By.name('email')).sendKeys('demo5@gmail.com');
        await driver.findElement(By.name('password')).sendKeys('demo5');
        await driver.findElement(By.css('.btn-light')).click();

        // Check for error flash message
        let successFlash = await driver.wait(until.elementLocated(By.css('.alert-success')), 5000);
        let successText = await successFlash.getText();

        if (successText.length > 0) {
            console.log("✔ Test 3 Passed: Success message displayed...");
        } else {
            throw new Error("Test 3 Failed: Success message not displayed.");
        }

    } catch (err) {
        console.error("Pipeline Test Failure:", err.message);
        process.exit(1); // Forces Jenkins to mark the 'Test' stage as failed [cite: 16]
    } finally {
        await driver.quit();
    }
}

runTests();