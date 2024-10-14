const cartItems = []; // Array to hold cart items

// Function to update the cart dropdown
function updateCartDropdown() {
    const cartDropdown = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-item-count');

    // Clear the dropdown items
    cartDropdown.innerHTML = '';

    // If there are no items, show the empty message
    if (cartItems.length === 0) {
        cartDropdown.innerHTML = '<li><a class="dropdown-item" href="#">Your cart is empty</a></li>';
        cartCount.innerText = '(0)';
        return;
    }

    // Otherwise, list the items in the cart
    cartItems.forEach((item, index) => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <a class="dropdown-item" href="#">${item.name} - ₱${item.price} x ${item.quantity}</a>
                <button class="btn btn-danger btn-sm" data-index="${index}" data-id="${item.id}">X</button>
            </div>
        `;
        cartDropdown.appendChild(listItem);
    });

    // Add Clear All button
    const clearAllItem = document.createElement('li');
    clearAllItem.innerHTML = '<li><hr class="dropdown-divider"></li>';
    clearAllItem.innerHTML += '<li><button class="dropdown-item" id="clear-cart">Clear All</button></li>';
    cartDropdown.appendChild(clearAllItem);

    // Correctly sum up the total quantity of items and update the cart count
    const totalQuantity = cartItems.reduce((total, item) => total + parseInt(item.quantity, 10), 0);
    cartCount.innerText = `(${totalQuantity})`;
}


// Function to load cart items from the database
function loadCartItemsFromDatabase() {
    fetch('cart.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            // Clear current cartItems array
            cartItems.length = 0;
            
            // Add each item from the database to the cartItems array
            data.items.forEach(item => {
                cartItems.push(item);
            });
            updateCartDropdown(); // Update the dropdown with fetched items
        } else {
            console.error(data.message);
        }
    })
    .catch(error => console.error('Error:', error));
}

// Function to delete an item from the cart
function deleteCartItem(index) {
    const item = cartItems[index];

    // Send an AJAX request to delete the item from the database using the ID
    fetch('cart.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            delete: true,
            id: item.id // Use the unique ID for deletion
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            cartItems.splice(index, 1); // Remove item from cart
            updateCartDropdown(); // Update the cart dropdown
        } else {
            alert(data.message);
        }
    })
    .catch(error => console.error('Error:', error));
}

// Event listener for delete buttons
document.addEventListener('click', function(event) {
    if (event.target.matches('.btn-danger')) {
        const index = event.target.getAttribute('data-index');
        deleteCartItem(index);
        event.stopPropagation();
    }
});

// Event listener for clear cart button
document.addEventListener('click', function(event) {
    if (event.target.matches('#clear-cart')) {
        // Send an AJAX request to clear all items from the database
        fetch('cart.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                clear_all: true
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                cartItems.length = 0; // Clear the local cart array
                updateCartDropdown(); // Update the dropdown
            } else {
                alert(data.message);
            }
        })
        .catch(error => console.error('Error:', error));
        event.stopPropagation();
    }
});

// FUNCTION PAG CINLICK YUNG ADD TO CART BUTTON //
// NAGLAGAY NG FOR EACH PARA YUNG MGA ITEMS MAY SARILING EVENT LISTENER //
document.querySelectorAll('.add-to-cart-btn').forEach(button => {
    button.addEventListener('click', function(event) {
        /* KUNIN YUNG DIV CLASS NA BGINFO TAPOS KUNIN YUNG PRODUCTNAME BY CALLING COLLECTION-NAME THEN H5 SINCE DUN NAKALAGAY YUNG PANGALAN NG SHOES AFTER NUN KUNIN YUNG 2ND P DUN SA DIV BGINFO WHICH IS YUNG PRICE
        AND THEN KUNIN YUNG SELECT TAG AND KUNIN YUNG KUNG ANO NAPILI NI USER, SAME IDEA SA QUANTITY KUNIN ANG ININPUT NA NUMBER NI USER DUN SA INPUT TYPE NUMBER*/
        const productElement = this.closest('.bginfo');
        const productName = productElement.querySelector('.collection-name h5').innerText;
        const productPrice = productElement.querySelector('p:nth-of-type(2)').innerText.split('₱')[1].replace(/,/g, '');
        const productSize = productElement.querySelector('select').value;
        const productQuantity = productElement.querySelector('input[type="number"]').value;

        // AJAX POST PARA MAG REQUEST NA I ADD YUNG MGA ITEMS NUNG CART DUN SA DATABASE //
        fetch('cart.php', 
            {
            method: 'POST',
            headers: 
            {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(
                {
                name: productName,
                price: productPrice,
                size: productSize,
                quantity: parseInt(productQuantity)
            })
        })
        .then(response => response.json())
        .then(data => {
            // Handle success or error response
            if (data.status === 'success') {
                // Reload cart items from the database
                loadCartItemsFromDatabase();
            } else {
                alert(data.message);
            }
        })
        .catch(error => console.error('Error:', error));

        // Prevent the dropdown from closing
        event.stopPropagation();
    });
});

// Load cart items from the database on page load
loadCartItemsFromDatabase();
