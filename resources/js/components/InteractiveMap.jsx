import React, { useEffect, useRef, useState } from 'react';
import { showAlert } from '../utils/popupUtils';

const GOOGLE_MAPS_LIBRARIES = ['maps'];

// دالة callback لتحميل خرائط جوجل
window.initGoogleMaps = () => {
  console.log('تم تحميل خرائط جوجل بنجاح');
};

const InteractiveMap = ({
  onLocationSelect,
  initialLat = 23.5880,
  initialLng = 58.3829,
  initialZoom = 13,
  selectedLocation = null
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadGoogleMapsScript = () => {
    return new Promise((resolve, reject) => {
      if (typeof window !== 'undefined' && window.google && window.google.maps) {
        resolve(window.google);
        return;
      }

      const existingScript = document.getElementById('google-maps-script');
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(window.google));
        existingScript.addEventListener('error', reject);
        return;
      }

      const apiKey = import.meta?.env?.VITE_GOOGLE_MAPS_API_KEY;
      if (!apiKey || apiKey === 'your-google-maps-api-key-here') {
        const error = new Error('مفتاح Google Maps API غير موجود. يرجى إضافة VITE_GOOGLE_MAPS_API_KEY في ملف .env');
        console.error('Missing VITE_GOOGLE_MAPS_API_KEY');
        reject(error);
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-maps-script';
      const params = new URLSearchParams({
        key: apiKey,
        libraries: GOOGLE_MAPS_LIBRARIES.join(','),
        v: 'weekly',
        callback: 'initGoogleMaps',
        language: 'ar',
        region: 'OM'
      });
      script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
      script.async = true;
      script.defer = true;
      
      // تسجيل معلومات الاستدعاء للتشخيص
      console.log('تحميل Google Maps API:', {
        apiKey: apiKey ? `${apiKey.substring(0, 10)}...` : 'غير موجود',
        url: script.src,
        libraries: GOOGLE_MAPS_LIBRARIES
      });
      script.onload = () => {
        // التحقق من أن Google Maps تم تحميله بشكل صحيح
        if (window.google && window.google.maps) {
          console.log('تم تحميل خرائط جوجل بنجاح');
          resolve(window.google);
        } else {
          reject(new Error('فشل في تحميل خرائط جوجل - API غير متاح'));
        }
      };
      script.onerror = (error) => {
        console.error('خطأ في تحميل خرائط جوجل:', error);
        reject(new Error('فشل في تحميل خرائط جوجل. تحقق من مفتاح API والاتصال بالإنترنت.'));
      };
      document.head.appendChild(script);
    });
  };

  useEffect(() => {
    let mapClickListener = null;
    let markerDragListener = null;

    const initMap = async () => {
      try {
        const google = await loadGoogleMapsScript();

        // التحقق من أن Google Maps متاح
        if (!google || !google.maps) {
          throw new Error('خرائط جوجل غير متاحة');
        }

        if (!mapInstanceRef.current && mapContainerRef.current) {
          mapInstanceRef.current = new google.maps.Map(mapContainerRef.current, {
            center: { lat: initialLat, lng: initialLng },
            zoom: initialZoom,
            mapTypeControl: true,
            streetViewControl: false,
            fullscreenControl: false,
          });

          // زر تحديد الموقع الحالي
          const locateButton = document.createElement('button');
          locateButton.title = 'تحديد موقعي الحالي';
          locateButton.textContent = '📍';
          locateButton.style.width = '44px';
          locateButton.style.height = '44px';
          locateButton.style.backgroundColor = 'white';
          locateButton.style.color = '#374151';
          locateButton.style.fontWeight = 'bold';
          locateButton.style.border = '2px solid #d1d5db';
          locateButton.style.borderRadius = '8px';
          locateButton.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
          locateButton.style.display = 'flex';
          locateButton.style.alignItems = 'center';
          locateButton.style.justifyContent = 'center';
          locateButton.style.fontSize = '18px';
          locateButton.style.cursor = 'pointer';
          locateButton.style.transition = 'all 0.2s ease';
          locateButton.style.margin = '10px';
          locateButton.onmouseover = () => {
            locateButton.style.backgroundColor = '#f3f4f6';
            locateButton.style.transform = 'scale(1.05)';
          };
          locateButton.onmouseout = () => {
            locateButton.style.backgroundColor = 'white';
            locateButton.style.transform = 'scale(1)';
          };
          locateButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            getCurrentLocation();
          });
          mapInstanceRef.current.controls[google.maps.ControlPosition.TOP_RIGHT].push(locateButton);

          // إنشاء مؤشر ابتدائي
          const initial = selectedLocation || { lat: initialLat, lng: initialLng };
          markerRef.current = new google.maps.Marker({
            position: initial,
            map: mapInstanceRef.current,
            draggable: true,
          });

          // أحداث الخريطة
          mapClickListener = mapInstanceRef.current.addListener('click', (e) => {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            placeMarker({ lat, lng });
            onLocationSelect({ lat, lng });
          });

          markerDragListener = markerRef.current.addListener('dragend', () => {
            const pos = markerRef.current.getPosition();
            const lat = pos.lat();
            const lng = pos.lng();
            onLocationSelect({ lat, lng });
          });
        }

        setIsLoading(false);
      } catch (err) {
        console.error('خطأ في تحميل خرائط جوجل:', err);
        showAlert(
          err.message || 'حدث خطأ في تحميل الخريطة. يرجى التحقق من الاتصال بالإنترنت وإعدادات API.',
          'خطأ في الخريطة',
          'error'
        );
        setIsLoading(false);
      }
    };

    initMap();

    return () => {
      if (mapClickListener) mapClickListener.remove();
      if (markerDragListener) markerDragListener.remove();
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !selectedLocation) return;
    placeMarker(selectedLocation);
    mapInstanceRef.current.setCenter(selectedLocation);
    mapInstanceRef.current.setZoom(16);
  }, [selectedLocation]);

  const placeMarker = (position) => {
    if (!mapInstanceRef.current || !window.google) return;
    if (!markerRef.current) {
      markerRef.current = new window.google.maps.Marker({
        map: mapInstanceRef.current,
        draggable: true,
      });
      markerRef.current.addListener('dragend', () => {
        const pos = markerRef.current.getPosition();
        onLocationSelect({ lat: pos.lat(), lng: pos.lng() });
      });
    }
    markerRef.current.setPosition(position);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      showAlert('متصفحك لا يدعم تحديد الموقع الجغرافي.', 'خطأ في الموقع', 'error');
      return;
    }
    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const coords = { lat: latitude, lng: longitude };
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setCenter(coords);
          mapInstanceRef.current.setZoom(16);
        }
        placeMarker(coords);
        onLocationSelect(coords);
        setIsLoading(false);
      },
      (err) => {
        console.error('خطأ في تحديد الموقع:', err);
        setIsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  };

  return (
    <div className="relative" style={{ position: 'relative', zIndex: 1 }}>
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">جاري تحميل الخريطة...</p>
          </div>
        </div>
      )}

      <div
        ref={mapContainerRef}
        className="w-full h-80 rounded-2xl border-2 border-gray-200 shadow-lg"
        style={{ minHeight: '320px', position: 'relative', zIndex: 1 }}
      />

      <div className="mt-3 text-center">
        <p className="text-sm text-gray-600 mb-2">💡 انقر على الخريطة أو اسحب المؤشر لتحديد موقعك بدقة</p>
        <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-sm"></div>
            <span>الموقع المحدد</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveMap;
