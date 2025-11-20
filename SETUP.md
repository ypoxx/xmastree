# 🚀 Setup-Anleitung: GitHub API Upload-Backend

Diese Anleitung zeigt, wie du das Upload-Backend mit GitHub API und Vercel einrichtest.

## Übersicht

Das System besteht aus:
- **Frontend**: Statische HTML/CSS/JS-Dateien (GitHub Pages oder Vercel)
- **Backend**: Vercel Serverless Function (`/api/upload`)
- **Storage**: GitHub Repository (`data/photos.json`)

## Voraussetzungen

- GitHub Account
- Vercel Account (kostenlos auf [vercel.com](https://vercel.com))
- Git installiert

## 📋 Schritt-für-Schritt Setup

### 1. GitHub Personal Access Token erstellen

Das Backend benötigt einen Token, um Commits zu machen.

1. Gehe zu GitHub Settings: https://github.com/settings/tokens
2. Klicke auf **"Generate new token"** → **"Generate new token (classic)"**
3. Gib dem Token einen Namen: z.B. "Xmastree Upload"
4. Wähle Ablaufdatum: z.B. 90 Tage (oder länger)
5. **Wähle Scopes**:
   - ✅ `repo` (Full control of private repositories)
     - Gibt Zugriff auf alle Repo-Operationen inkl. Commits
6. Klicke **"Generate token"**
7. **WICHTIG**: Kopiere den Token sofort (wird nur einmal angezeigt!)
   - Format: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxx`

### 2. Repository auf Vercel deployen

#### Option A: Vercel CLI (Empfohlen)

```bash
# Vercel CLI installieren
npm install -g vercel

# Im Projekt-Verzeichnis
cd xmastree

# Login bei Vercel
vercel login

# Projekt deployen
vercel

# Bei den Fragen:
# - "Set up and deploy?" → Yes
# - "Which scope?" → Dein Account
# - "Link to existing project?" → No
# - "What's your project's name?" → xmastree
# - "In which directory is your code located?" → ./
```

#### Option B: Vercel Dashboard

1. Gehe zu [vercel.com/new](https://vercel.com/new)
2. Importiere dein GitHub Repository
3. Klicke auf **"Deploy"**

### 3. Environment Variables in Vercel setzen

Nach dem Deployment:

1. Gehe zum Vercel Dashboard → Dein Projekt
2. Navigiere zu **Settings** → **Environment Variables**
3. Füge folgende Variables hinzu:

| Variable | Wert | Beispiel |
|----------|------|----------|
| `GITHUB_TOKEN` | Dein Personal Access Token | `ghp_xxxxxxxxxxxx` |
| `GITHUB_REPO` | Dein Repository in Format owner/repo | `myusername/xmastree` |
| `GITHUB_BRANCH` | Branch für Commits (meist main) | `main` |

**Wichtig**:
- Bei "Environment" wähle: **Production**, **Preview**, **Development** (alle drei)
- Nach dem Hinzufügen: **Redeploy** triggern (Settings → Deployments → Latest → ⋮ → Redeploy)

### 4. Domain konfigurieren (Optional)

Standardmäßig bekommst du eine URL: `https://xmastree.vercel.app`

Für Custom Domain:
1. Vercel Dashboard → Settings → Domains
2. Füge deine Domain hinzu
3. Folge den DNS-Anweisungen

### 5. Testen

1. Öffne deine Vercel URL: `https://your-project.vercel.app`
2. Gehe zu `/upload.html`
3. Lade ein Test-Foto hoch
4. Prüfe in deinem GitHub Repo:
   - Neuer Commit sollte erscheinen: "Add photo 1 to Christmas tree 🎄"
   - `data/photos.json` sollte das Foto enthalten
5. Gehe zu `/index.html` → Foto sollte als Kugel am Baum hängen!

## 🔧 Lokale Entwicklung

Für lokales Testen mit Vercel Functions:

```bash
# Vercel CLI installieren
npm install -g vercel

# Environment Variables lokal setzen
cp .env.example .env
# Bearbeite .env mit deinen Werten

# Entwicklungsserver starten
vercel dev

# Öffne: http://localhost:3000
```

Die `.env` Datei wird automatisch von Vercel Dev geladen.

**Wichtig**: `.env` ist in `.gitignore` und wird NICHT committed!

## 🔒 Sicherheit

### GitHub Token sicher aufbewahren

- ✅ **JA**: Token als Vercel Environment Variable
- ✅ **JA**: Token in lokaler `.env` Datei (nicht committen!)
- ❌ **NEIN**: Token im Frontend-Code
- ❌ **NEIN**: Token in Git-History

### Token Scopes minimieren

Der Token braucht nur `repo` Scope. Keine Admin-Rechte nötig.

### Token Rotation

Best Practice: Token alle 90 Tage erneuern
1. Neuen Token generieren
2. In Vercel Environment Variables updaten
3. Redeploy triggern
4. Alten Token revoken

## 🐛 Troubleshooting

### Problem: "401 Unauthorized" beim Upload

**Lösung**:
- Token abgelaufen → Neuen Token generieren
- Falsche Scopes → Token muss `repo` Scope haben
- Token in Vercel nicht gesetzt → Environment Variables prüfen

### Problem: "404 Not Found" beim Upload

**Lösung**:
- API-Endpoint nicht deployed → Redeploy auf Vercel
- Route nicht konfiguriert → `vercel.json` prüfen

### Problem: Upload funktioniert lokal, aber nicht in Production

**Lösung**:
- Environment Variables in Vercel fehlen
- Nach Hinzufügen von Env Vars: **Redeploy nötig!**

### Problem: "Rate limit exceeded"

**Lösung**:
- GitHub API hat Rate Limits (5000 requests/hour für authenticated requests)
- Bei vielen Uploads: Warte oder erhöhe Limit via GitHub Enterprise

### Problem: Foto zu groß / Upload schlägt fehl

**Lösung**:
- Maximale Foto-Größe: 200KB (Base64-kodiert)
- Bild wird automatisch auf 400x400px komprimiert
- Qualität auf 0.8 reduziert
- Bei Problemen: Qualität in `utils.js` auf 0.7 oder 0.6 senken

## 📊 Monitoring

### Logs in Vercel ansehen

1. Vercel Dashboard → Dein Projekt
2. **Deployments** → Aktuelles Deployment
3. **Function Logs** → `/api/upload` Logs

Hier siehst du:
- Erfolgreiche Uploads
- Fehler
- GitHub API Responses

### GitHub Commits überwachen

Jeder Upload erzeugt einen Commit:
```
Add photo 1 to Christmas tree 🎄
Add photo 2 to Christmas tree 🎄
...
```

Check: `https://github.com/owner/repo/commits/main`

## 🔄 Updates deployen

Nach Code-Änderungen:

```bash
# Änderungen committen
git add .
git commit -m "Update feature X"
git push

# Automatischer Deployment auf Vercel (wenn GitHub Integration aktiv)
# Oder manuell:
vercel --prod
```

## 💰 Kosten

### Vercel Free Tier
- ✅ Serverless Functions: 100GB-Hours/Monat
- ✅ Bandwidth: 100GB/Monat
- ✅ Build-Zeit: 6000 Minuten/Monat

Für 100-200 Personen absolut ausreichend!

### GitHub
- ✅ Public Repositories: Kostenlos unbegrenzt
- ✅ Private Repositories: Kostenlos mit Limits

## 🎯 Nächste Schritte

Nach erfolgreichem Setup:

1. ✅ QR-Code für Upload-URL generieren
2. ✅ Team informieren
3. ✅ Display-Screen im Büro aufstellen
4. ✅ Regelmäßig Backups von `photos.json` machen

## 📞 Support

Bei Problemen:
1. Prüfe Vercel Function Logs
2. Prüfe Browser Console (F12)
3. Validiere `photos.json` Syntax: `cat data/photos.json | jq .`
4. Erstelle GitHub Issue mit Fehlerbeschreibung

## 🎄 Viel Erfolg!

Dein Weihnachtsbaum ist jetzt bereit, zu wachsen! 🌟
