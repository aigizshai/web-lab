// src/components/YandexMap/YandexMap.tsx
import { YMaps, Map, Placemark, Clusterer } from '@pbe/react-yandex-maps';
import type { Event } from '../../../../types/event';
import { parseCoordinates } from '../../../../utils/coordinates';
import styles from './YandexMap.module.scss';

interface YandexMapProps {
  events: Event[];
  center: [number, number];
  zoom: number;
  height?: string;
  selectedEventId?: number | null;
  onPlacemarkClick?: (event: Event) => void;
}

const YandexMap = ({
  events,
  center,
  zoom,
  height = '500px',
  selectedEventId,
  onPlacemarkClick
}: YandexMapProps) => {
  const placemarks = events
    .map(event => {
      const coords = parseCoordinates(event.location);
      if (!coords) return null;

      return {
        event,
        coordinates: [coords.lat, coords.lng] as [number, number]
      };
    })
    .filter(Boolean) as Array<{
      event: Event;
      coordinates: [number, number];
    }>;

  if (placemarks.length === 0) {
    return (
      <div className={styles.emptyMap} style={{ height }}>
        <p>Нет мероприятий с валидными координатами</p>
      </div>
    );
  }

  return (
    <div className={styles.mapContainer} style={{ height }}>
      <YMaps query={{ lang: 'ru_RU', apikey: import.meta.env.VITE_YANDEX_MAPS_API_KEY }}>
        <Map
          state={{ center, zoom }}  // Changed from defaultState to state
        >
          <Clusterer
            options={{
              preset: 'islands#invertedVioletClusterIcons',
              groupByCoordinates: false
            }}
          >
            {placemarks.map(({ event, coordinates }) => {
              const isSelected = selectedEventId === event.id;

              return (
                <Placemark
                  key={event.id}
                  geometry={coordinates}
                  onClick={() => onPlacemarkClick?.(event)}
                  properties={{
                    hintContent: event.title,
                    balloonContent: `
                      <strong>${event.title}</strong><br/>
                      ${event.description}
                    `
                  }}
                  options={{
                    preset: isSelected
                      ? 'islands#redIcon'
                      : 'islands#violetIcon'
                  }}
                />
              );
            })}
          </Clusterer>
        </Map>
      </YMaps>
    </div>
  );
};

export default YandexMap;