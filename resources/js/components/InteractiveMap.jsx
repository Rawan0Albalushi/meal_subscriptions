import React, { useEffect, useRef, useState } from 'react';
import { showAlert } from '../utils/popupUtils';

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
          const layerControl = L.control.layers(baseMaps).addTo(mapInstanceRef.current);
          
          // تحسين التحكم في الطبقات للهاتف
          setTimeout(() => {
            const layerControlContainer = layerControl.getContainer();
            if (layerControlContainer) {
              layerControlContainer.style.zIndex = '1000';
              layerControlContainer.style.position = 'relative';
              
              if (window.innerWidth <= 768) {
                layerControlContainer.style.fontSize = '14px';
                layerControlContainer.style.padding = '8px';
                layerControlContainer.style.borderRadius = '8px';
                layerControlContainer.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                layerControlContainer.style.minWidth = '120px';
              }
            }
          }, 100);

          // إضافة زر تحديد الموقع الحالي
          const locationButton = L.control({ position: 'topright' });
          locationButton.onAdd = function () {
            const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
           div.innerHTML = `
             <button 
               title="تحديد موقعي الحالي"
               style="
                 width: 44px; 
                 height: 44px; 
                 background-color: white; 
                 color: #374151; 
                 font-weight: bold; 
                 border: 2px solid #d1d5db; 
                 border-radius: 8px; 
                 box-shadow: 0 4px 12px rgba(0,0,0,0.15); 
                 display: flex; 
                 align-items: center; 
                 justify-content: center; 
                 font-size: 18px; 
                 cursor: pointer;
                 transition: all 0.2s ease;
                 z-index: 1000;
               "
               onmouseover="this.style.backgroundColor='#f3f4f6'; this.style.transform='scale(1.05)'"
               onmouseout="this.style.backgroundColor='white'; this.style.transform='scale(1)'"
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

         // تحسين الزر للهاتف
         setTimeout(() => {
           const buttonElement = locationButton.getContainer()?.querySelector('button');
           if (buttonElement) {
             // إضافة touch events للهاتف
             buttonElement.addEventListener('touchstart', (e) => {
               e.preventDefault();
               buttonElement.style.backgroundColor = '#f3f4f6';
               buttonElement.style.transform = 'scale(1.05)';
             });
             
             buttonElement.addEventListener('touchend', (e) => {
               e.preventDefault();
               buttonElement.style.backgroundColor = 'white';
               buttonElement.style.transform = 'scale(1)';
             });
             
             // تحسين الحجم والموضع للهاتف
             if (window.innerWidth <= 768) {
               buttonElement.style.width = '48px';
               buttonElement.style.height = '48px';
               buttonElement.style.fontSize = '20px';
               buttonElement.style.borderRadius = '10px';
               buttonElement.style.zIndex = '1000';
               buttonElement.style.position = 'relative';
             }
             
             // تحسين z-index للعنصر الأب
             const container = locationButton.getContainer();
             if (container) {
               container.style.zIndex = '1000';
               container.style.position = 'relative';
             }
           }
         }, 100);

                     // إضافة مؤشر الموقع المحدد
           if (selectedLocation) {
             markerRef.current = L.marker([selectedLocation.lat, selectedLocation.lng], {
               draggable: true,
               icon: L.divIcon({
                 className: 'custom-marker',
                 html: '<div style="background-color: #2f6e73; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
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
                 html: '<div style="background-color: #b65449; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
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
                 html: '<div style="background-color: #4a8a8f; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
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
               html: '<div style="background-color: #2f6e73; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
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
                html: '<div style="background-color: #4a8a8f; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
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
          // You can add a state for showing error message here instead of alert
          console.log('تعذر تحديد موقعك الحالي. يرجى تحديد الموقع يدوياً على الخريطة.');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    } else {
      showAlert('متصفحك لا يدعم تحديد الموقع الجغرافي.', 'خطأ في الموقع', 'error');
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
    <div className="relative" style={{
      position: 'relative',
      zIndex: 1
    }}>
      <style jsx>{`
        .leaflet-control-container {
          z-index: 1000 !important;
        }
        .leaflet-control {
          z-index: 1000 !important;
        }
        .leaflet-control-layers {
          z-index: 1000 !important;
        }
        .leaflet-control-layers-toggle {
          z-index: 1000 !important;
        }
        @media (max-width: 768px) {
          .leaflet-control {
            font-size: 14px !important;
          }
          .leaflet-control-layers {
            font-size: 14px !important;
            min-width: 120px !important;
          }
        }
      `}</style>
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
          <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-2" style={{
                    borderBottomColor: '#2f6e73'
                }}></div>
            <p className="text-sm text-gray-600">جاري تحميل الخريطة...</p>
          </div>
        </div>
      )}
      
      <div 
        ref={mapRef} 
        className="w-full h-80 rounded-2xl border-2 border-gray-200 shadow-lg"
        style={{ 
          minHeight: '320px',
          position: 'relative',
          zIndex: 1
        }}
      />
      
      <div className="mt-3 text-center" style={{
        '@media (max-width: 768px)': {
          marginTop: '0.75rem'
        }
      }}>
        <p className="text-sm text-gray-600 mb-2" style={{
          '@media (max-width: 768px)': {
            fontSize: '0.875rem',
            marginBottom: '0.75rem'
          }
        }}>
          💡 انقر على الخريطة أو اسحب المؤشر لتحديد موقعك بدقة
        </p>
        <div className="flex items-center justify-center gap-4 text-xs text-gray-500" style={{
          '@media (max-width: 768px)': {
            flexDirection: 'column',
            gap: '0.5rem',
            fontSize: '0.75rem'
          }
        }}>
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
