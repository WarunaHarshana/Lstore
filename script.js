document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Logic
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
            mobileMenu.classList.toggle('block');
        });

        // Close menu when a link is clicked (for single-page navigation)
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth < 768) { // Only close on mobile
                    mobileMenu.classList.add('hidden');
                    mobileMenu.classList.remove('block');
                }
            });
        });
    }

    // E-commerce Logic
    const productGrid = document.getElementById('product-grid');
    // Old cart section elements (will be removed or repurposed for modal)
    // const cartItemsContainer = document.getElementById('cart-items-container'); // Now cart-modal-items-container
    // const cartEmptyMessage = document.getElementById('cart-empty-message'); // Now cart-modal-empty-message
    // const cartTotalSpan = document.getElementById('cart-total'); // Now cart-modal-total
    // const sendWhatsAppBtn = document.getElementById('send-whatsapp-btn'); // Now whatsapp-checkout-btn

    // Modal elements
    const cartModal = document.getElementById('cart-modal');
    const closeCartModalBtn = document.getElementById('close-cart-modal-btn');
    const desktopCartButton = document.getElementById('desktop-cart-button');
    const mobileCartButton = document.getElementById('mobile-cart-button');
    
    // Elements inside the modal for cart content
    const cartModalItemsContainer = document.getElementById('cart-modal-items-container');
    const cartModalEmptyMessage = document.getElementById('cart-modal-empty-message');
    const cartModalTotalSpan = document.getElementById('cart-modal-total');
    const whatsappCheckoutBtn = document.getElementById('whatsapp-checkout-btn');

    // Cart Badge Elements
    const desktopCartBadge = document.getElementById('desktop-cart-badge');
    const mobileCartBadge = document.getElementById('mobile-cart-badge');

    let cart = [];
    let allProducts = [];

    function updateCartBadge() {
        const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
        const badges = [desktopCartBadge, mobileCartBadge];
        
        badges.forEach(badge => {
            if (badge) {
                if (totalQuantity > 0) {
                    badge.textContent = totalQuantity;
                    badge.classList.remove('hidden');
                } else {
                    badge.classList.add('hidden');
                }
            }
        });
    }

    function loadCart() {
        cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
        renderCart(); 
        updateCartBadge(); // Update badge on initial load
    }

    function saveCart() {
        localStorage.setItem('shoppingCart', JSON.stringify(cart));
        updateCartBadge(); // Update badge whenever cart is saved
    }

    function openCartModal() {
        if (cartModal) {
            cartModal.classList.remove('hidden');
            renderCart(); // Re-render cart content when modal is opened
        }
    }

    function closeCartModal() {
        if (cartModal) {
            cartModal.classList.add('hidden');
        }
    }

    function renderCart() {
        // Ensure modal content containers exist
        if (!cartModalItemsContainer || !cartModalEmptyMessage || !cartModalTotalSpan || !whatsappCheckoutBtn) {
            console.warn("Cart modal elements not found. Skipping cart rendering.");
            return;
        }

        cartModalItemsContainer.innerHTML = ''; // Clear existing items
        let overallTotal = 0;

        if (cart.length === 0) {
            cartModalEmptyMessage.classList.remove('hidden');
            // cartModalItemsContainer.appendChild(cartModalEmptyMessage); // No need to re-append if it's a permanent child
            whatsappCheckoutBtn.classList.add('hidden'); 
        } else {
            cartModalEmptyMessage.classList.add('hidden');
            whatsappCheckoutBtn.classList.remove('hidden'); 
            cart.forEach(item => {
                const itemSubtotal = item.price * item.quantity;
                overallTotal += itemSubtotal;
                const cartItemElement = document.createElement('div');
                cartItemElement.classList.add('flex', 'flex-wrap', 'justify-between', 'items-center', 'py-3', 'border-b', 'border-gray-200');
                cartItemElement.innerHTML = `
                    <div class="w-full sm:w-2/5 mb-2 sm:mb-0">
                        <p class="font-semibold text-orange-700">${item.name}</p>
                        <p class="text-sm text-gray-600">Price: රු. ${item.price.toFixed(2)}</p>
                    </div>
                    <div class="w-auto sm:w-1/5 flex items-center justify-start sm:justify-center mb-2 sm:mb-0">
                        <button data-id="${item.id}" class="decrement-qty text-orange-500 hover:text-orange-700 font-bold py-1 px-2 rounded hover:bg-orange-100">-</button>
                        <span class="mx-2 text-center w-8">${item.quantity}</span>
                        <button data-id="${item.id}" class="increment-qty text-orange-500 hover:text-orange-700 font-bold py-1 px-2 rounded hover:bg-orange-100">+</button>
                    </div>
                    <div class="w-auto sm:w-1/5 text-left sm:text-center font-semibold text-gray-700 mb-2 sm:mb-0">
                        රු. ${itemSubtotal.toFixed(2)}
                    </div>
                    <div class="w-full sm:w-1/5 text-right">
                        <button data-id="${item.id}" class="remove-item text-red-500 hover:text-red-700 text-sm font-medium">Remove</button>
                    </div>
                `;
                cartModalItemsContainer.appendChild(cartItemElement);
            });
        }
        cartModalTotalSpan.textContent = `රු. ${overallTotal.toFixed(2)}`;
    }

    function addToCart(productId, buttonElement) {
        const productIdNum = parseInt(productId);
        const productToAdd = allProducts.find(p => p.id === productIdNum);
        if (!productToAdd) return;

        const existingProductIndex = cart.findIndex(item => item.id === productIdNum);
        if (existingProductIndex > -1) {
            cart[existingProductIndex].quantity += 1;
        } else {
            cart.push({ id: productIdNum, name: productToAdd.name, price: productToAdd.price, quantity: 1 });
        }
        saveCart();
        // renderCart(); // renderCart is called by openCartModal if modal is opened, and by saveCart's callers otherwise.
                       // updateCartBadge is called by saveCart.

        if (buttonElement) {
            const originalText = buttonElement.textContent; // Use textContent for button text
            buttonElement.textContent = 'Added!';
            buttonElement.classList.add('bg-green-500', 'hover:bg-green-600');
            buttonElement.classList.remove('bg-orange-500', 'hover:bg-orange-600');
            setTimeout(() => {
                buttonElement.textContent = originalText;
                buttonElement.classList.remove('bg-green-500', 'hover:bg-green-600');
                buttonElement.classList.add('bg-orange-500', 'hover:bg-orange-600');
            }, 1500);
        }
    }

    function updateQuantity(productId, newQuantity) {
        const productIdNum = parseInt(productId);
        const itemIndex = cart.findIndex(item => item.id === productIdNum);
        if (itemIndex > -1) {
            if (newQuantity <= 0) {
                cart.splice(itemIndex, 1);
            } else {
                cart[itemIndex].quantity = newQuantity;
            }
            saveCart();
            renderCart(); 
        }
    }

    function removeFromCart(productId) {
        const productIdNum = parseInt(productId);
        cart = cart.filter(item => item.id !== productIdNum);
        saveCart();
        renderCart(); 
    }

    function generateWhatsAppMessage() {
        let message = "Hello Lakshan Stores, I'd like to place an order:\n\n";
        let overallTotal = 0;
        cart.forEach(item => {
            const itemSubtotal = item.price * item.quantity;
            overallTotal += itemSubtotal;
            message += `- ${item.name} (${item.quantity}) @ රු. ${item.price.toFixed(2)} each = රු. ${itemSubtotal.toFixed(2)}\n`;
        });
        message += `\nTotal Order Value: රු. ${overallTotal.toFixed(2)}`;
        return message;
    }

    function sendCartToWhatsApp() {
        if (cart.length === 0) {
            alert("Your cart is empty. Please add items before sending.");
            return;
        }
        const phoneNumber = "94761683984";
        const message = generateWhatsAppMessage();
        const encodedMessage = encodeURIComponent(message);
        const url = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
        window.open(url, '_blank');
    }
    
    function attachAddToCartListeners() {
        if (!productGrid) return; // Don't run if product grid isn't on the page
        const addToCartButtons = productGrid.querySelectorAll('.add-to-cart-btn');
        addToCartButtons.forEach(button => {
            button.addEventListener('click', function() {
                addToCart(this.dataset.productId, this);
            });
        });
    }

    // Event listener for cart item interactions (increment, decrement, remove)
    if (cartModalItemsContainer) {
        cartModalItemsContainer.addEventListener('click', function(event) {
            const target = event.target;
            const productId = target.dataset.id;
            if (!productId) return;

            if (target.classList.contains('increment-qty')) {
                const item = cart.find(i => i.id === parseInt(productId));
                if(item) updateQuantity(productId, item.quantity + 1);
            } else if (target.classList.contains('decrement-qty')) {
                const item = cart.find(i => i.id === parseInt(productId));
                if(item) updateQuantity(productId, item.quantity - 1);
            } else if (target.classList.contains('remove-item')) {
                removeFromCart(productId);
            }
        });
    }

    // Event listeners for modal open/close
    if (desktopCartButton) {
        desktopCartButton.addEventListener('click', openCartModal);
    }
    if (mobileCartButton) {
        mobileCartButton.addEventListener('click', openCartModal);
    }
    if (closeCartModalBtn) {
        closeCartModalBtn.addEventListener('click', closeCartModal);
    }
    if (cartModal) {
        cartModal.addEventListener('click', (event) => {
            if (event.target === cartModal) { // Click on overlay
                closeCartModal();
            }
        });
    }
    
    // Event listener for "Send Order via WhatsApp" button inside the modal
    if (whatsappCheckoutBtn) {
        whatsappCheckoutBtn.addEventListener('click', sendCartToWhatsApp);
    }

    // Initial cart load and product fetching
    loadCart(); // This will also call renderCart

    if (productGrid) { // Only fetch products if the grid exists on the page
        fetch('products.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.json();
            })
            .then(productsData => {
                allProducts = productsData;
                productsData.forEach(product => {
                    const productCard = `
                        <div class="bg-white rounded-xl shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300">
                            <img src="${product.image}" alt="${product.name}" class="w-full h-48 md:h-64 object-cover">
                            <div class="p-3 md:p-4 text-center">
                                <h3 class="text-lg font-semibold text-orange-700">${product.name}</h3>
                                <p class="text-base text-gray-800 mt-1">රු. ${product.price.toFixed(2)}</p>
                                <button data-product-id="${product.id}" class="add-to-cart-btn mt-3 bg-orange-500 text-white font-bold py-2 px-4 rounded-full hover:bg-orange-600 active:bg-orange-700 transition-colors duration-300">Add to Cart</button>
                            </div>
                        </div>
                    `;
                    productGrid.innerHTML += productCard;
                });
                attachAddToCartListeners();
            })
            .catch(error => {
                console.error('Error fetching or processing products:', error);
                productGrid.innerHTML = '<p class="text-center text-red-600 bg-red-100 p-4 rounded-md col-span-full">Failed to load products. Please try again later.</p>';
            });
    } else {
        // If there's no product grid, but cart elements exist, still render the (empty or loaded) cart.
        renderCart();
    }
});
