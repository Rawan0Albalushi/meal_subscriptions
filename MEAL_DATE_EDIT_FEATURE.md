# ميزة تعديل تاريخ الوجبات

## نظرة عامة
تم إضافة ميزة تسمح للعملاء بتعديل تاريخ كل وجبة في صفحة تفاصيل المطعم بعد اختيار التاريخ ونوع الوجبة.

## الميزات المضافة

### 1. زر تعديل التاريخ
- زر "تعديل" يظهر بجانب عنوان كل وجبة (الوجبة الأولى، الوجبة الثانية، إلخ)
- تصميم جميل مع أيقونة تقويم
- تأثيرات hover تفاعلية

### 2. نافذة اختيار التاريخ المحسنة
- Modal أنيق يعرض التاريخ المختار مسبقاً
- تصميم متجاوب يعمل على جميع الأجهزة
- خلفية ضبابية مع تأثير blur
- animation slideInUp للظهور
- رسائل توضيحية للقيود
- زر إعادة تعيين لإزالة التاريخ المخصص

### 3. مؤشر التاريخ المخصص
- علامة "مخصص" تظهر بجانب التواريخ التي تم تعديلها
- تصميم gradient جميل
- يظهر باللغة العربية والإنجليزية

### 4. تحديث فوري للعرض
- التواريخ تتحدث فورياً في الواجهة
- لا حاجة لإعادة تحميل الصفحة
- حفظ التغييرات في state

### 5. Validation متقدم
- منع اختيار الخميس والجمعة والسبت
- منع اختيار تاريخ اليوم
- رسائل خطأ واضحة بالعربية والإنجليزية
- استخدام نفس validation المستخدم في تاريخ البداية

### 6. زر إعادة تعيين
- إمكانية إزالة التاريخ المخصص
- العودة للتاريخ الأصلي
- تصميم زر أحمر للوضوح

## التطبيق التقني

### State Management
```javascript
const [customMealDates, setCustomMealDates] = useState({});
const [editingMealDate, setEditingMealDate] = useState(null);
const [showDatePicker, setShowDatePicker] = useState(false);
```

### دوال التحديث
```javascript
// دالة لتحديث تاريخ وجبة معينة مع validation
const updateMealDate = (mealKey, newDate) => {
  if (!newDate) return;
  
  // استخدام نفس validation المستخدم في تاريخ البداية
  if (isValidWeekday(newDate)) {
    setCustomMealDates(prev => ({
      ...prev,
      [mealKey]: newDate
    }));
    setEditingMealDate(null);
    setShowDatePicker(false);
  } else {
    // عرض رسالة خطأ
    const date = new Date(newDate);
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    const isToday = newDate === todayString;
    const isWeekend = date.getDay() === 5 || date.getDay() === 6;
    
    if (isToday) {
      alert(language === 'ar' ? 'لا يمكن اختيار تاريخ اليوم - يجب اختيار تاريخ من الغد فما بعد' : 'Cannot select today\'s date - Please select a date from tomorrow onwards');
    } else if (isWeekend) {
      alert(language === 'ar' ? 'لا يمكن اختيار الخميس أو الجمعة أو السبت - يجب اختيار يوم من الأحد إلى الأربعاء' : 'Cannot select Thursday, Friday, or Saturday - Please select a day from Sunday to Wednesday');
    } else {
      alert(language === 'ar' ? 'لا يمكن اختيار الخميس أو الجمعة أو السبت - يجب اختيار يوم من الأحد إلى الأربعاء' : 'Cannot select Thursday, Friday, or Saturday - Please select a day from Sunday to Wednesday');
    }
  }
};

// دالة لفتح محرر التاريخ
const openDateEditor = (mealKey) => {
  setEditingMealDate(mealKey);
  setShowDatePicker(true);
};

// دالة لإغلاق محرر التاريخ
const closeDateEditor = () => {
  setEditingMealDate(null);
  setShowDatePicker(false);
};
```

### تحديث منطق عرض التواريخ
```javascript
const mealKey = dayKeys[mealIndex];
const customDate = customMealDates[mealKey];
const finalDate = customDate ? new Date(customDate) : currentDate;

days.push({
  key: dayKeys[mealIndex],
  label: mealLabels[mealIndex],
  icon: mealIcons[mealIndex],
  date: finalDate.toISOString().split('T')[0],
  displayDate: finalDate.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    calendar: 'gregory'
  }),
  weekNumber: Math.floor(mealIndex / 4) + 1,
  dayOfWeek: dayOfWeek,
  hasCustomDate: !!customDate
});
```

