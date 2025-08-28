import React, { useEffect, useRef, useState } from 'react';

const InteractiveMap = ({ 
  onLocationSelect, 
  initialLat = 23.5880, 
  initialLng = 58.3829, 
  initialZoom = 13,
  selectedLocation = null 
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    const initMap = async () => {
      try {
        // استخدام CDN لـ Leaflet في التطوير
        if (typeof window !== 'undefined' && !window.L) {
          // إضافة Leaflet من CDN إذا لم يكن موجوداً
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js';
          script.onload = () => {
            // إضافة CSS
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
            document.head.appendChild(link);
          };
          document.head.appendChild(script);
        }

        // انتظار تحميل Leaflet
        const waitForLeaflet = () => {
          return new Promise((resolve) => {
            if (typeof window !== 'undefined' && window.L) {
              resolve(window.L);
            } else {
              setTimeout(() => waitForLeaflet().then(resolve), 100);
            }
          });
        };

        const L = await waitForLeaflet();
        
                 // إصلاح مشكلة أيقونات Leaflet
         delete L.Icon.Default.prototype._getIconUrl;
         L.Icon.Default.mergeOptions({
           iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
           iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
           shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
         });

         // إنشاء الخريطة
         if (!mapInstanceRef.current) {
           mapInstanceRef.current = L.map(mapRef.current).setView([initialLat, initialLng], initialZoom);
          
                     // إضافة طبقة الخريطة الأساسية
           L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
             attribution: '© OpenStreetMap contributors',
             maxZoom: 19,
           }).addTo(mapInstanceRef.current);

           // إضافة طبقة خريطة الأقمار الصناعية
           const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
             attribution: '© Esri',
             maxZoom: 19,
           });

           // إضافة طبقة خريطة الشوارع
           const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
             attribution: '© OpenStreetMap contributors',
             maxZoom: 19,
           });

          // إنشاء مجموعة الطبقات
          const baseMaps = {
            "الخريطة الأساسية": streetLayer,
            "الأقمار الصناعية": satelliteLayer
          };

                     // إضافة التحكم في الطبقات
           L.control.layers(baseMaps).addTo(mapInstanceRef.current);

           // إضافة زر تحديد الموقع الحالي
           const locationButton = L.control({ position: 'topright' });
           locationButton.onAdd = function () {
             const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
            div.innerHTML = `
              <button 
                class="bg-white hover:bg-gray-100 text-gray-700 font-bold py-2 px-3 rounded shadow-lg border border-gray-300 transition-all duration-200 hover:shadow-xl"
                title="تحديد موقعي الحالي"
                style="width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;"
              >
                📍
              </button>
            `;
            
            div.onclick = (e) => {
              e.preventDefault();
              e.stopPropagation();
              getCurrentLocation();
            };
            return div;
          };
          locationButton.addTo(mapInstanceRef.current);

                     // إضافة مؤشر الموقع المحدد
           if (selectedLocation) {
             markerRef.current = L.marker([selectedLocation.lat, selectedLocation.lng], {
               draggable: true,
               icon: L.divIcon({
                 className: 'custom-marker',
                 html: '<div style="background-color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
                 iconSize: [20, 20],
                 iconAnchor: [10, 10]
               })
             }).addTo(mapInstanceRef.current);

            markerRef.current.bindPopup(`
              <div style="text-align: center; font-family: Calibri, Arial, sans-serif;">
                <div style="font-weight: bold; margin-bottom: 5px;">الموقع المحدد</div>
                <div style="font-size: 12px; color: #666;">
                  ${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}
                </div>
              </div>
            `, {
              closeButton: false,
              closeOnClick: false
            });
          }

                     // إضافة مؤشر قابل للسحب إذا لم يكن هناك موقع محدد
           if (!selectedLocation) {
             markerRef.current = L.marker([initialLat, initialLng], {
               draggable: true,
               icon: L.divIcon({
                 className: 'custom-marker',
                 html: '<div style="background-color: #ef4444; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
                 iconSize: [20, 20],
                 iconAnchor: [10, 10]
               })
             }).addTo(mapInstanceRef.current);

            markerRef.current.bindPopup(`
              <div style="text-align: center; font-family: Calibri, Arial, sans-serif;">
                <div style="font-weight: bold; margin-bottom: 5px;">اسحب المؤشر لتحديد موقعك</div>
                <div style="font-size: 12px; color: #666;">
                  ${initialLat.toFixed(6)}, ${initialLng.toFixed(6)}
                </div>
              </div>
            `, {
              closeButton: false,
              closeOnClick: false
            });
          }

                     // إضافة مؤشر الموقع الحالي للمستخدم
           if (userLocation) {
             const userMarker = L.marker([userLocation.lat, userLocation.lng], {
               icon: L.divIcon({
                 className: 'user-location-marker',
                 html: '<div style="background-color: #10b981; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
                 iconSize: [16, 16],
                 iconAnchor: [8, 8]
               })
             }).addTo(mapInstanceRef.current).bindPopup('موقعك الحالي', {
               closeButton: false,
               closeOnClick: false
             });
             
             userMarker.on('click', (e) => {
               if (e.originalEvent) {
                 e.originalEvent.preventDefault();
                 e.originalEvent.stopPropagation();
               }
             });
           }

          // إضافة أحداث النقر والسحب
          mapInstanceRef.current.on('click', handleMapClick);
          mapInstanceRef.current.on('click', (e) => {
            if (e.originalEvent) {
              e.originalEvent.preventDefault();
              e.originalEvent.stopPropagation();
            }
          });
          if (markerRef.current) {
            markerRef.current.on('dragend', handleMarkerDrag);
            markerRef.current.on('click', (e) => {
              if (e.originalEvent) {
                e.originalEvent.preventDefault();
                e.originalEvent.stopPropagation();
              }
            });
          }

          setIsLoading(false);
        }
      } catch (error) {
        console.error('خطأ في تحميل الخريطة:', error);
        setIsLoading(false);
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // تحديث المؤشر عند تغيير الموقع المحدد
  useEffect(() => {
    const updateMarker = async () => {
      if (mapInstanceRef.current && selectedLocation) {
        try {
          // انتظار تحميل Leaflet
          const waitForLeaflet = () => {
            return new Promise((resolve) => {
              if (typeof window !== 'undefined' && window.L) {
                resolve(window.L);
              } else {
                setTimeout(() => waitForLeaflet().then(resolve), 100);
              }
            });
          };

          const L = await waitForLeaflet();
          
          if (markerRef.current) {
            mapInstanceRef.current.removeLayer(markerRef.current);
          }
          
                     markerRef.current = L.marker([selectedLocation.lat, selectedLocation.lng], {
             draggable: true,
             icon: L.divIcon({
               className: 'custom-marker',
               html: '<div style="background-color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
               iconSize: [20, 20],
               iconAnchor: [10, 10]
             })
           }).addTo(mapInstanceRef.current);

          markerRef.current.bindPopup(`
            <div style="text-align: center; font-family: Arial, sans-serif;">
              <div style="font-weight: bold; margin-bottom: 5px;">الموقع المحدد</div>
              <div style="font-size: 12px; color: #666;">
                ${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}
              </div>
            </div>
          `, {
            closeButton: false,
            closeOnClick: false
          });

          markerRef.current.on('dragend', handleMarkerDrag);
          markerRef.current.on('click', (e) => {
            if (e.originalEvent) {
              e.originalEvent.preventDefault();
              e.originalEvent.stopPropagation();
            }
          });
          mapInstanceRef.current.setView([selectedLocation.lat, selectedLocation.lng], 16);
        } catch (error) {
          console.error('خطأ في تحديث المؤشر:', error);
        }
      }
    };
   
    updateMarker();
  }, [selectedLocation]);

  // الحصول على الموقع الحالي للمستخدم
  const getCurrentLocation = async () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            setUserLocation({ lat: latitude, lng: longitude });
            
            // تحريك الخريطة إلى موقع المستخدم
            if (mapInstanceRef.current) {
              mapInstanceRef.current.setView([latitude, longitude], 16);
            }
            
            // إضافة مؤشر موقع المستخدم
            const waitForLeaflet = () => {
              return new Promise((resolve) => {
                if (typeof window !== 'undefined' && window.L) {
                  resolve(window.L);
                } else {
                  setTimeout(() => waitForLeaflet().then(resolve), 100);
                }
              });
            };

            const L = await waitForLeaflet();
            const userMarker = L.marker([latitude, longitude], {
              icon: L.divIcon({
                className: 'user-location-marker',
                html: '<div style="background-color: #10b981; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
                iconSize: [16, 16],
                iconAnchor: [8, 8]
              })
                         }).addTo(mapInstanceRef.current).bindPopup('موقعك الحالي', {
               closeButton: false,
               closeOnClick: false
             });
             
             userMarker.on('click', (e) => {
              if (e.originalEvent) {
                e.originalEvent.preventDefault();
                e.originalEvent.stopPropagation();
              }
            });
            
            setIsLoading(false);
          } catch (error) {
            console.error('خطأ في إضافة مؤشر الموقع الحالي:', error);
            setIsLoading(false);
          }
        },
        (error) => {
          console.error('خطأ في تحديد الموقع:', error);
          setIsLoading(false);
          alert('تعذر تحديد موقعك الحالي. يرجى تحديد الموقع يدوياً على الخريطة.');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    } else {
      alert('متصفحك لا يدعم تحديد الموقع الجغرافي.');
    }
  };

  // معالجة النقر على الخريطة
  const handleMapClick = async (e) => {
    // منع انتشار الحدث لتجنب تداخله مع أحداث النموذج
    e.originalEvent.preventDefault();
    e.originalEvent.stopPropagation();
    
    try {
      const { lat, lng } = e.latlng;
      
      // انتظار تحميل Leaflet
      const waitForLeaflet = () => {
        return new Promise((resolve) => {
          if (typeof window !== 'undefined' && window.L) {
            resolve(window.L);
          } else {
            setTimeout(() => waitForLeaflet().then(resolve), 100);
          }
        });
      };

      const L = await waitForLeaflet();
      
      if (markerRef.current) {
        mapInstanceRef.current.removeLayer(markerRef.current);
      }
      
      markerRef.current = L.marker([lat, lng], {
        draggable: true,
        icon: L.divIcon({
          className: 'custom-marker',
          html: '<div style="background-color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        })
      }).addTo(mapInstanceRef.current);

      markerRef.current.bindPopup(`
        <div style="text-align: center; font-family: Calibri, Arial, sans-serif;">
          <div style="font-weight: bold; margin-bottom: 5px;">الموقع المحدد</div>
          <div style="font-size: 12px; color: #666;">
            ${lat.toFixed(6)}, ${lng.toFixed(6)}
          </div>
        </div>
      `, {
        closeButton: false,
        closeOnClick: false
      });

      markerRef.current.on('dragend', handleMarkerDrag);
      markerRef.current.on('click', (e) => {
        if (e.originalEvent) {
          e.originalEvent.preventDefault();
          e.originalEvent.stopPropagation();
        }
      });
      
      // استدعاء دالة callback مع إحداثيات الموقع
      onLocationSelect({ lat, lng });
    } catch (error) {
      console.error('خطأ في معالجة النقر على الخريطة:', error);
    }
  };

  // معالجة سحب المؤشر
  const handleMarkerDrag = (e) => {
    // منع انتشار الحدث لتجنب تداخله مع أحداث النموذج
    if (e.originalEvent) {
      e.originalEvent.preventDefault();
      e.originalEvent.stopPropagation();
    }
    
    const { lat, lng } = e.target.getLatLng();
    onLocationSelect({ lat, lng });
  };

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">جاري تحميل الخريطة...</p>
          </div>
        </div>
      )}
      
      <div 
        ref={mapRef} 
        className="w-full h-80 rounded-2xl border-2 border-gray-200 shadow-lg"
        style={{ minHeight: '320px' }}
      />
      
      <div className="mt-3 text-center">
        <p className="text-sm text-gray-600 mb-2">
          💡 انقر على الخريطة أو اسحب المؤشر لتحديد موقعك بدقة
        </p>
        <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-sm"></div>
            <span>الموقع المحدد</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
            <span>موقعك الحالي</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveMap;
