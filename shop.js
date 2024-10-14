// DECLARE ARRAY PARA SA CART //
const cartItems = [];

// UPDATE NUNG CART DROPDOWN //
function updateCartDropdown() 
{
    const cartDropdown = $('#cart-items');
    const cartCount = $('#cart-item-count');
    cartDropdown.empty();

    if (cartItems.length === 0) 
    {
        cartDropdown.append('<li><a class="dropdown-item" href="#">Your cart is empty</a></li>');
        cartCount.text('(0)');
        return;
    }

    cartItems.forEach((item, index) => 
    {
        const listItem = `
            <li>
                <div class="d-flex justify-content-between align-items-center">
                    <a class="dropdown-item" href="#">${item.name} - ₱${item.price} x ${item.quantity}</a>
                    <button class="btn btn-danger btn-sm" data-index="${index}" data-id="${item.id}">X</button>
                </div>
            </li>
        `;
        cartDropdown.append(listItem);
    });

    const clearAllItem = `
        <li><hr class="dropdown-divider"></li>
        <li><button class="dropdown-item" id="clear-cart">Clear All</button></li>
    `;
    cartDropdown.append(clearAllItem);

    const totalQuantity = cartItems.reduce((total, item) => total + parseInt(item.quantity), 0);
    cartCount.text(`(${totalQuantity})`);
}

// LOAD CART ITEMS GALING SA DATABASE //
function loadCartItemsFromDatabase() 
{
    $.ajax({
        url: 'cart.php',
        method: 'GET',
        success: function (data) 
        {
            cartItems.length = 0;
            data.items.forEach(item => cartItems.push(item));
            updateCartDropdown();
        }
    });
}

// DELETE ITEM GALING SA CART //
function deleteCartItem(index) 
{
    const item = cartItems[index];
    $.ajax({
        url: 'cart.php',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ delete: true, id: item.id }),
        success: function (data) 
        {
            if (data.status === 'success') 
            {
                cartItems.splice(index, 1);
                updateCartDropdown();
            }
        }
    });
}

// EVENT LISTENER PARA SA DELETE BUTTON //
$(document).on('click', '.btn-danger', function (event) 
{
    const index = $(this).data('index');
    deleteCartItem(index);
    event.stopPropagation();
});

// EVENT LISTENER PARA SA CLEAR ALL BUTTON //
$(document).on('click', '#clear-cart', function (event) 
{
    $.ajax({
        url: 'cart.php',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ clear_all: true }),
        success: function (data) 
        {
            if (data.status === 'success') 
            {
                cartItems.length = 0;
                updateCartDropdown();
            }
        }
    });
    event.stopPropagation();
});

// FUNCTION NG ADD TO CART //
$('.add-to-cart-btn').click(function () 
{
    const productElement = $(this).closest('.bginfo');
    const productName = productElement.find('.collection-name h5').text();
    const productPrice = productElement.find('p:contains("Price")').text().split('₱')[1].replace(/,/g, '');
    const productSize = productElement.find('select').val();
    const productQuantity = productElement.find('input[type="number"]').val();

    $.ajax({
        url: 'cart.php',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ name: productName, price: productPrice, size: productSize, quantity: parseInt(productQuantity) }),
        success: function (data) 
        {
            if (data.status === 'success') 
            {
                const newItem = 
                {
                    name: productName,
                    price: productPrice,
                    size: productSize,
                    quantity: parseInt(productQuantity),
                    id: data.id
                };
                cartItems.push(newItem);
                loadCartItemsFromDatabase();
                updateCartDropdown();
            }
        }
    });
});
// LOAD CART ITEMS ON PAGE REFRESH //
loadCartItemsFromDatabase();
