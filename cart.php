<?php
// CONNECTION SA DATABASE //
$host = 'localhost';
$dbname = 'shop';
$username = 'root';
$password = '';

$conn = new mysqli($host, $username, $password, $dbname);

// FETCH NUNG JSON INPUT GALING KAY AJAX //
$data = json_decode(file_get_contents("php://input"), true);
$response = ['status' => 'error', 'message' => ''];

// FETCH YUNG ITEMS GALING SA CART //
if (empty($data)) {
    $sql = "SELECT id, shoeName, shoePrice, shoeSize, shoeQuantity FROM cart";
    $result = $conn->query($sql);
    $items = [];

    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $items[] = [
                'id' => $row['id'],
                'name' => $row['shoeName'],
                'price' => $row['shoePrice'],
                'size' => $row['shoeSize'],
                'quantity' => $row['shoeQuantity']
            ];
        }
    }
    echo json_encode(['status' => 'success', 'items' => $items]);
    exit;
}

// ADD AT PAG DELETE NG ITEM SA CART AT DATABASE //
if (isset($data['name']) && isset($data['size']) && isset($data['quantity'])) {
    $name = $conn->real_escape_string($data['name']);
    $size = $conn->real_escape_string($data['size']);
    $quantity = $conn->real_escape_string($data['quantity']);

    $sql = "INSERT INTO cart (shoeName, shoePrice, shoeSize, shoeQuantity) VALUES ('$name', '{$data['price']}', '$size', '$quantity')";
    if ($conn->query($sql) === TRUE) {
        $response = ['status' => 'success', 'message' => 'Item added.'];
    }
} elseif (isset($data['delete']) && isset($data['id'])) {
    $id = $conn->real_escape_string($data['id']);
    $sql = "DELETE FROM cart WHERE id = '$id'";
    if ($conn->query($sql) === TRUE) {
        $response = ['status' => 'success', 'message' => 'Item deleted.'];
    }
} elseif (isset($data['clear_all'])) {
    $sql = "DELETE FROM cart";
    if ($conn->query($sql) === TRUE) {
        $response = ['status' => 'success', 'message' => 'Cart cleared.'];
    }
}

echo json_encode($response);
$conn->close();
?>
