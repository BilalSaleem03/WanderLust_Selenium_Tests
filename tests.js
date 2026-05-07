const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function runTests() {
    let options = new chrome.Options();
    options.addArguments('--headless'); // Mandatory for EC2 [cite: 15]
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');

    let driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

    try {
        // Replace with your EC2 Public IP or Container Name if on the same network
        await driver.get('http://<your-ec2-ip>:3001'); 

        // --- TEST CASES (Implement 15 total) ---
        
        // 1. Check Title
        console.log("Test 1: Checking title...");
        let title = await driver.getTitle();
        if (title) console.log("Pass");

        // 2. Test Navigation to 'Add New'
        await driver.findElement(By.linkText("Add New Listing")).click();
        
        // 3. Test Form Submission (Database Storage)
        await driver.findElement(By.name("listing[title]")).sendKeys("DevOps Test Home");
        await driver.findElement(By.id("submit-btn")).click();

        // ... Add 12 more cases (Validation, Login, UI checks, etc.) [cite: 11]

    } catch (err) {
        console.error("Test Failed:", err);
        process.exit(1); // Exit with error for Jenkins to catch 
    } finally {
        await driver.quit();
    }
}
runTests();