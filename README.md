# SRET Marks Portal

Students can check their marks by entering their Student ID. Marks are **read-only** and cannot be edited by students.

- **Live URL (after deployment):** https://portal.sretmarks.com

## Run locally

```bash
npm install
npm start
```

Open http://localhost:3000 and try Student IDs: `SRET001`, `SRET002`, `SRET003`.

## Admin Access

Enter `admin@123` to access the admin panel where you can edit marks for all students.

## Updating marks (admin only)

1. **Via Admin Panel:** Log in with `admin@123` and edit marks directly in the web interface
2. **Via Server:** Edit `data/marks.json` on the server

Format for each student in `data/marks.json`:

```json
{
  "id": "SRET001",
  "name": "Student Full Name",
  "semester": "1",
  "subjects": [
    { "name": "CA1", "marks": 85, "maxMarks": 100 },
    { "name": "CA2", "marks": 78, "maxMarks": 100 },
    { "name": "CA3", "marks": 82, "maxMarks": 100 },
    { "name": "Final Assessment", "marks": 90, "maxMarks": 100 }
  ]
}
```

## Deploying at https://portal.sretmarks.com

Choose one of the deployment methods below:

### Option 1: Render (Recommended - Free Forever)

1. **Sign up** at [render.com](https://render.com) (free tier available, no time limit)

2. **Create a new Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repo OR upload files manually
   - Select "Web Service"

3. **Configure settings:**
   - **Name:** sret-marks-portal
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free (or choose Starter for $7/month for better performance)

4. **Add custom domain:**
   - Go to Settings → Custom Domains
   - Add: `portal.sretmarks.com`
   - Render will provide DNS instructions

5. **Configure DNS:**
   - In your domain registrar, add:
     - Type: **CNAME**
     - Name: `portal`
     - Value: Render's provided domain (e.g., `sret-marks-portal.onrender.com`)

6. **HTTPS:** Render automatically provides SSL certificates (free)

**Note:** Render free tier may spin down after 15 minutes of inactivity, but it auto-wakes on next request. For always-on service, consider Starter plan ($7/month).

---

### Option 2: Fly.io (Free Tier - Always On)

1. **Sign up** at [fly.io](https://fly.io) (free tier includes 3 shared-cpu VMs)

2. **Install Fly CLI:**
   ```bash
   # Windows (PowerShell)
   iwr https://fly.io/install.ps1 -useb | iex
   ```

3. **Login and create app:**
   ```bash
   fly auth login
   fly launch
   ```
   - Follow prompts (select your region)
   - Don't deploy yet (we'll configure first)

4. **Create `fly.toml`** (if not auto-generated):
   ```toml
   app = "sret-marks-portal"
   primary_region = "iad"

   [build]

   [http_service]
     internal_port = 3000
     force_https = true
     auto_stop_machines = false
     auto_start_machines = true
     min_machines_running = 1

   [[vm]]
     cpu_kind = "shared"
     cpus = 1
     memory_mb = 256
   ```

5. **Deploy:**
   ```bash
   fly deploy
   ```

6. **Add custom domain:**
   ```bash
   fly certs add portal.sretmarks.com
   ```

7. **Configure DNS:**
   - Add A record: `portal` → IP address shown by `fly certs show portal.sretmarks.com`

**Note:** Free tier includes 3 VMs that stay running. Perfect for production use!

---

### Option 3: DigitalOcean App Platform ($5/month - Reliable)

1. **Sign up** at [digitalocean.com](https://digitalocean.com)

2. **Create App:**
   - Click "Create" → "Apps"
   - Connect GitHub repo or upload files
   - Select Node.js

3. **Configure:**
   - Build Command: `npm install`
   - Run Command: `npm start`
   - Plan: Basic ($5/month) - includes custom domain and SSL

4. **Add custom domain:**
   - Go to Settings → Domains
   - Add: `portal.sretmarks.com`
   - Configure DNS as instructed

**Note:** $5/month for reliable, always-on hosting. Great value for production.

---

### Option 4: VPS (DigitalOcean Droplet, AWS EC2, etc.)

1. **Set up your VPS** (Ubuntu recommended)

2. **Install Node.js:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Install PM2:**
   ```bash
   sudo npm install -g pm2
   ```

4. **Upload your code:**
   ```bash
   # Using Git
   git clone <your-repo-url>
   cd sret-marks-portal
   npm install --production
   ```

5. **Start with PM2:**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup  # Follow instructions to enable auto-start
   ```

6. **Install Nginx:**
   ```bash
   sudo apt update
   sudo apt install nginx
   ```

7. **Configure Nginx** (`/etc/nginx/sites-available/portal.sretmarks.com`):
   ```nginx
   server {
       listen 80;
       server_name portal.sretmarks.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

8. **Enable site:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/portal.sretmarks.com /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

9. **Install SSL (Let's Encrypt):**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d portal.sretmarks.com
   ```

10. **Configure DNS:**
    - Add **A record**: `portal` → Your VPS IP address

---

### Option 5: Docker Deployment

If you have Docker installed:

```bash
# Build image
docker build -t sret-marks-portal .

# Run container
docker run -d -p 3000:3000 --name sret-portal sret-marks-portal
```

Then configure Nginx reverse proxy (as in Option 3) pointing to `localhost:3000`.

---

## Environment Variables

The app uses `PORT` environment variable (defaults to 3000). Set it if your host requires a specific port:

```bash
export PORT=3000
```

## After Deployment

1. **Test the site:** Visit https://portal.sretmarks.com
2. **Test student view:** Enter `SRET001` (or any student ID)
3. **Test admin:** Enter `admin@123` to access admin panel

## Troubleshooting

- **Port issues:** Make sure `PORT` environment variable matches your host's requirements
- **File permissions:** Ensure `data/marks.json` is writable (for admin updates)
- **DNS propagation:** Can take up to 48 hours, usually much faster
- **SSL certificate:** May take a few minutes after DNS is configured
