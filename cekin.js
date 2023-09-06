const fs = require('fs');
const puppeteer = require('puppeteer');

async function run() {
  try {
    const accountData = fs.readFileSync('akun.txt', 'utf8');
    const accountLines = accountData.split('\n');

    const phoneNumbers = [];
    const passwords = [];

    accountLines.forEach(line => {
      const [phoneNumber, password] = line.split('|');
      phoneNumbers.push(phoneNumber.trim());
      passwords.push(password.trim());
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
      console.log("");

      // Tunggu tombol "Mendaftar" muncul
      await page.waitForSelector('#clockin');

      // Periksa apakah tombol "Mendaftar" memiliki id "#disable"
      const isButtonDisabled = await page.evaluate(() => {
        const clockinButton = document.querySelector('#clockin');
        return clockinButton !== null;
      });

      if (isButtonDisabled) {
        console.log('Anda sudah cekin.'); // Keterangan bahwa Anda sudah cekin
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
  } catch (error) {
    console.error("Error:", error);
  }
}

// Fungsi untuk mendapatkan data yang sudah cek in
async function getData(page) {
  const data = await page.evaluate(() => {
    const ulElement = document.querySelector('.box.checkInBox ul'); // Ganti dengan selector yang sesuai
    const listItems = ulElement.querySelectorAll('.box.checkInBox li'); // Ganti dengan selector yang sesuai
    const checkedInItems = Array.from(listItems)
      .filter(li => li.classList.contains('act'))
      .map(li => li.textContent.trim());
    return checkedInItems;
  });
  return data;
}

run();
