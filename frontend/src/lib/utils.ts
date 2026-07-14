export function formatPriceUZS(value?: number | null): string {
  if (value == null || Number.isNaN(value)) return '—';
  const formatted = new Intl.NumberFormat('ru-RU').format(Math.round(value));
  return `${formatted} so'm`;
}

export function formatPriceShort(value?: number | null): string {
  if (value == null || Number.isNaN(value)) return '—';
  if (value === 0) return '0';
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)} mlrd`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} mln`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)} ming`;
  return `${value}`;
}

export function conditionLabel(condition: string): string {
  switch (condition) {
    case 'new':
      return 'Yangi';
    case 'used':
      return 'Ishlatilgan';
    case 'remanufactured':
      return 'Tiklangan';
    default:
      return condition;
  }
}

const CITY_CENTERS: Record<string, [number, number]> = {
  // Toshkent
  "Yunusobod": [41.37, 69.285],
  "Shayxontohur": [41.32, 69.205],
  "Mirabad": [41.3, 69.28],
  "Yashnobod": [41.29, 69.33],
  "Chilonzor": [41.27, 69.205],
  "Bektemir": [41.22, 69.33],
  "Sergeli": [41.21, 69.205],
  "Yakkasaroy": [41.295, 69.255],
  "Uchtepa": [41.32, 69.165],
  "Mirobod": [41.3, 69.26],
  "Samarqand": [39.65, 66.97],
  "Buxoro": [39.768, 64.421],
  "Andijon": [40.782, 72.344],
  "Farg‘ona": [40.384, 71.784],
  "Fargona": [40.384, 71.784],
  "Namangan": [40.998, 71.6726],
  "Qo‘qon": [40.529, 70.943],
  "Marg‘ilon": [40.472, 71.724],
  "Urganch": [41.55, 60.633],
  "Xiva": [41.389, 60.364],
  "Qarshi": [38.861, 65.789],
  "Shahrisabz": [39.057, 66.833],
  "Nukus": [42.46, 59.616],
  "Urgut": [39.4, 67.0],
  "Jizzax": [39.774, 67.83],
  "Guliston": [40.49, 68.781],
  "Termiz": [37.224, 67.276],
  "Chirchiq": [41.468, 69.575],
  "Angren": [41.017, 70.143],
  "Bekobod": [40.22, 69.123],
  "Olmaliq": [40.846, 69.598],
  "Yangiyo‘l": [41.117, 69.05],
  "Zarafshon": [41.566, 64.195],
  "Navoiy": [40.103, 65.373],
  "Kogon": [39.8, 64.55],
  "G‘ijduvon": [40.1, 64.68],
  "Asaka": [40.64, 72.24],
  "Xo‘jayli": [42.4, 59.45],
  "To‘rtko‘l": [42.33, 58.92],
};

const REGION_CENTERS: Record<string, [number, number]> = {
  "Toshkent": [41.2995, 69.2401],
  "Toshkent viloyati": [41.25, 69.35],
  "Samarqand": [39.65, 66.97],
  "Buxoro": [39.768, 64.421],
  "Andijon": [40.782, 72.344],
  "Farg‘ona": [40.384, 71.784],
  "Namangan": [40.998, 71.6726],
  "Xorazm": [41.55, 60.633],
  "Qashqadaryo": [38.861, 65.789],
  "Surxondaryo": [37.224, 67.276],
  "Navoiy": [40.103, 65.373],
  "Jizzax": [39.774, 67.83],
  "Sirdaryo": [40.49, 68.781],
  "Qoraqalpog‘iston": [42.46, 59.616],
};

export function resolveCityCoords(region?: string, city?: string): [number, number] {
  if (city) {
    const key = city.split(',')[0].trim();
    const firstWord = key.split(' ')[0];
    if (CITY_CENTERS[key]) return CITY_CENTERS[key];
    if (CITY_CENTERS[firstWord]) return CITY_CENTERS[firstWord];
  }
  if (region) {
    const key = region.split(',')[0].trim();
    if (REGION_CENTERS[key]) return REGION_CENTERS[key];
  }
  return [41.2995, 69.2401];
}
