export const FUEL_TYPES = ['petrol', 'diesel', 'hybrid', 'electric', 'lpg', 'cng'];
export const TRANSMISSIONS = ['manual', 'automatic', 'cvt', 'semi_auto'];
export const CONDITIONS = ['new', 'used', 'certified'];

export const POPULAR_MAKES = [
  'Toyota','Honda','Hyundai','Kia','Nissan','Mazda','Mitsubishi','BMW','Mercedes-Benz','Audi',
  'Volkswagen','Ford','Chevrolet','Renault','Peugeot','Skoda','Fiat','Suzuki','Jeep','MG',
  'Chery','Geely','Tesla','Lexus','Porsche'
];

export const EG_GOVERNORATES = [
  'Cairo','Giza','Alexandria','Qalyubia','Sharqia','Dakahlia','Gharbia','Monufia','Beheira',
  'Kafr El Sheikh','Damietta','Port Said','Ismailia','Suez','North Sinai','South Sinai',
  'Faiyum','Beni Suef','Minya','Asyut','Sohag','Qena','Luxor','Aswan','Red Sea','New Valley','Matrouh'
];

export const YEARS = (() => {
  const now = new Date().getFullYear();
  const arr = [];
  for (let y = now + 1; y >= 1980; y--) arr.push(y);
  return arr;
})();
