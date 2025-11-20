# 🚀 Vercel Deployment - Quick Start Guide

## Schritt-für-Schritt Anleitung

### 1. GitHub Personal Access Token erstellen

1. Gehe zu: https://github.com/settings/tokens
2. Klicke **"Generate new token (classic)"**
3. Token-Name: `Xmastree Upload`
4. Expiration: 90 days (oder länger)
5. **Scopes auswählen**:
   - ✅ `repo` (Full control of private repositories)
6. Klicke **"Generate token"**
7. **WICHTIG**: Token kopieren (wird nur einmal angezeigt!)
   ```
   ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

### 2. Vercel CLI installieren (optional, aber empfohlen)

```bash
npm install -g vercel
```

### 3. Projekt auf Vercel deployen

**Option A: Mit Vercel CLI (Empfohlen)**

```bash
# Im Projekt-Verzeichnis
cd xmastree

# Bei Vercel anmelden
vercel login

# Projekt deployen (Preview)
vercel

# Fragen beantworten:
# - "Set up and deploy?" → Yes
# - "Which scope?" → Dein Account
# - "Link to existing project?" → No
# - "What's your project's name?" → xmastree
# - "In which directory is your code located?" → ./
# - Framework Preset: → Other (oder einfach Enter)
# - Build Command: → (leer lassen, Enter)
# - Output Directory: → . (Enter)
# - Development Command: → (leer lassen, Enter)

# Production Deployment
vercel --prod
```

**Option B: Vercel Dashboard**

1. Gehe zu: https://vercel.com/new
2. Klicke **"Import Git Repository"**
3. Wähle dein GitHub Repository `xmastree`
4. Configure Project:
   - Framework Preset: **Other**
   - Root Directory: `./`
   - Build Command: (leer lassen)
   - Output Directory: `.`
5. Klicke **"Deploy"**

### 4. Environment Variables setzen

**Wichtig**: Nach dem ersten Deployment!

1. Gehe zu Vercel Dashboard → Dein Projekt
2. Navigiere zu **Settings** → **Environment Variables**
3. Füge folgende Variables hinzu:

| Name | Value | Beispiel |
|------|-------|----------|
| `GITHUB_TOKEN` | Dein Token | `ghp_xxxxxxxxxxxx` |
| `GITHUB_REPO` | owner/repo Format | `ypoxx/xmastree` |
| `GITHUB_BRANCH` | Branch-Name | `main` |

**Bei allen Environments anhaken**: Production, Preview, Development

4. Klicke **"Save"** für jede Variable

### 5. Redeploy nach Environment Variables

**Wichtig**: Environment Variables werden erst nach Redeploy aktiv!

**Option A: Über Dashboard**
1. Vercel Dashboard → Dein Projekt
2. **Deployments** Tab
3. Bei neuester Deployment → **⋮** (3 Punkte) → **Redeploy**
4. Klicke **"Redeploy"**

**Option B: Mit CLI**
```bash
vercel --prod
```

### 6. Testen!

1. **Öffne deine Vercel-URL**:
   ```
   https://xmastree-xxxx.vercel.app
   ```
   (URL steht im Vercel Dashboard)

2. **Test Upload-Funktion**:
   - Gehe zu: `https://xmastree-xxxx.vercel.app/upload.html`
   - Lade ein Test-Foto hoch
   - Klicke "Zum Baum hinzufügen"
   - Sollte erfolgreich sein!

3. **Prüfe GitHub**:
   - Gehe zu deinem Repository auf GitHub
   - Check "Commits" → Es sollte ein neuer Commit da sein:
     ```
     Add photo 1 to Christmas tree 🎄
     ```
   - Öffne `data/photos.json` → Dein Foto sollte drin sein

4. **Check Display**:
   - Öffne: `https://xmastree-xxxx.vercel.app/`
   - Dein Foto sollte als Kugel am Baum hängen! 🎄

### 7. Custom Domain (Optional)

Falls du eine eigene Domain hast:

1. Vercel Dashboard → Settings → **Domains**
2. Klicke **"Add Domain"**
3. Gib deine Domain ein (z.B. `weihnachtsbaum.deinedomain.de`)
4. Folge den DNS-Anweisungen
5. Fertig! Nach DNS-Propagation läuft die App auf deiner Domain

