const fs = require('fs');
const puppeteer = require('puppeteer');
const readline = require('readline');


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function showMenu() {
    const chalk = await import('chalk'); // Menggunakan dynamic import
    console.log(chalk.default.yellow.bold(`
          #############################################
          #        *   SATSET IdSnapDragon  *         #
          #      == Bot By Aries Firmansyah ==        #
          #############################################
    `));
    console.log(chalk.default.green.bold(' -------------- MENU --------------'));
    console.log(chalk.default.green.bold(' > [1] Auto Cek In'));
    console.log(chalk.default.green.bold(' > [2] Checker Saldo'));
    console.log(chalk.default.green.bold(' > [3] EXIT'));
    console.log('');

    rl.question('Pilih nomor menu (1/2/3): ', (choice) => {
        handleMenuChoice(choice);
      });
}

function handleMenuChoice(choice) {
  switch (choice) {
    case '1':
      runCekInScript();
      break;
    case '2':
      runCekSaldoScript();
      break;
    case '3':
      exitProgram();
      break;
    default:
      console.log(chalk.red('Pilihan tidak valid. Silakan pilih opsi yang benar.'));
      showMenu();
      break;
  }
}


// function runCekIn() {
//   const cekin = require('./cekin');
//   cekin.start();
//   rl.close();
// }

// function runCekSaldo() {
//     const cekin = require('./ceksaldo');
//     cekin.start();
//     rl.close();
//   }

async function runCekSaldoScript() {
  try {
    const accountData = fs.readFileSync('akun.txt', 'utf8');
    const accountLines = accountData.split('\n');

    const phoneNumbers = [];
    const passwords = [];

    accountLines.forEach(line => {
      if (line.trim() !== '') {
        const [phoneNumber, password] = line.split('|');
        phoneNumbers.push(phoneNumber.trim());
        passwords.push(password.trim());
      }
    });

    for (let i = 0; i < phoneNumbers.length; i++) {
      const browser = await puppeteer.launch({
        headless: 'new',
        defaultViewport: null,
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      });

      const page = await browser.newPage();
      const phoneNumber = phoneNumbers[i];
      const password = passwords[i];

      // Login
      await page.goto("https://www.idsnapdragon.com/my/", {
        waitUntil: 'networkidle2',
        timeout: 30000
      });
      await page.waitForTimeout(2000);

      // Masukkan nomor telepon dan kata sandi
      await page.type('input[name="phone"]', phoneNumber);
      await page.type('input[name="password"]', password);

      // Klik tombol "Gabung"
      await page.click('button[type="submit"]');

      // Tunggu halaman tugas dimuat
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
      await page.waitForTimeout(2000);

      // Dapatkan data yang sudah cek in

      // Dapatkan saldo
      const saldo = await getSaldo(page);
      console.log("Saldo:", saldo);
      console.log("Nomor:", phoneNumber);
      console.log("");

      // Tunggu beberapa saat sebelum menutup browser
      await page.waitForTimeout(2000);

      // Tutup browser
      await browser.close();
    }

    console.log('Selesai');

    startProgram(); // Kembali ke menu setelah selesai menjalankan runCekSaldoScript()
  } catch (error) {
    console.error("Error:", error);
  }
}

async function getSaldo(page) {
  await page.waitForSelector('h3 code');
  const saldo = await page.evaluate(() => {
    const saldoElement = document.querySelector('h3 code');
    const saldoText = saldoElement.nextSibling.textContent.trim();
    return saldoText;
  });
  return saldo;
}

async function runCekInScript() {
    try {
      const accountData = fs.readFileSync('akun.txt', 'utf8');
      const accountLines = accountData.split('\n');
  
      const phoneNumbers = [];
      const passwords = [];
  
      accountLines.forEach(line => {
        if (line.trim() !== '') { // Periksa apakah baris tidak kosong
          const [phoneNumber, password] = line.split('|');
          phoneNumbers.push(phoneNumber.trim());
          passwords.push(password.trim());
        }
      });
  
      for (let i = 0; i < phoneNumbers.length; i++) {
        const browser = await puppeteer.launch({
          headless: 'new',
          defaultViewport: null,
          executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        });
  
        const page = await browser.newPage();
        const phoneNumber = phoneNumbers[i];
        const password = passwords[i];
  
        // Login
        await page.goto("https://www.idsnapdragon.com/task/", {
          waitUntil: 'networkidle2',
          timeout: 30000
        });
        await page.waitForTimeout(2000); // Tambahkan penundaan tambahan untuk memastikan frame utama dimuat sepenuhnya
  
        // Masukkan nomor telepon dan kata sandi
        await page.type('input[name="phone"]', phoneNumber);
        await page.type('input[name="password"]', password);
  
        // Klik tombol "Gabung"
        await page.click('button[type="submit"]');
  
        // Tunggu halaman tugas dimuat
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
        await page.waitForTimeout(2000); // Tambahkan penundaan tambahan untuk memastikan frame utama dimuat sepenuhnya
  
        // Dapatkan data yang sudah cek in
        const checkedInData = await getData(page);
  
        console.log("Data yang sudah cek in:", checkedInData);
        console.log("Nomor:", phoneNumber); // Tampilkan nomor telepon yang sedang diproses
  
        // Tunggu tombol "Mendaftar" muncul
        await page.waitForSelector('#clockin');
  
        // Periksa apakah tombol "Mendaftar" memiliki id "#disable"
        const isButtonDisabled = await page.evaluate(() => {
          const clockinButton = document.querySelector('#clockin');
          return clockinButton !== null;
        });
  
        if (isButtonDisabled) {
          console.log('Anda sudah cekin.'); // Keterangan bahwa Anda sudah cekin
          console.log("");
        } else {
          console.log('Tombol "Mendaftar" tidak ditemukan. Menutup browser.');
          await browser.close();
          continue; // Lanjutkan ke nomor selanjutnya dengan browser baru
        }
  
        // Klik tombol "Mendaftar"
        await page.click('#clockin');
  
        // Tunggu beberapa saat sebelum menutup browser
        await page.waitForTimeout(2000);
  
        // Tutup browser
        await browser.close();
      }
  
      console.log('Selesai');
      startProgram(); // Kembali ke menu setelah selesai
    } catch (error) {
      console.error("Error:", error);
      startProgram(); // Kembali ke menu setelah terjadi error
    }
  }
  
  // Fungsi untuk mendapatkan data yang sudah cek in
  async function getData(page) {
    const data = await page.evaluate(() => {
      const ulElement = document.querySelector('.box.checkInBox ul'); // Ganti dengan selector yang sesuai
      if (!ulElement) return []; // Periksa apakah elemen ul ditemukan
      const listItems = ulElement.querySelectorAll('.box.checkInBox li'); // Ganti dengan selector yang sesuai
      const checkedInItems = Array.from(listItems)
        .filter(li => li.classList.contains('act'))
        .map(li => li.textContent.trim());
      return checkedInItems;
    });
    return data;
  }
  

function exitProgram() {
  console.log('Terima kasih telah menggunakan program ini. Sampai jumpa lagi!');
  process.exit(0);
}

function startProgram() {
  showMenu();
}

startProgram();

