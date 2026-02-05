// src/utils/coordinates.ts
/**
 * Преобразует строку координат в объект с lat и lng
 * @param locationString - строка формата "55.684758, 37.738521"
 */


export const parseCoordinates = (
    location: string
  ): { lat: number; lng: number } | null => {
    if (!location) return null;
  
    const parts = location.split(',').map(p => p.trim());
    if (parts.length !== 2) return null;
  
    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);
  
    if (isNaN(lat) || isNaN(lng)) return null;
    if (lat < -90 || lat > 90) return null;
    if (lng < -180 || lng > 180) return null;
  
    return { lat, lng };
  };
  
// export const parseCoordinates = (locationString: string): { lat: number; lng: number } | null => {
//     if (!locationString) return null;
    
//     // Убираем возможные пробелы и преобразуем в числа
//     const parts = locationString.split(',').map(part => part.trim());
    
//     if (parts.length !== 2) {
//       console.warn(`Некорректный формат координат: ${locationString}`);
//       return null;
//     }
    
//     const lat = parseFloat(parts[0]);
//     const lng = parseFloat(parts[1]);
    
//     // Проверяем, что это валидные координаты
//     if (isNaN(lat) || isNaN(lng)) {
//       console.warn(`Некорректные числовые значения в координатах: ${locationString}`);
//       return null;
//     }
    
//     if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
//       console.warn(`Координаты вне допустимого диапазона: ${locationString}`);
//       return null;
//     }
    
//     return { lat, lng };
//   };
  
//   /**
//    * Валидирует строку координат
//    */
//   export const isValidCoordinateString = (locationString: string): boolean => {
//     const coords = parseCoordinates(locationString);
//     return coords !== null;
//   };
  
//   /**
//    * Вычисляет центр карты на основе массива мероприятий
//    */
//   export const calculateMapCenter = (events: Array<{ location: string }>): [number, number] => {
//     const validCoords = events
//       .map(event => parseCoordinates(event.location))
//       .filter(Boolean) as Array<{ lat: number; lng: number }>;
    
//     if (validCoords.length === 0) {
//       // Москва по умолчанию
//       return [55.7558, 37.6173];
//     }
    
//     const totalLat = validCoords.reduce((sum, coord) => sum + coord.lat, 0);
//     const totalLng = validCoords.reduce((sum, coord) => sum + coord.lng, 0);
    
//     return [totalLat / validCoords.length, totalLng / validCoords.length];
//   };
  
//   /**
//    * Преобразует координаты в массив для Яндекс.Карт
//    */
//   export const coordinatesToArray = (locationString: string): [number, number] | null => {
//     const coords = parseCoordinates(locationString);
//     return coords ? [coords.lat, coords.lng] : null;
//   };