### 8. QR-Code erstellen

Für einfachen Mobile-Zugriff:

1. Kopiere Upload-URL: `https://xmastree-xxxx.vercel.app/upload.html`
2. Gehe zu: https://www.qr-code-generator.com/
3. Füge URL ein
4. Generiere QR-Code
5. Download als PNG
6. Drucke aus und hänge im Büro auf!

## 🎉 Fertig!

Deine App läuft jetzt auf Vercel mit vollständig funktionierendem Upload-Backend!

**URLs**:
- Display: `https://xmastree-xxxx.vercel.app/`
- Upload: `https://xmastree-xxxx.vercel.app/upload.html`
- API: `https://xmastree-xxxx.vercel.app/api/upload`

## 🔍 Debugging

### Problem: Upload schlägt fehl

**Lösung 1**: Environment Variables prüfen
```bash
# In Vercel Dashboard
Settings → Environment Variables
→ Alle drei Variables gesetzt? (GITHUB_TOKEN, GITHUB_REPO, GITHUB_BRANCH)
→ Bei allen Environments aktiviert?
→ Nach Setzen: Redeploy gemacht?
```

**Lösung 2**: Function Logs checken
```bash
# In Vercel Dashboard
Deployments → Latest → Functions → /api/upload → Logs
→ Hier siehst du Fehler
```

**Lösung 3**: GitHub Token prüfen
```bash
# Token hat "repo" Scope?
# Token nicht abgelaufen?
# Repository-Name korrekt? (Format: "owner/repo")
```

### Problem: Fotos erscheinen nicht am Baum

**Lösung**:
- Seite neu laden (Cmd+Shift+R / Ctrl+Shift+R)
- Browser-Konsole öffnen (F12) → Fehler checken
- `data/photos.json` auf GitHub prüfen → Ist Foto drin?

### Problem: "403 Forbidden" beim Upload

**Lösung**:
- GitHub Token falsch oder abgelaufen
- Neuen Token generieren
- In Vercel Environment Variables updaten
- Redeploy

## 📊 Monitoring

### Vercel Dashboard zeigt:
- Anzahl Deployments
- Function Invocations (API-Calls)
- Bandwidth Usage
- Function Logs

### GitHub zeigt:
- Jeden Upload als Commit
- Commit-History = Upload-Timeline
- `data/photos.json` = Alle Fotos

## 💰 Kosten

**Vercel Free Tier**:
- ✅ 100 GB-Hours Serverless Functions / Monat
- ✅ 100 GB Bandwidth / Monat
- ✅ Unbegrenzte Deployments

**Für dieses Projekt**:
- 130 Uploads ≈ 130 Function-Calls
- Jedes Foto ≈ 100-150 KB
- 130 * 150 KB = ~20 MB Traffic
- **→ Absolut im Free Tier!**

## 🛠️ Lokale Entwicklung mit Vercel Dev

Um lokal mit der Function zu testen:

```bash
# .env erstellen
cp .env.example .env

# .env mit deinen Werten füllen:
# GITHUB_TOKEN=ghp_xxx
# GITHUB_REPO=owner/repo
# GITHUB_BRANCH=main

# Vercel Dev Server starten
vercel dev

# Öffne: http://localhost:3000
# API verfügbar unter: http://localhost:3000/api/upload
```

## 📝 Checkliste

- [ ] GitHub Personal Access Token erstellt
- [ ] Vercel Account erstellt
- [ ] Projekt auf Vercel deployed
- [ ] Environment Variables gesetzt (GITHUB_TOKEN, GITHUB_REPO, GITHUB_BRANCH)
- [ ] Redeploy nach Env-Vars durchgeführt
- [ ] Test-Upload gemacht
- [ ] GitHub-Commit erschienen
- [ ] Foto am Baum sichtbar
- [ ] QR-Code erstellt
- [ ] Team informiert

## 🎄 Viel Erfolg!

Bei Fragen oder Problemen schaue in:
- `SETUP.md` - Detaillierte Anleitung
- `DEPLOYMENT_OPTIONS.md` - Alternative Optionen
- Vercel Function Logs - Debugging
- GitHub Repository - Commit-History

**Support**: https://vercel.com/docs