### زر التعديل
```javascript
<button
  onClick={() => openDateEditor(day.key)}
  style={{
    background: 'linear-gradient(135deg, #2f6e73, #4a8a8f)',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    padding: '0.375rem 0.75rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    boxShadow: '0 2px 8px rgba(47, 110, 115, 0.3)'
  }}
>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
  </svg>
  {language === 'ar' ? 'تعديل' : 'Edit'}
</button>
```

### Modal التاريخ المحسن
```javascript
{showDatePicker && editingMealDate && (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)'
  }}>
    <div style={{
      background: 'white',
      borderRadius: '1rem',
      padding: '2rem',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
      maxWidth: '400px',
      width: '90%',
      animation: 'slideInUp 0.3s ease-out'
    }}>
      <h3 style={{
        fontSize: '1.25rem',
        fontWeight: '700',
        color: '#2f6e73',
        margin: '0 0 1rem 0',
        textAlign: 'center'
      }}>
        {language === 'ar' ? 'اختر تاريخ جديد للوجبة' : 'Choose New Date for Meal'}
      </h3>
      
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{
          display: 'block',
          fontSize: '0.875rem',
          fontWeight: '600',
          color: '#374151',
          marginBottom: '0.5rem'
        }}>
          {language === 'ar' ? 'التاريخ الجديد:' : 'New Date:'}
        </label>
        <div style={{
          fontSize: '0.75rem',
          color: '#6b7280',
          marginBottom: '0.75rem',
          padding: '0.5rem',
          background: '#f3f4f6',
          borderRadius: '0.375rem',
          border: '1px solid #e5e7eb'
        }}>
          {language === 'ar' 
            ? '⚠️ يمكن اختيار أيام الأحد إلى الأربعاء فقط (لا يمكن اختيار الخميس، الجمعة، السبت أو تاريخ اليوم)'
            : '⚠️ You can only select days from Sunday to Wednesday (Cannot select Thursday, Friday, Saturday or today\'s date)'
          }
        </div>
        <input
          type="date"
          value={customMealDates[editingMealDate] || ''}
          min={getNextValidDate()}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '2px solid #e5e7eb',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            outline: 'none',
            transition: 'border-color 0.3s ease',
            background: '#f9fafb'
          }}
          onChange={(e) => {
            const selectedDate = e.target.value;
            if (selectedDate) {
              updateMealDate(editingMealDate, selectedDate);
            }
          }}
        />
      </div>
      
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        justifyContent: 'center'
      }}>
        <button
          onClick={closeDateEditor}
          style={{
            background: '#f3f4f6',
            color: '#374151',
            border: 'none',
            borderRadius: '0.5rem',
            padding: '0.75rem 1.5rem',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          {language === 'ar' ? 'إلغاء' : 'Cancel'}
        </button>
        
        {customMealDates[editingMealDate] && (
          <button
            onClick={() => {
              setCustomMealDates(prev => {
                const newDates = { ...prev };
                delete newDates[editingMealDate];
                return newDates;
              });
              setEditingMealDate(null);
              setShowDatePicker(false);
            }}
            style={{
              background: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            {language === 'ar' ? 'إعادة تعيين' : 'Reset'}
          </button>
        )}
      </div>
    </div>
  </div>
)}
```

## كيفية الاستخدام

1. **اختيار المطعم والاشتراك**: اختر المطعم ونوع الاشتراك والتاريخ
2. **الانتقال لقسم الوجبات**: في قسم عرض الوجبات، ستجد أزرار "تعديل" بجانب عناوين الوجبات
3. **تعديل التاريخ**: اضغط على زر "تعديل" للوجبة التي تريد تغيير تاريخها
4. **اختيار التاريخ الجديد**: اختر التاريخ الجديد من النافذة المنبثقة
5. **التأكيد**: سيتم تحديث التاريخ فورياً مع ظهور علامة "مخصص"

## المميزات

- ✅ **سهولة الاستخدام**: واجهة بديهية وسهلة
- ✅ **تصميم جميل**: ألوان متسقة مع التصميم العام
- ✅ **متجاوب**: يعمل على جميع الأجهزة
- ✅ **تفاعلي**: تحديث فوري للعرض
- ✅ **متعدد اللغات**: دعم العربية والإنجليزية
- ✅ **Validation**: منع اختيار تواريخ في الماضي

## الملفات المعدلة

- `resources/js/pages/Customer/RestaurantDetail.jsx` - الملف الرئيسي للميزة

## الاختبار

تم إنشاء ملف اختبار: `test_meal_date_edit.html` لاختبار الميزة الجديدة.

## الخلاصة

تم إضافة ميزة تعديل تاريخ الوجبات بنجاح، مما يسمح للعملاء بتخصيص تواريخ وجباتهم حسب احتياجاتهم. الميزة تتميز بتصميم جميل وسهولة في الاستخدام.
