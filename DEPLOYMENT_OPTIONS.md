# 🚀 Deployment-Optionen für Weihnachtsbaum-App

Es gibt verschiedene Wege, die App zu deployen - von ganz einfach bis voll automatisiert.

## 📊 Vergleichstabelle

| Option | Komplexität | Kosten | Auto-Upload | Setup-Zeit |
|--------|-------------|--------|-------------|------------|
| **GitHub Pages nur** | Sehr einfach | Kostenlos | ❌ | 5 Min |
| **Manuelles Hinzufügen** | Einfach | Kostenlos | ❌ | 5 Min |
| **Netlify** | Mittel | Kostenlos | ✅ | 15 Min |
| **Vercel** | Mittel | Kostenlos | ✅ | 15 Min |
| **Cloudflare Pages** | Mittel | Kostenlos | ✅ | 20 Min |
| **Eigener Server** | Komplex | Variabel | ✅ | 1+ Std |

---

## Option 1: GitHub Pages (nur Display) ⭐ **EINFACHSTE OPTION**

**Vorteile**:
- Kostenlos
- Sehr einfach
- Perfekt für kleine Teams

**Nachteile**:
- Kein automatischer Upload
- Fotos müssen manuell hinzugefügt werden

### Setup:

1. **GitHub Pages aktivieren**:
   ```
   Repository Settings → Pages → Source: GitHub Actions
   ```

2. **Fotos manuell hinzufügen**:
   ```bash
   # Foto vorbereiten (400x400px, als Base64)
   # Datei data/photos.json bearbeiten
   git add data/photos.json
   git commit -m "Add new photo"
   git push
   ```

3. **Oder: Upload-Seite als Hilfstool nutzen**:
   - Öffne `upload.html` lokal im Browser
   - Lade Foto hoch (wird in localStorage gespeichert)
   - Öffne Browser-Konsole (F12)
   - Kopiere Daten aus localStorage:
   ```javascript
   console.log(JSON.stringify(JSON.parse(localStorage.getItem('treePhotoData')), null, 2))
   ```
   - Füge in `data/photos.json` ein
   - Committe und pushe

**URL**: `https://username.github.io/xmastree/`

**Ideal für**: Teams mit <20 Personen, einmaliges Event

---

## Option 2: Netlify ⭐ **EMPFOHLEN FÜR AUTO-UPLOAD**

**Vorteile**:
- Kostenlos
- Automatischer Upload funktioniert
- Einfaches Setup
- Drag & Drop Deployment möglich

**Nachteile**:
- Netlify-Account nötig
- GitHub Token erforderlich

### Setup:

