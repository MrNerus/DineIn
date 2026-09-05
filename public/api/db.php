<?php
/**
 * SQLite Database Connection and Entity Mapper Helper
 * Conforms to public/api/sqliteschema.txt
 */

function getDb(): PDO {
    static $db = null;
    if ($db !== null) {
        return $db;
    }

    $dataDir = __DIR__ . '/data';
    if (!is_dir($dataDir)) {
        mkdir($dataDir, 0777, true);
    }

    $dbFile = $dataDir . '/data';
    $db = new PDO('sqlite:' . $dbFile);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    $db->exec("PRAGMA foreign_keys = ON;");

    // Auto-create schema if tables do not exist
    initSchema($db);

    // Auto-seed if users table is empty
    ensureInitialData($db);

    return $db;
}

function initSchema(PDO $db): void {
    $db->exec("
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            name TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'admin',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS company (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            logo TEXT,
            favicon TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS socials (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            profile TEXT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS apps (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            url TEXT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS company_delivery_partners (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            url TEXT NULL,
            display_order INTEGER DEFAULT 0,
            is_active INTEGER DEFAULT 1 CHECK(is_active IN (0, 1)),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS company_notices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            image_url TEXT NOT NULL,
            title TEXT,
            target_url TEXT,
            display_order INTEGER DEFAULT 0,
            is_active INTEGER DEFAULT 1 CHECK(is_active IN (0, 1)),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS branches (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            identifier TEXT NOT NULL UNIQUE,
            name TEXT NOT NULL,
            address TEXT NOT NULL,
            phone TEXT NOT NULL,
            lat REAL,
            long REAL,
            is_active INTEGER NOT NULL DEFAULT 1 CHECK(is_active IN (0, 1)),
            reservation_url TEXT,
            delivery_url TEXT,
            pickup_url TEXT,
            location_url TEXT,
            pdf_dinein1 TEXT,
            pdf_dinein2 TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS branch_schedules (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            branch_id INTEGER NOT NULL,
            schedule_type TEXT NOT NULL DEFAULT 'opening' CHECK(schedule_type IN ('opening', 'delivery', 'pickup')),
            day_pt TEXT,
            day_en TEXT,
            time_pt TEXT NOT NULL,
            time_en TEXT NOT NULL,
            display_order INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS branch_reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            branch_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            url TEXT NOT NULL,
            display_order INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_branches_identifier ON branches(identifier);
        CREATE INDEX IF NOT EXISTS idx_branches_is_active ON branches(is_active);
        CREATE INDEX IF NOT EXISTS idx_branch_schedules_branch_id ON branch_schedules(branch_id);
        CREATE INDEX IF NOT EXISTS idx_branch_reviews_branch_id ON branch_reviews(branch_id);
    ");
}

function ensureInitialData(PDO $db): void {
    $userCount = $db->query("SELECT COUNT(*) FROM users")->fetchColumn();
    if ($userCount > 0) {
        return;
    }

    $db->beginTransaction();
    try {
        // 1. Users
        $stmt = $db->prepare("INSERT INTO users (id, username, password, name, role) VALUES (1, 'admin', 'admin123', 'Savana Administrator', 'admin')");
        $stmt->execute();

        // 2. Company
        $stmt = $db->prepare("INSERT INTO company (id, name, logo, favicon) VALUES (1, 'Savana Sushi', 'assets/imgs/logo.png', 'assets/imgs/logo.png')");
        $stmt->execute();

        // 3. Socials
        $stmt = $db->prepare("INSERT INTO socials (name, profile) VALUES (:name, :profile)");
        $stmt->execute(['name' => 'facebook', 'profile' => 'https://www.facebook.com/savanasushi']);
        $stmt->execute(['name' => 'instagram', 'profile' => 'https://www.instagram.com/savana.sushi']);

        // 4. Apps
        $stmt = $db->prepare("INSERT INTO apps (name, url) VALUES (:name, :url)");
        $stmt->execute(['name' => 'google_play_store', 'url' => 'https://play.google.com/']);
        $stmt->execute(['name' => 'apple_app_store', 'url' => 'https://apps.apple.com/']);

        // 5. Company Delivery Partners
        $stmt = $db->prepare("INSERT INTO company_delivery_partners (name, url, display_order, is_active) VALUES (:name, :url, :order, 1)");
        $stmt->execute([
            'name' => 'Uber Eats',
            'url' => 'https://www.ubereats.com/store/savana-sushi-amadora/cwzXn1P5RNODeKdRpNeZig?diningMode=DELIVERY',
            'order' => 1
        ]);
        $stmt->execute([
            'name' => 'Glovo',
            'url' => 'https://glovoapp.com/pt/pt/lisboa/savana-sushi-amadora-lis/',
            'order' => 2
        ]);
        $stmt->execute([
            'name' => 'Bolt Food',
            'url' => 'https://food.bolt.eu/',
            'order' => 3
        ]);

        // 6. Company Notices
        $stmt = $db->prepare("INSERT INTO company_notices (image_url, display_order, is_active) VALUES (:url, :order, 1)");
        $stmt->execute(['url' => 'assets/imgs/Ads1.jpg', 'order' => 1]);
        $stmt->execute(['url' => 'assets/imgs/Ads2.png', 'order' => 2]);
        $stmt->execute(['url' => 'assets/imgs/Ads3.jpg', 'order' => 3]);

        // 7. Branches
        $branchStmt = $db->prepare("INSERT INTO branches (
            identifier, name, address, phone, lat, long, is_active,
            reservation_url, delivery_url, pickup_url, location_url, pdf_dinein1, pdf_dinein2
        ) VALUES (
            :identifier, :name, :address, :phone, :lat, :long, :is_active,
            :reservation_url, :delivery_url, :pickup_url, :location_url, :pdf_dinein1, :pdf_dinein2
        )");

        // Branch 1: Amadora
        $branchStmt->execute([
            'identifier' => 'Amadora',
            'name' => 'Amadora',
            'address' => '1R. Dr. António José de Almeida 10A, 2700-269 Amadora',
            'phone' => '+351214952367',
            'lat' => 38.755245291772184,
            'long' => -9.220227233102092,
            'is_active' => 1,
            'reservation_url' => 'https://reservation.umai.io/en/widget/savana-sushi-amadora',
            'delivery_url' => 'https://reservation.umai.io/en/widget/savana-sushi-amadora?party_size=2',
            'pickup_url' => 'https://reservation.umai.io/en/widget/savana-sushi-amadora?party_size=2',
            'location_url' => 'https://maps.app.goo.gl/XmMZ91ucpEXyWpZg9?g_st=ipc',
            'pdf_dinein1' => 'assets/pdfs/Menu.pdf',
            'pdf_dinein2' => 'assets/pdfs/SavanaSushi_Amadora_Rodizio.pdf'
        ]);
        $amadoraId = (int)$db->lastInsertId();

        // Branch 2: Sintra
        $branchStmt->execute([
            'identifier' => 'Sintra',
            'name' => 'Mem Martins - Sintra',
            'address' => 'Estr. Algueirão 21, 2725-025 Algueirão-Mem Martins',
            'phone' => '+351210133261',
            'lat' => 38.79846169317772,
            'long' => -9.341457822088252,
            'is_active' => 1,
            'reservation_url' => 'https://reservation.umai.io/en/widget/savana-sushi-mem-martins',
            'delivery_url' => 'https://reservation.umai.io/en/widget/savana-sushi-mem-martins?party_size=2',
            'pickup_url' => 'https://reservation.umai.io/en/widget/savana-sushi-mem-martins?party_size=2',
            'location_url' => 'https://maps.app.goo.gl/gRD6ZAo21mNFAn3N6?g_st=iwb',
            'pdf_dinein1' => 'assets/pdfs/Menu.pdf',
            'pdf_dinein2' => 'assets/pdfs/SavanaSushi_MemMartins_Rodizio.pdf'
        ]);
        $sintraId = (int)$db->lastInsertId();

        // 8. Branch Schedules
        $schedStmt = $db->prepare("INSERT INTO branch_schedules (branch_id, schedule_type, day_pt, day_en, time_pt, time_en, display_order)
            VALUES (:bid, :type, :day_pt, :day_en, :time_pt, :time_en, :order)");

        $branchesSchedules = [
            $amadoraId => ['day_pt' => 'Segunda a domingo', 'day_en' => 'Monday to Sunday', 'time_pt' => 'das 11h às 15h30, das 18h às 23h', 'time_en' => '11 AM to 3:30 PM, 6 PM to 11 PM'],
            $sintraId => ['day_pt' => 'Segunda a domingo', 'day_en' => 'Monday to Sunday', 'time_pt' => 'das 11h às 15h30, das 18h às 23h', 'time_en' => '11 AM to 3:30 PM, 6 PM to 11 PM']
        ];

        foreach ($branchesSchedules as $bId => $sched) {
            $schedStmt->execute([
                'bid' => $bId,
                'type' => 'opening',
                'day_pt' => $sched['day_pt'],
                'day_en' => $sched['day_en'],
                'time_pt' => $sched['time_pt'],
                'time_en' => $sched['time_en'],
                'order' => 1
            ]);
        }

        // 9. Branch Reviews
        $revStmt = $db->prepare("INSERT INTO branch_reviews (branch_id, name, url, display_order) VALUES (:bid, :name, :url, :order)");
        
        // Amadora Reviews
        $revStmt->execute(['bid' => $amadoraId, 'name' => 'Google', 'url' => 'https://www.google.com/search?q=savana+sushi+amadora', 'order' => 1]);
        $revStmt->execute(['bid' => $amadoraId, 'name' => 'Tripadvisor', 'url' => 'https://www.tripadvisor.com/Restaurant_Review-g189158-d25118790-Reviews-Savana_Sushi-Lisbon_Lisbon_District_Central_Portugal.html', 'order' => 2]);
        $revStmt->execute(['bid' => $amadoraId, 'name' => 'The Fork', 'url' => 'https://www.zomato.com/pt/lisboa/savana-sushi-alvalade', 'order' => 3]);

        // Sintra Reviews
        $revStmt->execute(['bid' => $sintraId, 'name' => 'Google', 'url' => 'https://www.google.com/search?q=savana+sushi+mem+martins', 'order' => 1]);
        $revStmt->execute(['bid' => $sintraId, 'name' => 'Tripadvisor', 'url' => 'https://www.tripadvisor.com/Restaurant_Review-g189158-d25118790-Reviews-Savana_Sushi-Lisbon_Lisbon_District_Central_Portugal.html', 'order' => 2]);
        $revStmt->execute(['bid' => $sintraId, 'name' => 'The Fork', 'url' => 'https://www.zomato.com/pt/lisboa/savana-sushi-alvalade', 'order' => 3]);

        $db->commit();
    } catch (Exception $e) {
        $db->rollBack();
        error_log("Failed to seed initial data: " . $e->getMessage());
    }
}

/**
 * Maps relational tables to the expected CompanyInfo JSON structure
 */
function fetchCompanyData(PDO $db): array {
    $stmt = $db->query("SELECT * FROM company ORDER BY id ASC LIMIT 1");
    $company = $stmt->fetch();
    if (!$company) {
        $company = [
            'name' => 'Savana Sushi',
            'logo' => 'assets/imgs/logo.png',
            'favicon' => 'assets/imgs/logo.png'
        ];
    }

    // Apps
    $appsStmt = $db->query("SELECT name, url FROM apps");
    $appsRows = $appsStmt->fetchAll();
    $apps = [
        'googlePlayStore' => null,
        'appleAppStore' => null
    ];
    foreach ($appsRows as $row) {
        $n = strtolower(str_replace(['_', '-'], '', $row['name']));
        if ($n === 'googleplaystore' || $n === 'googleplay') {
            $apps['googlePlayStore'] = $row['url'];
        } elseif ($n === 'appleappstore' || $n === 'applestore' || $n === 'ios') {
            $apps['appleAppStore'] = $row['url'];
        }
    }

    // Socials
    $socialsStmt = $db->query("SELECT name, profile FROM socials");
    $socialsRows = $socialsStmt->fetchAll();
    $socials = [
        'facebook' => null,
        'instagram' => null
    ];
    foreach ($socialsRows as $row) {
        $n = strtolower(trim($row['name']));
        if ($n === 'facebook') {
            $socials['facebook'] = $row['profile'];
        } elseif ($n === 'instagram') {
            $socials['instagram'] = $row['profile'];
        }
    }

    // Delivery Partners
    $dpStmt = $db->query("SELECT name, url FROM company_delivery_partners WHERE is_active = 1 ORDER BY display_order ASC, id ASC");
    $deliveryPartners = [];
    while ($row = $dpStmt->fetch()) {
        $deliveryPartners[] = [
            'name' => $row['name'],
            'url' => $row['url'] ?? ''
        ];
    }

    // Notices
    $noticesStmt = $db->query("SELECT image_url FROM company_notices WHERE is_active = 1 ORDER BY display_order ASC, id ASC");
    $notices = $noticesStmt->fetchAll(PDO::FETCH_COLUMN);

    return [
        'name' => $company['name'],
        'logo' => $company['logo'] ?? '',
        'favicon' => $company['favicon'] ?? '',
        'apps' => $apps,
        'socials' => $socials,
        'deliveryPartners' => $deliveryPartners,
        'notice' => $notices
    ];
}

/**
 * Updates company tables from CompanyInfo payload
 */
function updateCompanyData(PDO $db, array $data): array {
    $db->beginTransaction();
    try {
        // 1. Update company basic info
        $companyName = $data['name'] ?? 'Savana Sushi';
        $companyLogo = $data['logo'] ?? 'assets/imgs/logo.png';
        $companyFavicon = $data['favicon'] ?? 'assets/imgs/logo.png';

        $stmt = $db->query("SELECT id FROM company LIMIT 1");
        $exists = $stmt->fetchColumn();
        if ($exists) {
            $updateStmt = $db->prepare("UPDATE company SET name = :name, logo = :logo, favicon = :favicon, updated_at = CURRENT_TIMESTAMP WHERE id = :id");
            $updateStmt->execute([
                'name' => $companyName,
                'logo' => $companyLogo,
                'favicon' => $companyFavicon,
                'id' => $exists
            ]);
        } else {
            $insertStmt = $db->prepare("INSERT INTO company (name, logo, favicon) VALUES (:name, :logo, :favicon)");
            $insertStmt->execute([
                'name' => $companyName,
                'logo' => $companyLogo,
                'favicon' => $companyFavicon
            ]);
        }

        // 2. Apps
        if (isset($data['apps']) && is_array($data['apps'])) {
            $db->exec("DELETE FROM apps");
            $appStmt = $db->prepare("INSERT INTO apps (name, url) VALUES (:name, :url)");
            if (!empty($data['apps']['googlePlayStore'])) {
                $appStmt->execute(['name' => 'google_play_store', 'url' => $data['apps']['googlePlayStore']]);
            }
            if (!empty($data['apps']['appleAppStore'])) {
                $appStmt->execute(['name' => 'apple_app_store', 'url' => $data['apps']['appleAppStore']]);
            }
        }

        // 3. Socials
        if (isset($data['socials']) && is_array($data['socials'])) {
            $db->exec("DELETE FROM socials");
            $socialStmt = $db->prepare("INSERT INTO socials (name, profile) VALUES (:name, :profile)");
            if (!empty($data['socials']['facebook'])) {
                $socialStmt->execute(['name' => 'facebook', 'profile' => $data['socials']['facebook']]);
            }
            if (!empty($data['socials']['instagram'])) {
                $socialStmt->execute(['name' => 'instagram', 'profile' => $data['socials']['instagram']]);
            }
        }

        // 4. Delivery Partners
        if (isset($data['deliveryPartners']) && is_array($data['deliveryPartners'])) {
            $db->exec("DELETE FROM company_delivery_partners");
            $dpStmt = $db->prepare("INSERT INTO company_delivery_partners (name, url, display_order, is_active) VALUES (:name, :url, :order, 1)");
            $order = 1;
            foreach ($data['deliveryPartners'] as $partner) {
                if (!empty($partner['name'])) {
                    $dpStmt->execute([
                        'name' => $partner['name'],
                        'url' => $partner['url'] ?? '',
                        'order' => $order++
                    ]);
                }
            }
        }

        // 5. Notices
        if (isset($data['notice']) && is_array($data['notice'])) {
            $db->exec("DELETE FROM company_notices");
            $noticeStmt = $db->prepare("INSERT INTO company_notices (image_url, display_order, is_active) VALUES (:url, :order, 1)");
            $order = 1;
            foreach ($data['notice'] as $imageUrl) {
                if (!empty($imageUrl) && is_string($imageUrl)) {
                    $noticeStmt->execute([
                        'url' => $imageUrl,
                        'order' => $order++
                    ]);
                }
            }
        }

        $db->commit();
        return fetchCompanyData($db);
    } catch (Exception $e) {
        $db->rollBack();
        throw $e;
    }
}

/**
 * Maps relational tables to Branch[] or Branch JSON structure
 */
function fetchBranchesData(PDO $db, $idOrIdentifier = null) {
    $sql = "SELECT * FROM branches";
    $params = [];

    if ($idOrIdentifier !== null) {
        $sql .= " WHERE (identifier = :ident OR CAST(id AS TEXT) = :ident_str";
        $params['ident'] = $idOrIdentifier;
        $params['ident_str'] = (string)$idOrIdentifier;

        if (preg_match('/^branch_(\d+)$/i', (string)$idOrIdentifier, $matches)) {
            $sql .= " OR id = :numeric_id";
            $params['numeric_id'] = (int)$matches[1];
        }
        $sql .= ")";
    }

    $sql .= " ORDER BY id ASC";

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    $branches = [];
    foreach ($rows as $row) {
        $branchId = (int)$row['id'];

        // Schedules
        $schedStmt = $db->prepare("SELECT * FROM branch_schedules WHERE branch_id = :bid ORDER BY display_order ASC, id ASC");
        $schedStmt->execute(['bid' => $branchId]);
        $allSchedules = $schedStmt->fetchAll();

        $openingTime = [];
        $deliveryTime = [];
        $pickupTime = [];

        foreach ($allSchedules as $s) {
            $item = [
                'dayPt' => $s['day_pt'] ?? '',
                'dayEn' => $s['day_en'] ?? '',
                'timePt' => $s['time_pt'] ?? '',
                'timeEn' => $s['time_en'] ?? ''
            ];
            $type = strtolower($s['schedule_type']);
            if ($type === 'opening') {
                $openingTime[] = $item;
            } elseif ($type === 'delivery') {
                $deliveryTime[] = $item;
            } elseif ($type === 'pickup') {
                $pickupTime[] = $item;
            }
        }

        // Reviews
        $revStmt = $db->prepare("SELECT name, url FROM branch_reviews WHERE branch_id = :bid ORDER BY display_order ASC, id ASC");
        $revStmt->execute(['bid' => $branchId]);
        $reviews = $revStmt->fetchAll();

        $branches[] = [
            'id' => $branchId,
            'identifier' => $row['identifier'],
            'name' => $row['name'],
            'address' => $row['address'],
            'phone' => $row['phone'],
            'lat' => (float)$row['lat'],
            'long' => (float)$row['long'],
            'isActive' => (bool)$row['is_active'],
            'openingTime' => $openingTime,
            'deliveryTime' => !empty($deliveryTime) ? $deliveryTime : $openingTime,
            'pickupTime' => !empty($pickupTime) ? $pickupTime : $openingTime,
            'redirects' => [
                'reservation' => $row['reservation_url'] ?? '',
                'delivery' => $row['delivery_url'] ?? '',
                'pickup' => $row['pickup_url'] ?? '',
                'googleReview' => null,
                'location' => $row['location_url'] ?? '',
                'pdf' => [
                    'dinein1' => $row['pdf_dinein1'] ?? '',
                    'dinein2' => $row['pdf_dinein2'] ?? ''
                ]
            ],
            'reviews' => array_map(function($r) {
                return ['name' => $r['name'], 'url' => $r['url']];
            }, $reviews)
        ];
    }

    if ($idOrIdentifier !== null) {
        return !empty($branches) ? $branches[0] : null;
    }

    return $branches;
}

/**
 * Finds branch primary key by id or identifier
 */
function findBranchId(PDO $db, $idOrIdentifier): ?int {
    $stmt = $db->prepare("
        SELECT id FROM branches 
        WHERE identifier = :val OR CAST(id AS TEXT) = :val_str
        LIMIT 1
    ");
    $stmt->execute(['val' => $idOrIdentifier, 'val_str' => (string)$idOrIdentifier]);
    $id = $stmt->fetchColumn();
    if ($id !== false) {
        return (int)$id;
    }

    if (preg_match('/^branch_(\d+)$/i', (string)$idOrIdentifier, $m)) {
        $stmt2 = $db->prepare("SELECT id FROM branches WHERE id = :id LIMIT 1");
        $stmt2->execute(['id' => (int)$m[1]]);
        $id2 = $stmt2->fetchColumn();
        if ($id2 !== false) {
            return (int)$id2;
        }
    }

    return null;
}

