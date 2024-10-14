<?php
// cart.php
// Database connection
$host = 'localhost';
$dbname = 'shop';
$username = 'root';
$password = '';

// Create connection
$conn = new mysqli($host, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Get the JSON input
$data = json_decode(file_get_contents("php://input"), true);

// Initialize response array
$response = ['status' => 'error', 'message' => ''];

// Fetch items if no input data
if (empty($data)) {
    $sql = "SELECT id, shoeName, shoePrice, shoeSize, shoeQuantity FROM cart";
    $result = $conn->query($sql);
    
    if ($result->num_rows > 0) {
        $items = [];
        while ($row = $result->fetch_assoc()) {
            $items[] = [
                'id' => $row['id'], // Fetch the ID
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
    exit; // Stop further execution
}

// Check if data is valid for add or delete
if (isset($data['name']) && isset($data['size']) && isset($data['quantity'])) {
    $name = $conn->real_escape_string($data['name']);
    $size = $conn->real_escape_string($data['size']);
    $quantity = $conn->real_escape_string($data['quantity']);

    // Insert item into cart
    $sql = "INSERT INTO cart (shoeName, shoePrice, shoeSize, shoeQuantity) VALUES ('$name', '{$data['price']}', '$size', '$quantity')";

    if ($conn->query($sql) === TRUE) {
        $response = ['status' => 'success', 'message' => 'Item added to cart successfully.'];
    } else {
        $response = ['status' => 'error', 'message' => 'Error: ' . $conn->error];
    }
} elseif (isset($data['delete']) && isset($data['id'])) {
    // Handle delete item logic with ID
    $id = $conn->real_escape_string($data['id']);
    
    $sql = "DELETE FROM cart WHERE id = '$id'";

    if ($conn->query($sql) === TRUE) {
        $response = ['status' => 'success', 'message' => 'Item deleted from cart successfully.'];
    } else {
        $response = ['status' => 'error', 'message' => 'Error: ' . $conn->error];
    }
} elseif (isset($data['clear_all'])) {
    // Handle clear all logic
    $sql = "DELETE FROM cart";

    if ($conn->query($sql) === TRUE) {
        $response = ['status' => 'success', 'message' => 'All items cleared from cart successfully.'];
    } else {
        $response = ['status' => 'error', 'message' => 'Error: ' . $conn->error];
    }
}

// Send the response
echo json_encode($response);

// Close connection
$conn->close();
?>