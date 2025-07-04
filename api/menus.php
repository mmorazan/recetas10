<?php
header('Content-Type: application/json');
require_once '../config/database.php';

$action = $_GET['action'] ?? $_POST['action'] ?? '';

try {
    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME, DB_USER, DB_PASS);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    switch ($action) {
        case 'list':
            $stmt = $pdo->query("SELECT * FROM Menu ORDER BY nombre");
            $menus = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($menus);
            break;

        case 'get':
            $id = $_GET['id'];
            $stmt = $pdo->prepare("SELECT * FROM Menu WHERE id = ?");
            $stmt->execute([$id]);
            $menu = $stmt->fetch(PDO::FETCH_ASSOC);
            echo json_encode($menu);
            break;

        case 'create':
        case 'update':
            $id = $_POST['id'] ?? null;
            $data = [
                'nombre' => $_POST['nombre']
            ];

            if ($action === 'create') {
                $sql = "INSERT INTO Menu SET " . implode('=?, ', array_keys($data)) . "=?";
                $stmt = $pdo->prepare($sql);
                $stmt->execute(array_values($data));
                $id = $pdo->lastInsertId();
            } else {
                $sql = "UPDATE Menu SET " . implode('=?, ', array_keys($data)) . "=? WHERE id=?";
                $stmt = $pdo->prepare($sql);
                $values = array_values($data);
                $values[] = $id;
                $stmt->execute($values);
            }

            echo json_encode(['success' => true, 'id' => $id]);
            break;

        case 'delete':
            $id = $_POST['id'];
            $stmt = $pdo->prepare("DELETE FROM Menu WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => $stmt->rowCount() > 0]);
            break;

        default:
            echo json_encode(['error' => 'Acción no válida']);
    }
} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>