1. **Account erstellen**: [netlify.com](https://netlify.com)

2. **Deployment**:

   **Option A: Drag & Drop**
   - Zippe dein Projekt-Verzeichnis
   - Gehe zu [app.netlify.com/drop](https://app.netlify.com/drop)
   - Ziehe ZIP auf die Seite

   **Option B: GitHub Integration (empfohlen)**
   - "New site from Git" klicken
   - GitHub Repository verbinden
   - Build settings: leer lassen (statische Seite)
   - Deploy

3. **Environment Variables setzen**:
   ```
   Site Settings → Environment Variables → Add a variable

   GITHUB_TOKEN=ghp_xxx    (Personal Access Token)
   GITHUB_REPO=owner/repo  (z.B. "ypoxx/xmastree")
   GITHUB_BRANCH=main
   ```

4. **Redeploy** nach Env-Vars (Site Overview → Trigger deploy)

5. **Testen**:
   - Öffne `https://your-site.netlify.app/upload.html`
   - Lade Test-Foto hoch
   - Check GitHub: Neuer Commit sollte da sein!

**Function-URL**: `https://your-site.netlify.app/api/upload`

**Ideal für**: Alle Teamgrößen, automatischer Upload gewünscht

---

## Option 3: Vercel

Siehe [SETUP.md](./SETUP.md) für vollständige Anleitung.

Identisch zu Netlify, alternative Plattform. Beide sind gleich gut!

---

## Option 4: Manuelles Hinzufügen (ohne Code) ⭐ **FÜR NICHT-ENTWICKLER**

**Super einfach, ohne Programmieren!**

### Workflow:

1. **Team-Mitglied**: Schickt Foto per E-Mail an dich

2. **Du (Admin)**:
   - Öffne https://www.base64-image.de/
   - Lade Foto hoch → Größe auf 400x400px setzen
   - Kopiere Base64-String (beginnt mit `data:image/jpeg;base64,`)
   - Öffne `data/photos.json` auf GitHub im Browser
   - Klicke "Edit" (Stift-Icon)
   - Füge neues Foto zum Array hinzu:
   ```json
   {
     "id": "foto-1",
     "imageData": "HIER_BASE64_STRING_EINFÜGEN",
     "uploadedAt": "2025-11-20T10:00:00Z",
     "timestamp": 1700475600000
   }
   ```
   - Erhöhe `totalCount` in metadata
   - Klicke "Commit changes"

3. **Fertig!** Foto erscheint automatisch am Baum (nach Reload)

**Ideal für**: Kleine Teams, wenig technisches Know-how, <20 Fotos

---

## Option 5: Eigener Server (PHP)

Falls du bereits einen Webserver mit PHP hast:

### PHP Upload-Script:

```php
<?php
// api/upload.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$imageData = $data['imageData'] ?? null;

if (!$imageData) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing imageData']);
    exit;
}

// Validate image format
if (strpos($imageData, 'data:image/jpeg;base64,') !== 0 &&
    strpos($imageData, 'data:image/png;base64,') !== 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid image format']);
    exit;
}

// Load current photos
$photosFile = '../data/photos.json';
if (file_exists($photosFile)) {
    $photoData = json_decode(file_get_contents($photosFile), true);
} else {
    $photoData = [
        'photos' => [],
        'metadata' => [
            'totalCount' => 0,
            'maxPhotos' => 130,
            'lastUpdated' => date('c')
        ]
    ];
}

// Check limit
if (count($photoData['photos']) >= $photoData['metadata']['maxPhotos']) {
    http_response_code(400);
    echo json_encode(['error' => 'Tree is full']);
    exit;
}

// Add new photo
$newPhoto = [
    'id' => uniqid('photo-', true),
    'imageData' => $imageData,
    'uploadedAt' => date('c'),
    'timestamp' => round(microtime(true) * 1000)
];

$photoData['photos'][] = $newPhoto;
$photoData['metadata']['totalCount'] = count($photoData['photos']);
$photoData['metadata']['lastUpdated'] = date('c');

// Save
$success = file_put_contents($photosFile, json_encode($photoData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

if ($success === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save photo']);
    exit;
}

echo json_encode([
    'success' => true,
    'photoCount' => $photoData['metadata']['totalCount'],
    'message' => 'Foto erfolgreich hochgeladen!'
]);
?>
```

**Setup**:
1. Hochladen auf deinen Webspace
2. `data/` Verzeichnis beschreibbar machen (chmod 777)
3. In `js/photo-upload.js` API-URL anpassen
4. Fertig!

---

## 🎯 Empfehlung nach Szenario

### Kleines Team (5-20 Personen), einmaliges Event
→ **GitHub Pages + manuelles Hinzufügen**
- ✅ Einfachste Lösung
- ✅ 5 Minuten Setup
- ✅ Kein zusätzlicher Service nötig
- ✅ Kostenlos

### Mittleres Team (20-100 Personen)
→ **Netlify mit Serverless Function**
- ✅ Automatischer Upload
- ✅ Kostenlos
- ✅ Wartungsfrei
- ✅ 15 Minuten Setup

### Großes Team (100+ Personen)
→ **Vercel oder Cloudflare Pages**
- ✅ Mehr Performance
- ✅ Besseres Monitoring
- ✅ Skaliert automatisch

### Bereits eigener Server vorhanden
→ **PHP auf eigenem Server**
- ✅ Keine Abhängigkeit von Drittanbietern
- ✅ Volle Kontrolle
- ✅ Keine zusätzlichen Accounts

### Gar keine Technik-Kenntnisse
→ **Manuelles Hinzufügen per GitHub Web-Interface**
- ✅ Kein Code
- ✅ Kein Deployment
- ✅ Fotos per E-Mail sammeln
- ✅ Copy & Paste in GitHub

---

## 💡 Quick-Start Empfehlungen

### Sofortiger Start (5 Minuten) - NUR DISPLAY

```bash
# 1. GitHub Pages aktivieren
# Gehe zu: Repository Settings → Pages → Source: GitHub Actions

# 2. Warte auf Deployment (1-2 Minuten)

# 3. Fertig!
# Öffne: https://username.github.io/xmastree/
```

Fotos kannst du später manuell hinzufügen (siehe Option 4 oben).

### Mit automatischem Upload (15 Minuten)

**Netlify-Weg**:
```bash
# 1. GitHub Personal Access Token erstellen
#    https://github.com/settings/tokens
#    Scope: "repo"

# 2. Netlify Account erstellen
#    https://netlify.com

# 3. "New site from Git" → GitHub Repository verbinden

# 4. Environment Variables setzen:
#    GITHUB_TOKEN, GITHUB_REPO, GITHUB_BRANCH

# 5. Redeploy → Fertig!
```

---

## ❓ Häufige Fragen

**Q: Brauche ich zwingend Vercel oder Netlify?**
A: Nein! GitHub Pages reicht für Display. Fotos kannst du manuell hinzufügen oder per PHP auf eigenem Server.

**Q: Was ist die schnellste Lösung zum Starten?**
A: GitHub Pages aktivieren = 5 Minuten. Fotos später manuell hinzufügen.

**Q: Was ist die beste Lösung für viele Personen (>50)?**
A: Netlify oder Vercel mit automatischem Upload. Skaliert problemlos.

**Q: Kostet das was?**
A: Nein! Alle empfohlenen Optionen sind im Free-Tier kostenlos.

**Q: Kann ich auf mehreren Plattformen gleichzeitig sein?**
A: Ja! GitHub Pages für Display + Netlify für Upload-Backend funktioniert parallel.

**Q: Was wenn ich schon WordPress/Webspace habe?**
A: Nutze die PHP-Lösung! Einfach `api/upload.php` hochladen.

**Q: Muss ich die Fotos in Git commiten?**
A: Bei GitHub Pages ja. Bei Netlify/Vercel/PHP optional (da API automatisch committet).

---

## 🔒 Sicherheitshinweise

Egal welche Option:

1. **GitHub Token niemals im Frontend-Code**
   - Nur in Environment Variables auf Server
   - Nur `repo` Scope erforderlich

2. **Validierung**
   - Nur Bilder erlauben (JPEG/PNG)
   - Maximale Größe: 200KB
   - Format prüfen

3. **Rate Limiting**
   - Cookie verhindert Mehrfach-Upload
   - 130-Foto-Limit im Code

---

## 🎄 Zusammenfassung

**Du hast die Wahl**:

1. 🚀 **Schnell & Einfach**: GitHub Pages + manuell (5 Min)
2. ⚡ **Automatisch**: Netlify/Vercel (15 Min)
3. 💻 **Eigener Server**: PHP-Script (30 Min)
4. 📧 **Ganz ohne Code**: E-Mail sammeln + Copy & Paste (variabel)

**Alle Wege führen zum Weihnachtsbaum!** 🌟

Wähle basierend auf:
- Team-Größe
- Technisches Know-how
- Verfügbare Zeit
- Vorhandene Infrastruktur

Für die meisten empfehle ich: **GitHub Pages für Display + bei Bedarf später Netlify für Upload hinzufügen**.
