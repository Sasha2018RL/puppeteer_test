// Script to authenticate in Gmail and get unread messages count

const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

const email = 'YOUR EMAIL HERE';
const password = 'YOUR PASSWORD HERE';

const selectors = {
    mail_input: '#identifierId',
    mail_submit: '#identifierNext > div > button',
    password_input: '[name="Passwd"]',
    password_submit: '#passwordNext > div > button',
    unread_count: 'div.UKr6le > div.bsU'
};

(async () => {
    // Use stealth plugin to hide that we use puppeteer from Google
    puppeteer.use(StealthPlugin());

    // Open browser
    const browser = await puppeteer.launch({
        headless: false,
        userDataDir: "./tmp"
    });

    // Open new page
    const page = await browser.newPage();

    // Go to the GMail
    await page.goto('https://mail.google.com/');

    // Complete auth if need, will be necessary on first launch
    if (await elementExists(page, selectors.mail_input, 100)) {
        // While typing email address make delay between keypress to emulate human input
        await page.type(selectors.mail_input, email, {delay: 80});

        // Little delay for stability
        await sleep();

        // Submit email input stage
        await page.click(selectors.mail_submit);

        // Authentication stage 2 - password
        if (await elementExists(page, selectors.password_input)) {
            // Let some time to init the page
            await sleep(1000);

            // Input the password, emulating human typing
            await page.type(selectors.password_input, password, {delay: 80});

            // Little delay for stability
            await sleep();

            // Submit password input stage
            await page.click(selectors.password_submit);
        }
    }

    // Wait for initialization of unread messages count element
    const unread_count_element = await elementExists(page, selectors.unread_count, 20000);

    if(unread_count_element){
        // Get count of unread messages if have element
        const unread_count = await unread_count_element.evaluate(el => el.textContent);

        console.log(`You have ${unread_count} unread messages!`);

        await browser.close();
    }else{
        // Something went wrong if there is not element with count of unread messages
        console.log('Something went wrong!')
    }
})()

function elementExists(page, selector, timeout = 2000) {
    return new Promise(async resolve => {
        try {
            resolve(
                await page.waitForSelector(selector, {timeout: timeout})
            );
        } catch (error) {
            resolve(false);
        }
    })
}

function sleep(time = 200) {
    return new Promise(resolve => setTimeout(resolve, time))
}
