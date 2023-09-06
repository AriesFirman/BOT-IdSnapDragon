const fs = require('fs');
const puppeteer = require('puppeteer');

async function run() {
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
        headless: false,
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

      // Dapatkan saldo
      const saldo = await getSaldo(page);
      console.log("Saldo:", saldo);
      console.log("Nomor:", phoneNumber); // Tampilkan nomor telepon yang sedang diproses
      console.log("");

      // Tunggu beberapa saat sebelum menutup browser
      await page.waitForTimeout(2000);

      // Tutup browser
      await browser.close();
    }

    console.log('Selesai');
  } catch (error) {
    console.error("Error:", error);
  }
}

// Fungsi untuk mendapatkan data saldo
async function getSaldo(page) {
  await page.waitForSelector('h3 code'); // Tunggu elemen 'h3 code' muncul
  const saldo = await page.evaluate(() => {
    const saldoElement = document.querySelector('h3 code');
    const saldoText = saldoElement.nextSibling.textContent.trim();
    return saldoText;
  });
  return saldo;
}

run();
