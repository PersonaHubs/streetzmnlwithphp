<?php
// KUNIN YUNG DATABASE //
$host = 'localhost';
$dbname = 'shop';
$username = 'root';
$password = '';

// CONNECT YUNG DATABASE //
$conn = new mysqli($host, $username, $password, $dbname);

// CHECKING NANG CONNECTION KUNG NAKA CONNECT BA TALAGA //
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// KUNIN YUNG JSON INPUTS PARA SA MGA AJAX REQUESTS // 
$data = json_decode(file_get_contents("php://input"), true);

// RESPONSE ARRAY PARA DIN AJAX, MORE ON ERROR HANDLING AT MESSAGES //
$response = ['status' => 'error', 'message' => ''];

// FETCHING ITEMS //
if (empty($data)) {
    $sql = "SELECT id, shoeName, shoePrice, shoeSize, shoeQuantity FROM cart";
    $result = $conn->query($sql);
    
    if ($result->num_rows > 0) {
        $items = [];
        while ($row = $result->fetch_assoc()) {
            $items[] = [
                'id' => $row['id'],
                'name' => $row['shoeName'],
                'price' => $row['shoePrice'],
                'size' => $row['shoeSize'],
                'quantity' => $row['shoeQuantity']
            ];
        }
        echo json_encode(['status' => 'success', 'items' => $items]);
    } else {
        echo json_encode(['status' => 'success', 'items' => []]);
    }
    exit;
}

// CHECKING NG DATA KUNG VALID //
if (isset($data['name']) && isset($data['size']) && isset($data['quantity'])) {
    $name = $conn->real_escape_string($data['name']);
    $size = $conn->real_escape_string($data['size']);
    $quantity = $conn->real_escape_string($data['quantity']);

    // ADDING NANG ITEM PAPUNTA SA CART //
    $sql = "INSERT INTO cart (shoeName, shoePrice, shoeSize, shoeQuantity) VALUES ('$name', '{$data['price']}', '$size', '$quantity')";

    if ($conn->query($sql) === TRUE) {
        $response = ['status' => 'success', 'message' => 'Item added to cart successfully.'];
    } else {
        $response = ['status' => 'error', 'message' => 'Error: ' . $conn->error];
    }
} elseif (isset($data['delete']) && isset($data['id'])) {
    // PARA SA DELETE SA CART //
    $id = $conn->real_escape_string($data['id']);
    
    $sql = "DELETE FROM cart WHERE id = '$id'";

    if ($conn->query($sql) === TRUE) {
        $response = ['status' => 'success', 'message' => 'Item deleted from cart successfully.'];
    } else {
        $response = ['status' => 'error', 'message' => 'Error: ' . $conn->error];
    }
} elseif (isset($data['clear_all'])) {
    // PARA SA CLEAR ALL CART //
    $sql = "DELETE FROM cart";

    if ($conn->query($sql) === TRUE) {
        $response = ['status' => 'success', 'message' => 'All items cleared from cart successfully.'];
    } else {
        $response = ['status' => 'error', 'message' => 'Error: ' . $conn->error];
    }
}

// SEND NUNG RESPONSE //
echo json_encode($response);
$conn->close();
?>