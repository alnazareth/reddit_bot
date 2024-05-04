const puppeteer = require('puppeteer');
const readline = require('readline');
const fs = require('fs');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
async function start(username, password, message) {
    try {
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();
        await page.goto("https://www.reddit.com/search/?q=gold&type=sr");  // here is where you can put the link of the Communities you what to send you  message.

        const isLogin = await page.evaluate(() =>
            Array.from(document.querySelectorAll("#login-button > span > span")).map(x => x.textContent)
        );

        if (isLogin.length > 0) {
            try {
                //  console.log("Hacer login");
                await page.click("#login-button > span > span");
                await page.waitForSelector("#login-password");
                await page.type("#login-username", username);
                await page.type("#login-password", password);
                await page.focus("#login-username").then(() =>

                    setTimeout(page.keyboard.press('Enter'), 2000)


                );


            } catch (e) {
                console.log(e.message);
                logError(e.message);
            }
        } else {
            //  console.log("Ya estás logueado");
        }

        try {
            // Esperar a que aparezca el botón del usuario para recuperar los subreddits
            await page.waitForSelector("#expand-user-drawer-button > span > span > span > span > img", { timeout: 120000 });
        } catch (e) {
            console.log(e.message);
            // console.log("\n\nNo se ha iniciado session");
            logError("\n\nNo se ha iniciado session");
        }
        // Extraer los nombres de los subreddits
        const subreddits = await page.evaluate(() =>
            Array.from(document.querySelectorAll("#main-content > div > reddit-feed > faceplate-tracker > div > faceplate-tracker > a")).map(x => x.textContent.trim())
        );
        console.log(" subreddits ");
        subreddits.forEach(element => {
            console.log(element);
        });

        // Generar y hacer clic en los enlaces
        for (let index = 0; index < subreddits.length; index++) {
            const link = "https://www.reddit.com/" + subreddits[index];
            await page.goto(link, { waitUntil: 'load' }).then(
                () =>
                    setTimeout(() => console.log("Spin " + index), 5000)
            )

            var posts = await page.evaluate(() =>
                Array.from(document.querySelectorAll('a.absolute.inset-0')).map(element => element.getAttribute('href'))
            );


            console.log("Cantidad de elemtos: " + posts.length);

            posts.forEach(element => {
                console.log(element);
            });

            for (let index2 = 0; index2 < posts.length; index2++) {


                const linkPost = "https://www.reddit.com" + posts[index2];
                await page.goto(linkPost, { waitUntil: 'load' })
                console.log(linkPost);
                await page.waitForSelector("#main-content > shreddit-async-loader > comment-body-header > shreddit-async-loader:nth-child(1) > comment-composer-host > faceplate-tracker:nth-child(1) > button"/*, {timeout: 60000}*/);

                await page.click("#main-content > shreddit-async-loader > comment-body-header > shreddit-async-loader:nth-child(1) > comment-composer-host > faceplate-tracker:nth-child(1) > button");

                await page.type("#main-content > shreddit-async-loader > comment-body-header > shreddit-async-loader:nth-child(1) > comment-composer-host > faceplate-form > shreddit-composer > div > p", message).then(
                    () =>
                        page.click("button.button-primary")
                ).then(
                    () =>
                        setTimeout(() => console.log("SpinPosts " + index2), 5000)
                )



            }

        }


        await browser.close();

        rl.write("\n\n*************************************\n");
        rl.write("*         REDDIT BOT WAS STOPPED      *\n");
        rl.write("*************************************\n\n");
    } catch (e) {
        console.log(e.message);
        logError(e.message);
    }
}

function logError(errorMessage) {
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().slice(0, 19).replace('T', ' '); // Formato: YYYY-MM-DD HH:MM:SS
    const logMessage = `[${formattedDate}] ${errorMessage}\n`;

    fs.appendFile('error.log', logMessage, (err) => {
        if (err) throw err;
        console.log('Se ha actualizado el archivo error.log');
        /*
rl.write("***************************************\n");
rl.write("*                                     *\n");
rl.write("*      Se han encontrado problemas    *\n");
rl.write("*                                     *\n");
rl.write("*  -->Revise el archivo error.log <-- *\n");
rl.write("**************************************\n\n"); */
    });
}



rl.write("***************************************\n");
rl.write("*                                     *\n");
rl.write("*        WELCOME TO THE REDDIT BOT    *\n");
rl.write("*                                     *\n");
rl.write("*                  V1.0               *\n");
rl.write("**************************************\n\n");

rl.question('Ingresa tu usuario(reddit): ', (username) => {
    rl.question('Ingresa tu contraseña(reddit): ', (password) => {
        rl.question('Ingresa tu mensaje personalizado: ', (message) => {

            start(username, password, message);
            rl.close();
        });
    });
});
