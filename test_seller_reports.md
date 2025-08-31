# Test Guide for Seller Reports Page

## Overview
This guide provides instructions for testing the new Seller Reports page functionality.

## Features to Test

### 1. Navigation
- [ ] Navigate to `/seller/reports` from the seller dashboard
- [ ] Verify the "التقارير" (Reports) menu item appears in the sidebar
- [ ] Check that the page loads without errors

### 2. Page Layout
- [ ] Verify the page header displays "التقارير والإحصائيات" (Reports & Analytics)
- [ ] Check that the description text is visible
- [ ] Verify the period filter dropdown (اليوم، هذا الأسبوع، هذا الشهر، هذا العام)
- [ ] Verify the restaurant filter dropdown shows all seller's restaurants

### 3. Period Summary Section
- [ ] Check that the period summary card displays correctly
- [ ] Verify the 4 metric cards show:
  - الإيرادات (Revenue)
  - الطلبات (Orders)
  - الاشتراكات النشطة (Active Subscriptions)
  - الوجبات المتاحة (Available Meals)
- [ ] Verify values update when changing the period filter

### 4. Stats Cards
- [ ] Verify 4 main stats cards display:
  - إجمالي الإيرادات (Total Revenue)
  - الطلبات النشطة (Active Orders)
  - الوجبات المتاحة (Available Meals)
  - المطاعم النشطة (Active Restaurants)
- [ ] Check that each card shows the correct icon and color gradient
- [ ] Verify the percentage change indicators

### 5. Recent Orders Section
- [ ] Check that recent orders are displayed in a list
- [ ] Verify each order shows:
  - Customer name
  - Restaurant name
  - Delivery date
  - Total amount
  - Status
- [ ] Verify the section shows "لا توجد طلبات حديثة" when no orders exist

### 6. Top Meals Section
- [ ] Check that top meals are displayed in a ranked list
- [ ] Verify each meal shows:
  - Rank number (#1, #2, etc.)
  - Meal name
  - Restaurant name
  - Order count
  - Total revenue
- [ ] Verify the section shows "لا توجد بيانات للوجبات" when no data exists

### 7. Filtering Functionality
- [ ] Test period filter changes:
  - اليوم (Today)
  - هذا الأسبوع (This Week)
  - هذا الشهر (This Month)
  - هذا العام (This Year)
- [ ] Test restaurant filter:
  - جميع المطاعم (All Restaurants)
  - Individual restaurant selection
- [ ] Verify data updates when filters change

### 8. API Integration
- [ ] Check browser network tab for API calls to `/api/seller/reports`
- [ ] Verify the API returns the expected data structure
- [ ] Test with different query parameters (period, restaurant_id)

### 9. Responsive Design
- [ ] Test on mobile devices
- [ ] Verify layout adapts to different screen sizes
- [ ] Check that all elements are properly aligned and readable

### 10. Error Handling
- [ ] Test with no restaurants (new seller)
- [ ] Test with no orders/subscriptions
- [ ] Verify appropriate empty states are shown
- [ ] Check error handling for API failures

## API Endpoint Testing

### GET /api/seller/reports
**Parameters:**
- `period` (optional): today, week, month, year (default: month)
- `restaurant_id` (optional): specific restaurant ID or 'all' (default: all)

**Expected Response:**
```json
{
  "success": true,
  "reports": {
    "revenue": {
      "total": 0,
      "period": 0,
      "today": 0,
      "thisWeek": 0,
      "thisMonth": 0
    },
    "orders": {
      "total": 0,
      "period": 0,
      "today": 0,
      "thisWeek": 0,
      "thisMonth": 0
    },
    "subscriptions": {
      "total": 0,
      "active": 0,
      "completed": 0,
      "cancelled": 0
    },
    "restaurants": {
      "total": 0,
      "active": 0
    },
    "meals": {
      "total": 0,
      "available": 0
    }
  },
  "recentOrders": [],
  "topMeals": []
}
```

## Test Data Setup

To test with real data, ensure you have:
1. A seller account with restaurants
2. Some meals added to restaurants
3. Subscription types created
4. Customer subscriptions with subscription items
5. Various order statuses (pending, preparing, delivered, cancelled)

## Common Issues to Check

1. **Empty Data**: Verify the page handles sellers with no restaurants gracefully
2. **Date Formatting**: Check that dates are displayed in the correct locale format
3. **Currency Formatting**: Verify SAR currency is displayed correctly
4. **Loading States**: Check that loading indicators work properly
5. **Authentication**: Ensure only authenticated sellers can access the page

## Browser Compatibility

Test in:
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Testing

- [ ] Check page load time
- [ ] Verify API response times
- [ ] Test with large datasets
- [ ] Check memory usage

## Security Testing

- [ ] Verify seller can only see their own data
- [ ] Test with different user roles (customer, admin)
- [ ] Check for SQL injection vulnerabilities
- [ ] Verify proper authentication middleware
