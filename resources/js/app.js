import './bootstrap';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app.jsx';

// Hide scrollbar on button press
document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners to all buttons and interactive elements
    const interactiveElements = document.querySelectorAll(`
        button, 
        .btn, 
        .navbar-btn, 
        .hero-btn, 
        .feature-btn, 
        .payment-button-elegant, 
        .subscription-card, 
        .card, 
        .interactive-element, 
        .mobile-menu-item, 
        .sidebar-item, 
        .dropdown-item, 
        .nav-link, 
        .status-badge, 
        .order-status-badge, 
        .map-control-button,
        .leaflet-control-zoom a,
        [role="button"],
        [tabindex="0"],
        .meal-type-button,
        .meal-filter-button,
        .meal-type-dropdown,
        [data-meal-type],
        .meal-type-selection,
        .subscription-type-container,
        .meal-selection-container,
        .meal-type-filter,
        .meal-type-container,
        .meals-container,
        .meal-selection-container,
        .meal-filter-container,
        .meal-filter-buttons,
        .meal-type-selection,
        .meal-type-dropdown,
        .meal-type-button,
        .meal-filter-button,
        [data-meal-type],
        .meal-type-selection,
        .meal-type-filter,
        .meal-type-container,
        .meal-selection-container,
        .meals-container
    `);

    interactiveElements.forEach(element => {
        // Add mousedown event to hide scrollbar
        element.addEventListener('mousedown', function() {
            document.body.classList.add('button-pressed');
            
            // Add class to parent containers
            const containers = this.closestAll('.container, .restaurant-detail-container, .subscription-grid, .meals-grid, .navbar-glass, .sidebar-enhanced');
            containers.forEach(container => {
                container.classList.add('button-pressed');
            });
        });

        // Remove classes on mouseup
        element.addEventListener('mouseup', function() {
            document.body.classList.remove('button-pressed');
            
            // Remove class from parent containers
            const containers = this.closestAll('.container, .restaurant-detail-container, .subscription-grid, .meals-grid, .navbar-glass, .sidebar-enhanced');
            containers.forEach(container => {
                container.classList.remove('button-pressed');
            });
        });

        // Remove classes on mouseleave (in case mouse leaves while pressed)
        element.addEventListener('mouseleave', function() {
            document.body.classList.remove('button-pressed');
            
            // Remove class from parent containers
            const containers = this.closestAll('.container, .restaurant-detail-container, .subscription-grid, .meals-grid, .navbar-glass, .sidebar-enhanced');
            containers.forEach(container => {
                container.classList.remove('button-pressed');
            });
        });

        // Touch events for mobile devices
        element.addEventListener('touchstart', function() {
            document.body.classList.add('button-pressed');
            
            // Add class to parent containers
            const containers = this.closestAll('.container, .restaurant-detail-container, .subscription-grid, .meals-grid, .navbar-glass, .sidebar-enhanced');
            containers.forEach(container => {
                container.classList.add('button-pressed');
            });
        });

        element.addEventListener('touchend', function() {
            document.body.classList.remove('button-pressed');
            
            // Remove class from parent containers
            const containers = this.closestAll('.container, .restaurant-detail-container, .subscription-grid, .meals-grid, .navbar-glass, .sidebar-enhanced');
            containers.forEach(container => {
                container.classList.remove('button-pressed');
            });
        });
    });

    // Add closestAll polyfill if not exists
    if (!Element.prototype.closestAll) {
        Element.prototype.closestAll = function(selectors) {
            const elements = [];
            let element = this;
            
            while (element && element !== document) {
                if (element.matches(selectors)) {
                    elements.push(element);
                }
                element = element.parentElement;
            }
            
            return elements;
        };
    }

    // Prevent all automatic scrolling
    const preventAutoScroll = (event) => {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return false;
    };

    // Prevent all automatic scrolling globally
    const preventAllAutoScroll = () => {
        // Override all scroll methods
        const originalScrollIntoView = Element.prototype.scrollIntoView;
        Element.prototype.scrollIntoView = function(options) {
            // Prevent any scrolling
            return false;
        };

        const originalScrollTo = window.scrollTo;
        window.scrollTo = function(options) {
            // Prevent any scrolling
            return false;
        };

        const originalScrollBy = window.scrollBy;
        window.scrollBy = function(options) {
            // Prevent any scrolling
            return false;
        };

        const originalScroll = window.scroll;
        window.scroll = function(options) {
            // Prevent any scrolling
            return false;
        };

        // Override any other scroll methods
        if (window.scrollIntoViewIfNeeded) {
            window.scrollIntoViewIfNeeded = function() {
                return false;
            };
        }

        if (window.scrollIntoViewIfNeeded) {
            Element.prototype.scrollIntoViewIfNeeded = function() {
                return false;
            };
        }
    };

    // Call the function to prevent all auto scroll
    preventAllAutoScroll();

    // Add event listeners to prevent auto-scroll on all elements
    const events = ['click', 'mousedown', 'mouseup', 'touchstart', 'touchend', 'focus', 'blur', 'change', 'input', 'submit', 'keydown', 'keyup', 'keypress', 'wheel', 'scroll', 'resize', 'load', 'unload', 'beforeunload', 'DOMContentLoaded', 'readystatechange'];
    
    events.forEach(eventType => {
        document.addEventListener(eventType, preventAutoScroll, true);
        window.addEventListener(eventType, preventAutoScroll, true);
    });

    // Override scrollIntoView to prevent smooth scrolling
    const originalScrollIntoView = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = function(options) {
        if (options && options.behavior === 'smooth') {
            options.behavior = 'auto';
        }
        return originalScrollIntoView.call(this, options);
    };

    // Override scrollTo to prevent smooth scrolling
    const originalScrollTo = window.scrollTo;
    window.scrollTo = function(options) {
        if (options && options.behavior === 'smooth') {
            options.behavior = 'auto';
        }
        return originalScrollTo.call(this, options);
    };

    // Override scrollBy to prevent smooth scrolling
    const originalScrollBy = window.scrollBy;
    window.scrollBy = function(options) {
        if (options && options.behavior === 'smooth') {
            options.behavior = 'auto';
        }
        return originalScrollBy.call(this, options);
    };

    // Prevent React from auto-scrolling
    const preventReactAutoScroll = () => {
        // Override React's internal scroll methods
        if (window.React) {
            const originalReactScroll = window.React.scrollIntoView;
            if (originalReactScroll) {
                window.React.scrollIntoView = function(element, options) {
                    if (options && options.behavior === 'smooth') {
                        options.behavior = 'auto';
                    }
                    return originalReactScroll.call(this, element, options);
                };
            }
        }

        // Override any React Router scroll behavior
        if (window.history && window.history.scrollRestoration) {
            window.history.scrollRestoration = 'manual';
        }

        // Prevent any automatic scrolling on route changes
        const originalPushState = history.pushState;
        history.pushState = function() {
            const result = originalPushState.apply(this, arguments);
            window.scrollTo(0, window.scrollY); // Keep current scroll position
            return result;
        };

        const originalReplaceState = history.replaceState;
        history.replaceState = function() {
            const result = originalReplaceState.apply(this, arguments);
            window.scrollTo(0, window.scrollY); // Keep current scroll position
            return result;
        };
    };

    // Call the function to prevent React auto-scroll
    preventReactAutoScroll();

    // Monitor for any new elements and prevent their auto-scroll
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) { // Element node
                    node.style.scrollBehavior = 'auto';
                    if (node.scrollIntoView) {
                        const originalScrollIntoView = node.scrollIntoView;
                        node.scrollIntoView = function(options) {
                            if (options && options.behavior === 'smooth') {
                                options.behavior = 'auto';
                            }
                            return originalScrollIntoView.call(this, options);
                        };
                    }
                }
            });
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Prevent React state changes from causing scroll
    const preventReactStateScroll = () => {
        // Override React's setState to prevent scroll
        if (window.React && window.React.useState) {
            const originalUseState = window.React.useState;
            window.React.useState = function(initialState) {
                const [state, setState] = originalUseState.call(this, initialState);
                const newSetState = (newState) => {
                    // Prevent scroll before state change
                    event?.preventDefault();
                    event?.stopPropagation();
                    return setState(newState);
                };
                return [state, newSetState];
            };
        }

        // Override React's useEffect to prevent scroll
        if (window.React && window.React.useEffect) {
            const originalUseEffect = window.React.useEffect;
            window.React.useEffect = function(effect, deps) {
                const newEffect = () => {
                    // Prevent scroll before effect
                    event?.preventDefault();
                    event?.stopPropagation();
                    return effect();
                };
                return originalUseEffect.call(this, newEffect, deps);
            };
        }
    };

    // Call the function to prevent React state scroll
    preventReactStateScroll();

    // Prevent any automatic scrolling on DOM changes
    const preventDOMScroll = () => {
        // Override any DOM manipulation that might cause scroll
        const originalAppendChild = Node.prototype.appendChild;
        Node.prototype.appendChild = function(child) {
            if (child.style) {
                child.style.scrollBehavior = 'auto';
            }
            return originalAppendChild.call(this, child);
        };

        const originalInsertBefore = Node.prototype.insertBefore;
        Node.prototype.insertBefore = function(newNode, referenceNode) {
            if (newNode.style) {
                newNode.style.scrollBehavior = 'auto';
            }
            return originalInsertBefore.call(this, newNode, referenceNode);
        };

        const originalReplaceChild = Node.prototype.replaceChild;
        Node.prototype.replaceChild = function(newChild, oldChild) {
            if (newChild.style) {
                newChild.style.scrollBehavior = 'auto';
            }
            return originalReplaceChild.call(this, newChild, oldChild);
        };
    };

    // Call the function to prevent DOM scroll
    preventDOMScroll();

    // Prevent auto-scroll on meal type filter changes
    const preventMealTypeScroll = () => {
        // Override setMealTypeFilter to prevent scroll
        const originalSetState = React.useState;
        if (originalSetState) {
            React.useState = function(initialState) {
                const [state, setState] = originalSetState.call(this, initialState);
                const newSetState = (newState) => {
                    // Prevent scroll before state change
                    event?.preventDefault();
                    event?.stopPropagation();
                    
                    // If this is mealTypeFilter, prevent scroll
                    if (typeof newState === 'string' && (newState === 'breakfast' || newState === 'lunch' || newState === 'dinner' || newState === '')) {
                        // This is likely mealTypeFilter
                        event?.preventDefault();
                        event?.stopPropagation();
                    }
                    
                    return setState(newState);
                };
                return [state, newSetState];
            };
        }
    };

    // Call the function to prevent meal type scroll
    preventMealTypeScroll();

    // Add specific event listeners for meal type elements
    const mealTypeElements = document.querySelectorAll(`
        .meal-type-button,
        .meal-filter-button,
        .meal-type-dropdown,
        [data-meal-type],
        .meal-type-selection,
        .meal-type-filter,
        .meal-type-container,
        .meal-selection-container,
        .meals-container,
        .meal-card,
        .meal-item,
        .meal-selection,
        .meal-type-filter,
        .meal-filter-container
    `);

    mealTypeElements.forEach(element => {
        // Add all possible event listeners
        const events = ['click', 'mousedown', 'mouseup', 'touchstart', 'touchend', 'focus', 'blur', 'change', 'input', 'submit'];
        
        events.forEach(eventType => {
            element.addEventListener(eventType, (event) => {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
                return false;
            }, true);
        });
    });

    // Monitor for new meal type elements
    const mealTypeObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) { // Element node
                    if (node.classList.contains('meal-type-button') || 
                        node.classList.contains('meal-filter-button') || 
                        node.classList.contains('meal-type-dropdown') ||
                        node.classList.contains('meal-type-selection') ||
                        node.classList.contains('meal-type-filter') ||
                        node.classList.contains('meal-type-container') ||
                        node.classList.contains('meal-selection-container') ||
                        node.classList.contains('meals-container') ||
                        node.classList.contains('meal-card') ||
                        node.classList.contains('meal-item') ||
                        node.classList.contains('meal-selection') ||
                        node.classList.contains('meal-type-filter') ||
                        node.classList.contains('meal-filter-container') ||
                        node.hasAttribute('data-meal-type')) {
                        
                        node.style.scrollBehavior = 'auto';
                        
                        const events = ['click', 'mousedown', 'mouseup', 'touchstart', 'touchend', 'focus', 'blur', 'change', 'input', 'submit'];
                        
                        events.forEach(eventType => {
                            node.addEventListener(eventType, (event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                event.stopImmediatePropagation();
                                return false;
                            }, true);
                        });
                    }
                }
            });
        });
    });

    mealTypeObserver.observe(document.body, {
        childList: true,
        subtree: true
    });
});

const container = document.getElementById('app');
const root = createRoot(container);
root.render(<App />);
