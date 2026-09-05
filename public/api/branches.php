<?php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    $db = getDb();
    $currentUser = requireAuth($db);

    if ($method === 'GET') {
        $identifier = isset($_GET['identifier']) ? trim($_GET['identifier']) : null;
        $id = isset($_GET['id']) ? trim($_GET['id']) : null;
        $targetKey = $identifier !== null && $identifier !== '' ? $identifier : ($id !== null && $id !== '' ? $id : null);

        if ($targetKey !== null) {
            $branch = fetchBranchesData($db, $targetKey);
            if ($branch) {
                http_response_code(200);
                echo json_encode([
                    'status' => 'success',
                    'data' => $branch
                ]);
            } else {
                http_response_code(404);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Branch not found'
                ]);
            }
        } else {
            $branches = fetchBranchesData($db);
            http_response_code(200);
            echo json_encode([
                'status' => 'success',
                'data' => $branches
            ]);
        }
    } elseif ($method === 'POST') {
        $action = isset($_GET['action']) ? trim($_GET['action']) : '';
        $input = getJsonInput();

        if ($action === 'create_default' || (isset($input['action']) && $input['action'] === 'create_default') || empty($input)) {
            // Generate default placeholder branch
            $randomSuffix = substr(uniqid(), -4);
            $newIdentifier = 'loja-rascunho-' . $randomSuffix;

            // Make sure identifier is unique
            while (findBranchId($db, $newIdentifier) !== null) {
                $randomSuffix = substr(uniqid(), -4);
                $newIdentifier = 'loja-rascunho-' . $randomSuffix;
            }

            $db->beginTransaction();
            try {
                $stmt = $db->prepare("INSERT INTO branches (
                    identifier, name, address, phone, lat, long, is_active,
                    reservation_url, delivery_url, pickup_url, location_url, pdf_dinein1, pdf_dinein2
                ) VALUES (
                    :identifier, :name, :address, :phone, :lat, :long, :is_active,
                    '', '', '', '', 'assets/pdfs/Menu.pdf', ''
                )");
                $stmt->execute([
                    'identifier' => $newIdentifier,
                    'name' => 'Nova Loja (Rascunho)',
                    'address' => 'Endereço da nova filial',
                    'phone' => '+351000000000',
                    'lat' => 38.7552,
                    'long' => -9.2202,
                    'is_active' => 0
                ]);
                $newBranchId = (int)$db->lastInsertId();

                // Add default opening schedule
                $schedStmt = $db->prepare("INSERT INTO branch_schedules (branch_id, schedule_type, day_pt, day_en, time_pt, time_en, display_order)
                    VALUES (:bid, 'opening', 'Segunda a domingo', 'Monday to Sunday', 'das 11h às 15h30, das 18h às 23h', '11 AM to 3:30 PM, 6 PM to 11 PM', 1)");
                $schedStmt->execute(['bid' => $newBranchId]);

                $db->commit();
                $newBranch = fetchBranchesData($db, $newBranchId);

                http_response_code(201);
                echo json_encode([
                    'status' => 'success',
                    'message' => 'Default placeholder branch created successfully',
                    'data' => $newBranch,
                    'createdAt' => date('Y-m-d H:i:s')
                ]);
            } catch (Exception $e) {
                $db->rollBack();
                throw $e;
            }
        } else {
            // Custom Branch Creation
            $identifier = !empty($input['identifier']) ? trim($input['identifier']) : 'branch-' . uniqid();
            $existingId = findBranchId($db, $identifier);
            if ($existingId !== null) {
                http_response_code(400);
                echo json_encode([
                    'status' => 'error',
                    'message' => "Branch identifier '{$identifier}' already exists."
                ]);
                exit();
            }

            $db->beginTransaction();
            try {
                $stmt = $db->prepare("INSERT INTO branches (
                    identifier, name, address, phone, lat, long, is_active,
                    reservation_url, delivery_url, pickup_url, location_url, pdf_dinein1, pdf_dinein2
                ) VALUES (
                    :identifier, :name, :address, :phone, :lat, :long, :is_active,
                    :reservation_url, :delivery_url, :pickup_url, :location_url, :pdf_dinein1, :pdf_dinein2
                )");
                $stmt->execute([
                    'identifier' => $identifier,
                    'name' => $input['name'] ?? 'Nova Filial',
                    'address' => $input['address'] ?? '',
                    'phone' => $input['phone'] ?? '',
                    'lat' => isset($input['lat']) ? (float)$input['lat'] : 38.7552,
                    'long' => isset($input['long']) ? (float)$input['long'] : -9.2202,
                    'is_active' => isset($input['isActive']) ? ($input['isActive'] ? 1 : 0) : 0,
                    'reservation_url' => $input['redirects']['reservation'] ?? '',
                    'delivery_url' => $input['redirects']['delivery'] ?? '',
                    'pickup_url' => $input['redirects']['pickup'] ?? '',
                    'location_url' => $input['redirects']['location'] ?? '',
                    'pdf_dinein1' => $input['redirects']['pdf']['dinein1'] ?? 'assets/pdfs/Menu.pdf',
                    'pdf_dinein2' => $input['redirects']['pdf']['dinein2'] ?? ''
                ]);
                $newBranchId = (int)$db->lastInsertId();

                // Insert schedules if provided
                if (isset($input['openingTime']) && is_array($input['openingTime'])) {
                    $schedStmt = $db->prepare("INSERT INTO branch_schedules (branch_id, schedule_type, day_pt, day_en, time_pt, time_en, display_order)
                        VALUES (:bid, 'opening', :day_pt, :day_en, :time_pt, :time_en, :order)");
                    $order = 1;
                    foreach ($input['openingTime'] as $s) {
                        $schedStmt->execute([
                            'bid' => $newBranchId,
                            'day_pt' => $s['dayPt'] ?? '',
                            'day_en' => $s['dayEn'] ?? '',
                            'time_pt' => $s['timePt'] ?? '',
                            'time_en' => $s['timeEn'] ?? '',
                            'order' => $order++
                        ]);
                    }
                }

                // Insert reviews if provided
                if (isset($input['reviews']) && is_array($input['reviews'])) {
                    $revStmt = $db->prepare("INSERT INTO branch_reviews (branch_id, name, url, display_order) VALUES (:bid, :name, :url, :order)");
                    $order = 1;
                    foreach ($input['reviews'] as $r) {
                        if (!empty($r['name']) && !empty($r['url'])) {
                            $revStmt->execute([
                                'bid' => $newBranchId,
                                'name' => $r['name'],
                                'url' => $r['url'],
                                'order' => $order++
                            ]);
                        }
                    }
                }

                $db->commit();
                $newBranch = fetchBranchesData($db, $newBranchId);

                http_response_code(201);
                echo json_encode([
                    'status' => 'success',
                    'message' => 'Branch created successfully',
                    'data' => $newBranch,
                    'createdAt' => date('Y-m-d H:i:s')
                ]);
            } catch (Exception $e) {
                $db->rollBack();
                throw $e;
            }
        }
    } elseif ($method === 'PUT' || $method === 'PATCH') {
        $input = getJsonInput();
        $section = isset($_GET['section']) ? trim($_GET['section']) : 'all';
        $identifier = isset($_GET['identifier']) ? trim($_GET['identifier']) : (isset($input['identifier']) ? $input['identifier'] : null);
        $id = isset($_GET['id']) ? trim($_GET['id']) : (isset($input['id']) ? $input['id'] : null);
        $targetKey = $id !== null && $id !== '' ? $id : ($identifier !== null && $identifier !== '' ? $identifier : null);

        if (!$targetKey) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Missing branch ID or identifier for update']);
            exit();
        }

        $branchId = findBranchId($db, $targetKey);
        if (!$branchId) {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => "Branch '{$targetKey}' not found"]);
            exit();
        }

        $db->beginTransaction();
        try {
            if ($section === 'status') {
                $isActive = isset($input['isActive']) ? ($input['isActive'] ? 1 : 0) : 0;
                $stmt = $db->prepare("UPDATE branches SET is_active = :status, updated_at = CURRENT_TIMESTAMP WHERE id = :id");
                $stmt->execute(['status' => $isActive, 'id' => $branchId]);
            } elseif ($section === 'info' || $section === 'general') {
                $newIdent = !empty($input['identifier']) ? trim($input['identifier']) : null;
                if ($newIdent) {
                    // Check duplicate identifier if changed
                    $stmtCheck = $db->prepare("SELECT id FROM branches WHERE identifier = :ident AND id != :id LIMIT 1");
                    $stmtCheck->execute(['ident' => $newIdent, 'id' => $branchId]);
                    if ($stmtCheck->fetchColumn() !== false) {
                        $db->rollBack();
                        http_response_code(400);
                        echo json_encode(['status' => 'error', 'message' => "Identifier '{$newIdent}' is already in use by another branch."]);
                        exit();
                    }
                }

                $stmt = $db->prepare("UPDATE branches SET
                    identifier = COALESCE(:ident, identifier),
                    name = :name,
                    address = :addr,
                    phone = :phone,
                    lat = :lat,
                    long = :lng,
                    is_active = :status,
                    updated_at = CURRENT_TIMESTAMP
                    WHERE id = :id");
                $stmt->execute([
                    'ident' => $newIdent,
                    'name' => $input['name'] ?? '',
                    'addr' => $input['address'] ?? '',
                    'phone' => $input['phone'] ?? '',
                    'lat' => isset($input['lat']) ? (float)$input['lat'] : 38.7552,
                    'lng' => isset($input['long']) ? (float)$input['long'] : -9.2202,
                    'status' => isset($input['isActive']) ? ($input['isActive'] ? 1 : 0) : 0,
                    'id' => $branchId
                ]);
            } elseif ($section === 'schedule') {
                // Remove existing schedules
                $delStmt = $db->prepare("DELETE FROM branch_schedules WHERE branch_id = :bid");
                $delStmt->execute(['bid' => $branchId]);

                $schedulesList = [];
                if (isset($input['openingTime']) && is_array($input['openingTime'])) {
                    $schedulesList = $input['openingTime'];
                } elseif (is_array($input)) {
                    // Could be passed directly as timetable array
                    $schedulesList = $input;
                }

                $schedStmt = $db->prepare("INSERT INTO branch_schedules (branch_id, schedule_type, day_pt, day_en, time_pt, time_en, display_order)
                    VALUES (:bid, 'opening', :day_pt, :day_en, :time_pt, :time_en, :order)");
                $order = 1;
                foreach ($schedulesList as $s) {
                    if (is_array($s) && (!empty($s['timePt']) || !empty($s['timeEn']))) {
                        $schedStmt->execute([
                            'bid' => $branchId,
                            'day_pt' => $s['dayPt'] ?? '',
                            'day_en' => $s['dayEn'] ?? '',
                            'time_pt' => $s['timePt'] ?? '',
                            'time_en' => $s['timeEn'] ?? '',
                            'order' => $order++
                        ]);
                    }
                }
                $db->prepare("UPDATE branches SET updated_at = CURRENT_TIMESTAMP WHERE id = :id")->execute(['id' => $branchId]);
            } elseif ($section === 'redirects') {
                $redirects = isset($input['redirects']) && is_array($input['redirects']) ? $input['redirects'] : $input;
                $stmt = $db->prepare("UPDATE branches SET
                    reservation_url = :res,
                    delivery_url = :del,
                    pickup_url = :pick,
                    location_url = :loc,
                    pdf_dinein1 = :pdf1,
                    pdf_dinein2 = :pdf2,
                    updated_at = CURRENT_TIMESTAMP
                    WHERE id = :id");
                $stmt->execute([
                    'res' => $redirects['reservation'] ?? '',
                    'del' => $redirects['delivery'] ?? '',
                    'pick' => $redirects['pickup'] ?? '',
                    'loc' => $redirects['location'] ?? '',
                    'pdf1' => isset($redirects['pdf']['dinein1']) ? $redirects['pdf']['dinein1'] : ($redirects['dinein1'] ?? ''),
                    'pdf2' => isset($redirects['pdf']['dinein2']) ? $redirects['pdf']['dinein2'] : ($redirects['dinein2'] ?? ''),
                    'id' => $branchId
                ]);
            } elseif ($section === 'reviews') {
                $delStmt = $db->prepare("DELETE FROM branch_reviews WHERE branch_id = :bid");
                $delStmt->execute(['bid' => $branchId]);

                $reviewsList = [];
                if (isset($input['reviews']) && is_array($input['reviews'])) {
                    $reviewsList = $input['reviews'];
                } elseif (is_array($input)) {
                    $reviewsList = $input;
                }

                $revStmt = $db->prepare("INSERT INTO branch_reviews (branch_id, name, url, display_order) VALUES (:bid, :name, :url, :order)");
                $order = 1;
                foreach ($reviewsList as $r) {
                    if (is_array($r) && !empty($r['name']) && !empty($r['url'])) {
                        $revStmt->execute([
                            'bid' => $branchId,
                            'name' => $r['name'],
                            'url' => $r['url'],
                            'order' => $order++
                        ]);
                    }
                }
                $db->prepare("UPDATE branches SET updated_at = CURRENT_TIMESTAMP WHERE id = :id")->execute(['id' => $branchId]);
            } else {
                // Section 'all' or full update
                if (!empty($input['identifier'])) {
                    $newIdent = trim($input['identifier']);
                    $stmtCheck = $db->prepare("SELECT id FROM branches WHERE identifier = :ident AND id != :id LIMIT 1");
                    $stmtCheck->execute(['ident' => $newIdent, 'id' => $branchId]);
                    if ($stmtCheck->fetchColumn() !== false) {
                        $db->rollBack();
                        http_response_code(400);
                        echo json_encode(['status' => 'error', 'message' => "Identifier '{$newIdent}' is already in use by another branch."]);
                        exit();
                    }
                }

                $stmt = $db->prepare("UPDATE branches SET
                    identifier = COALESCE(:ident, identifier),
                    name = COALESCE(:name, name),
                    address = COALESCE(:addr, address),
                    phone = COALESCE(:phone, phone),
                    lat = COALESCE(:lat, lat),
                    long = COALESCE(:lng, long),
                    is_active = COALESCE(:status, is_active),
                    reservation_url = COALESCE(:res, reservation_url),
                    delivery_url = COALESCE(:del, delivery_url),
                    pickup_url = COALESCE(:pick, pickup_url),
                    location_url = COALESCE(:loc, location_url),
                    pdf_dinein1 = COALESCE(:pdf1, pdf_dinein1),
                    pdf_dinein2 = COALESCE(:pdf2, pdf_dinein2),
                    updated_at = CURRENT_TIMESTAMP
                    WHERE id = :id");

                $stmt->execute([
                    'ident' => !empty($input['identifier']) ? trim($input['identifier']) : null,
                    'name' => $input['name'] ?? null,
                    'addr' => $input['address'] ?? null,
                    'phone' => $input['phone'] ?? null,
                    'lat' => isset($input['lat']) ? (float)$input['lat'] : null,
                    'lng' => isset($input['long']) ? (float)$input['long'] : null,
                    'status' => isset($input['isActive']) ? ($input['isActive'] ? 1 : 0) : null,
                    'res' => $input['redirects']['reservation'] ?? null,
                    'del' => $input['redirects']['delivery'] ?? null,
                    'pick' => $input['redirects']['pickup'] ?? null,
                    'loc' => $input['redirects']['location'] ?? null,
                    'pdf1' => $input['redirects']['pdf']['dinein1'] ?? null,
                    'pdf2' => $input['redirects']['pdf']['dinein2'] ?? null,
                    'id' => $branchId
                ]);

                // Schedules
                if (isset($input['openingTime']) && is_array($input['openingTime'])) {
                    $db->prepare("DELETE FROM branch_schedules WHERE branch_id = :bid")->execute(['bid' => $branchId]);
                    $schedStmt = $db->prepare("INSERT INTO branch_schedules (branch_id, schedule_type, day_pt, day_en, time_pt, time_en, display_order)
                        VALUES (:bid, 'opening', :day_pt, :day_en, :time_pt, :time_en, :order)");
                    $order = 1;
                    foreach ($input['openingTime'] as $s) {
                        $schedStmt->execute([
                            'bid' => $branchId,
                            'day_pt' => $s['dayPt'] ?? '',
                            'day_en' => $s['dayEn'] ?? '',
                            'time_pt' => $s['timePt'] ?? '',
                            'time_en' => $s['timeEn'] ?? '',
                            'order' => $order++
                        ]);
                    }
                }

                // Reviews
                if (isset($input['reviews']) && is_array($input['reviews'])) {
                    $db->prepare("DELETE FROM branch_reviews WHERE branch_id = :bid")->execute(['bid' => $branchId]);
                    $revStmt = $db->prepare("INSERT INTO branch_reviews (branch_id, name, url, display_order) VALUES (:bid, :name, :url, :order)");
                    $order = 1;
                    foreach ($input['reviews'] as $r) {
                        if (!empty($r['name']) && !empty($r['url'])) {
                            $revStmt->execute([
                                'bid' => $branchId,
                                'name' => $r['name'],
                                'url' => $r['url'],
                                'order' => $order++
                            ]);
                        }
                    }
                }
            }

            $db->commit();
            $updatedBranch = fetchBranchesData($db, $branchId);

            http_response_code(200);
            echo json_encode([
                'status' => 'success',
                'message' => $section !== 'all' ? "Section '{$section}' updated successfully" : 'Branch updated successfully',
                'section' => $section,
                'data' => $updatedBranch,
                'updatedAt' => date('Y-m-d H:i:s')
            ]);
        } catch (Exception $e) {
            $db->rollBack();
            throw $e;
        }
    } elseif ($method === 'DELETE') {
        $identifier = isset($_GET['identifier']) ? trim($_GET['identifier']) : null;
        $id = isset($_GET['id']) ? trim($_GET['id']) : null;
        $targetKey = $identifier !== null && $identifier !== '' ? $identifier : ($id !== null && $id !== '' ? $id : null);

        if (!$targetKey) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Missing branch ID or identifier to delete']);
            exit();
        }

        $branchId = findBranchId($db, $targetKey);
        if (!$branchId) {
            // Already deleted / not found
            http_response_code(200);
            echo json_encode([
                'status' => 'success',
                'message' => "Branch '{$targetKey}' deleted successfully"
            ]);
            exit();
        }

        $stmt = $db->prepare("DELETE FROM branches WHERE id = :id");
        $stmt->execute(['id' => $branchId]);

        http_response_code(200);
        echo json_encode([
            'status' => 'success',
            'message' => "Branch '{$targetKey}' deleted successfully"
        ]);
    } else {
        http_response_code(405);
        echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
