// NAG DECLARE NANG ARRAY PARA SA CART //
const cartItems = [];

// UPDATE NUNG CART DROP DOWN //
function updateCartDropdown() 
{
    const cartDropdown = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-item-count');
    cartDropdown.innerHTML = '';

    if (cartItems.length === 0) 
        {
        cartDropdown.innerHTML = '<li><a class="dropdown-item" href="#">Your cart is empty</a></li>';
        cartCount.innerText = '(0)';
        return;
    }

    cartItems.forEach((item, index) => 
        {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <a class="dropdown-item" href="#">${item.name} - ₱${item.price} x ${item.quantity}</a>
                <button class="btn btn-danger btn-sm" data-index="${index}" data-id="${item.id}">X</button>
            </div>
        `;
        cartDropdown.appendChild(listItem);
    });

    const clearAllItem = document.createElement('li');
    clearAllItem.innerHTML = '<li><hr class="dropdown-divider"></li><li><button class="dropdown-item" id="clear-cart">Clear All</button></li>';
    cartDropdown.appendChild(clearAllItem);

    const totalQuantity = cartItems.reduce((total, item) => total + parseInt(item.quantity), 0);
    cartCount.innerText = `(${totalQuantity})`;
}

// I LOAD YUNG CART ITEMS GALING SA DATABASE //
function loadCartItemsFromDatabase() 
{
    fetch('cart.php', 
        {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
    })

    .then(response => response.json())
    .then(data => 
        {
        if (data.status === 'success') 
            {
            cartItems.length = 0;
            data.items.forEach(item => cartItems.push(item));
            updateCartDropdown();
        }
    })
    .catch(console.error);
}

// DELETE ITEM SA CART //
function deleteCartItem(index) 
{
    const item = cartItems[index];
    fetch('cart.php', 
        {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delete: true, id: item.id })
    })

    .then(response => response.json())
    .then(data => 
        {
        if (data.status === 'success') 
            {
            cartItems.splice(index, 1);
            updateCartDropdown();
        }
    })
    .catch(console.error);
}

// EVENT LISTENER NANG DELETE BUTTON //
document.addEventListener('click', function(event) 
{
    if (event.target.matches('.btn-danger')) 
        {
        const index = event.target.getAttribute('data-index');
        deleteCartItem(index);
        event.stopPropagation();
    }
});

// EVENT LISTENER NANG CLEAR ALL BUTTON //
document.addEventListener('click', function(event) 
{
    if (event.target.matches('#clear-cart')) 
        {
        fetch('cart.php', 
            {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clear_all: true })
        })

        .then(response => response.json())
        .then(data => 
            {
            if (data.status === 'success') 
                {
                cartItems.length = 0;
                updateCartDropdown();
            }
        })
        .catch(console.error);
        event.stopPropagation();
    }
});

// ADD TO CART FUNCTION //
document.querySelectorAll('.add-to-cart-btn').forEach(button => 
    {
    button.addEventListener('click', function() {
        const productElement = this.closest('.bginfo');
        const productName = productElement.querySelector('.collection-name h5').innerText;
        const productPrice = productElement.querySelector('p:nth-of-type(2)').innerText.split('₱')[1].replace(/,/g, '');
        const productSize = productElement.querySelector('select').value;
        const productQuantity = productElement.querySelector('input[type="number"]').value;

        fetch('cart.php', 
            {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: productName, price: productPrice, size: productSize, quantity: parseInt(productQuantity) })
        })

        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') 
                {
                loadCartItemsFromDatabase();
            }
        })
        .catch(console.error);
    });
});

// ILOAD YUNG CART ITEMS PAG NAG REFRESH NANG PAGE //
loadCartItemsFromDatabase();
