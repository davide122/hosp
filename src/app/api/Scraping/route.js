import puppeteer from "puppeteer";

export async function fetchHotelDetails(hotelName, location) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Naviga su Booking.com e cerca l'hotel
  const searchUrl = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(
    hotelName + " " + location
  )}`;
  await page.goto(searchUrl);

  // Seleziona il primo risultato
  const hotelSelector = ".sr_property_block_main_row";
  await page.waitForSelector(hotelSelector);

  const result = await page.evaluate(() => {
    const hotel = document.querySelector(".sr_property_block_main_row");
    if (!hotel) return null;

    const name = hotel.querySelector(".sr-hotel__name")?.textContent.trim();
    const location = hotel.querySelector(".bui-card__subtitle")?.textContent.trim();
    const rating = hotel.querySelector(".bui-review-score__badge")?.textContent.trim();
    const reviews = hotel.querySelector(".bui-review-score__text")?.textContent.trim();

    return { name, location, rating, reviews };
  });

  await browser.close();
  return result;
}
