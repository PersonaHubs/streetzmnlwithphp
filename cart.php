<?php
header('Content-Type: application/json');

// I CONNECT YUNG DATABASE //
$host = 'localhost';
$dbname = 'shop';
$username = 'root';
$password = '';

$conn = new mysqli($host, $username, $password, $dbname);

// FETCH YUNG JSON INPUT //
$data = json_decode(file_get_contents("php://input"), true);
$response = ['status' => 'error', 'message' => ''];

// FETCH YUNG ITEMS GALING SA CART GAMIT GET REQUEST //
if ($_SERVER['REQUEST_METHOD'] === 'GET') 
{
    $sql = "SELECT id, shoeName, shoePrice, shoeSize, shoeQuantity FROM cart";
    $result = $conn->query($sql);
    $items = [];

    if ($result->num_rows > 0) 
    {
        while ($row = $result->fetch_assoc()) 
        {
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
    $conn->close();
    exit;
}

// ADD OR DELETE YUNG ITEMS GALING SA CART GAMIT POST REQUEST //
if ($_SERVER['REQUEST_METHOD'] === 'POST') 
{
    if (isset($data['name']) && isset($data['size']) && isset($data['quantity']) && isset($data['price'])) 
    {
        $name = $conn->real_escape_string($data['name']);
        $price = $conn->real_escape_string($data['price']);
        $size = $conn->real_escape_string($data['size']);
        $quantity = $conn->real_escape_string($data['quantity']);

        $sql = "INSERT INTO cart (shoeName, shoePrice, shoeSize, shoeQuantity) VALUES ('$name', '$price', '$size', '$quantity')";
        
        if ($conn->query($sql) === TRUE) 
        {
            $last_id = $conn->insert_id;
            $response = ['status' => 'success', 'id' => $last_id];
        }
    } 

    elseif (isset($data['delete']) && isset($data['id'])) 
    {
        $id = $conn->real_escape_string($data['id']);
        $sql = "DELETE FROM cart WHERE id = '$id'";
        if ($conn->query($sql) === TRUE) 
        {
            $response = ['status' => 'success'];
        }
    } 
    
    elseif (isset($data['clear_all'])) 
    {
        $sql = "DELETE FROM cart";
        if ($conn->query($sql) === TRUE) 
        {
            $response = ['status' => 'success'];
        }
    }
}
echo json_encode($response);
$conn->close();
