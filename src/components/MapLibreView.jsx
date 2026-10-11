import { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './maplibre.css';

const INITIAL_CENTER = [106.702, 10.759];
const STYLE_URL = import.meta.env.VITE_MAP_STYLE_URL || 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

function buildGeoJson(pois) {
  return {
    type: 'FeatureCollection',
    features: pois.map((poi) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: poi.coordinates },
      properties: { id: poi.id, name: poi.name, category: poi.category, status: poi.status },
    })),
  };
}

export default function MapLibreView({ pois, selectedId, onSelect, onMapReady }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const onSelectRef = useRef(onSelect);
  const initializedRef = useRef(false);

  useEffect(() => { onSelectRef.current = onSelect; }, [onSelect]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || mapRef.current || initializedRef.current) return undefined;
    if (container.clientWidth === 0 || container.clientHeight === 0) return undefined;

    initializedRef.current = true;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE_URL,
      center: INITIAL_CENTER,
      zoom: 14.2,
      minZoom: 11,
      maxZoom: 19,
      attributionControl: false,
    });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

    map.on('load', () => {
      map.addSource('pois', { type: 'geojson', data: buildGeoJson([]), cluster: true, clusterRadius: 44, clusterMaxZoom: 16 });
      map.addLayer({ id: 'poi-clusters', type: 'circle', source: 'pois', filter: ['has', 'point_count'], paint: { 'circle-color': '#ea580c', 'circle-radius': ['step', ['get', 'point_count'], 18, 5, 22, 12, 28], 'circle-stroke-width': 2, 'circle-stroke-color': '#fff' } });
      map.addLayer({ id: 'poi-cluster-count', type: 'symbol', source: 'pois', filter: ['has', 'point_count'], layout: { 'text-field': '{point_count_abbreviated}', 'text-size': 12 }, paint: { 'text-color': '#fff' } });
      map.addLayer({ id: 'poi-points', type: 'circle', source: 'pois', filter: ['!', ['has', 'point_count']], paint: { 'circle-radius': 9, 'circle-color': ['match', ['get', 'status'], 'offline', '#dc2626', 'hybrid', '#d97706', '#16a34a'], 'circle-stroke-width': 3, 'circle-stroke-color': '#fff' } });
      map.addLayer({ id: 'poi-labels', type: 'symbol', source: 'pois', filter: ['!', ['has', 'point_count']], layout: { 'text-field': ['get', 'name'], 'text-font': ['Open Sans Regular'], 'text-size': 11, 'text-offset': [0, 1.5], 'text-anchor': 'top', 'text-max-width': 12 }, paint: { 'text-color': '#172033', 'text-halo-color': '#fff', 'text-halo-width': 1.5 } });
      map.on('click', 'poi-points', (event) => {
        const id = event.features?.[0]?.properties?.id;
        if (id) onSelectRef.current(id);
      });
      map.on('click', 'poi-clusters', (event) => {
        const feature = map.queryRenderedFeatures(event.point, { layers: ['poi-clusters'] })[0];
        const clusterId = feature?.properties?.cluster_id;
        const source = map.getSource('pois');
        if (clusterId !== undefined) source.getClusterExpansionZoom(clusterId, (error, zoom) => {
          if (!error) map.easeTo({ center: feature.geometry.coordinates, zoom });
        });
      });
      map.on('mouseenter', 'poi-points', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'poi-points', () => { map.getCanvas().style.cursor = ''; });
      onMapReady?.(map);
    });
    map.on('error', (event) => console.warn('MapLibre runtime error:', event.error?.message || event.error));

    // Ensure map renders after initial layout
    requestAnimationFrame(() => map.resize());

    return () => {
      map.remove();
      mapRef.current = null;
      initializedRef.current = false;
    };
  }, [onMapReady]);

  useEffect(() => {
    const source = mapRef.current?.getSource('pois');
    if (source) source.setData(buildGeoJson(pois));
  }, [pois]);

  useEffect(() => {
    if (!selectedId) return;
    const poi = pois.find((item) => item.id === selectedId);
    if (poi && poi.coordinates) mapRef.current?.flyTo({ center: poi.coordinates, zoom: 16, duration: 650, essential: true });
  }, [selectedId, pois]);

  return <div className="maplibre-canvas" ref={containerRef} aria-label="Bản đồ các địa điểm ẩm thực Quận 4" role="application" />;
}
