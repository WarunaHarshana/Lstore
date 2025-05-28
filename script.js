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
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartEmptyMessage = document.getElementById('cart-empty-message');
    const cartTotalSpan = document.getElementById('cart-total');
    const sendWhatsAppBtn = document.getElementById('send-whatsapp-btn');
    
    let cart = [];
    let allProducts = [];

    function loadCart() {
        cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
        renderCart(); 
    }

    function saveCart() {
        localStorage.setItem('shoppingCart', JSON.stringify(cart));
    }

    function renderCart() {
        if (!cartItemsContainer || !cartEmptyMessage || !cartTotalSpan || !sendWhatsAppBtn) {
            // If essential cart elements are not on the page, do not proceed.
            // This can happen if script.js is loaded on a page without these elements.
            console.warn("Cart elements not found. Skipping cart rendering.");
            return;
        }

        cartItemsContainer.innerHTML = ''; // Clear existing items
        let overallTotal = 0;

        if (cart.length === 0) {
            cartEmptyMessage.classList.remove('hidden');
            cartItemsContainer.appendChild(cartEmptyMessage); 
            sendWhatsAppBtn.classList.add('hidden'); // Hide WhatsApp button if cart is empty
        } else {
            cartEmptyMessage.classList.add('hidden');
            sendWhatsAppBtn.classList.remove('hidden'); // Show WhatsApp button if cart has items
            cart.forEach(item => {
                const itemSubtotal = item.price * item.quantity;
                overallTotal += itemSubtotal;
                const cartItemElement = document.createElement('div');
                cartItemElement.classList.add('flex', 'flex-wrap', 'justify-between', 'items-center', 'py-3', 'border-b', 'border-gray-200');
                cartItemElement.innerHTML = `
                    <div class="w-full sm:w-2/5 mb-2 sm:mb-0">
                        <p class="font-semibold text-orange-700">${item.name}</p>
                        <p class="text-sm text-gray-600">Price: $${item.price.toFixed(2)}</p>
                    </div>
                    <div class="w-auto sm:w-1/5 flex items-center justify-start sm:justify-center mb-2 sm:mb-0">
                        <button data-id="${item.id}" class="decrement-qty text-orange-500 hover:text-orange-700 font-bold py-1 px-2 rounded hover:bg-orange-100">-</button>
                        <span class="mx-2 text-center w-8">${item.quantity}</span>
                        <button data-id="${item.id}" class="increment-qty text-orange-500 hover:text-orange-700 font-bold py-1 px-2 rounded hover:bg-orange-100">+</button>
                    </div>
                    <div class="w-auto sm:w-1/5 text-left sm:text-center font-semibold text-gray-700 mb-2 sm:mb-0">
                        $${itemSubtotal.toFixed(2)}
                    </div>
                    <div class="w-full sm:w-1/5 text-right">
                        <button data-id="${item.id}" class="remove-item text-red-500 hover:text-red-700 text-sm font-medium">Remove</button>
                    </div>
                `;
                cartItemsContainer.appendChild(cartItemElement);
            });
        }
        cartTotalSpan.textContent = overallTotal.toFixed(2);
        // console.log('Cart rendered:', cart); // Keep for debugging if necessary
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
        renderCart();

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
            message += `- ${item.name} (${item.quantity}) @ $${item.price.toFixed(2)} each = $${itemSubtotal.toFixed(2)}\n`;
        });
        message += `\nTotal Order Value: $${overallTotal.toFixed(2)}`;
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
    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', function(event) {
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

    // Event listener for "Send Order via WhatsApp" button
    if (sendWhatsAppBtn) {
        sendWhatsAppBtn.addEventListener('click', sendCartToWhatsApp);
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
                                <p class="text-base text-gray-800 mt-1">$${product.price.toFixed(2)}</p>
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
