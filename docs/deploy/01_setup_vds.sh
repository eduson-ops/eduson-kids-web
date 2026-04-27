#!/usr/bin/env bash
###############################################################################
# KubiK Eduson Kids — VDS Setup Script
# Target: Selectel Ubuntu 22.04, 45.131.40.181
# Usage: copy this entire file, paste into SSH session as root, hit Enter
# Time: ~5-10 minutes
###############################################################################
set -euo pipefail

############################ EDIT THESE BEFORE RUNNING ########################
NEW_ROOT_PASS="CHANGE_ME_a8f3kL9pQ"          # new root password (cron/sudo)
DEPLOY_USER="kubik"
DEPLOY_USER_PASS="CHANGE_ME_d3jK2mNvB"        # password for kubik user (rsync)
DEPLOY_USER_SSH_KEY=""                         # paste your ssh public key here, or leave empty for password auth
BASIC_AUTH_USER="demo"
BASIC_AUTH_PASS="CHANGE_ME_kubik2026"         # password Sergei will use
DOMAIN="axsa.tech"
BACKEND_URL="https://bba885qd0t1b4ds56ltb.containers.yandexcloud.net"
###############################################################################

echo "════════════════════════════════════════════════════════════"
echo " KubiK Eduson Kids — VDS Setup"
echo " Domain: $DOMAIN"
echo " Backend: $BACKEND_URL"
echo " Deploy user: $DEPLOY_USER"
echo "════════════════════════════════════════════════════════════"

# ─── 1. System update ─────────────────────────────────────────────────────────
echo ">>> [1/9] Updating system packages..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get upgrade -y -qq
apt-get install -y -qq \
    nginx \
    apache2-utils \
    ufw \
    fail2ban \
    rsync \
    curl \
    htop \
    cron \
    ca-certificates

# ─── 2. Change root password ──────────────────────────────────────────────────
echo ">>> [2/9] Changing root password..."
echo "root:$NEW_ROOT_PASS" | chpasswd

# ─── 3. Create deploy user ────────────────────────────────────────────────────
echo ">>> [3/9] Creating deploy user '$DEPLOY_USER'..."
if ! id "$DEPLOY_USER" &>/dev/null; then
    useradd -m -s /bin/bash -G sudo,www-data "$DEPLOY_USER"
fi
echo "$DEPLOY_USER:$DEPLOY_USER_PASS" | chpasswd

# Install SSH key for deploy user (if provided)
if [ -n "$DEPLOY_USER_SSH_KEY" ]; then
    mkdir -p "/home/$DEPLOY_USER/.ssh"
    echo "$DEPLOY_USER_SSH_KEY" > "/home/$DEPLOY_USER/.ssh/authorized_keys"
    chmod 700 "/home/$DEPLOY_USER/.ssh"
    chmod 600 "/home/$DEPLOY_USER/.ssh/authorized_keys"
    chown -R "$DEPLOY_USER:$DEPLOY_USER" "/home/$DEPLOY_USER/.ssh"
fi

# Passwordless sudo for restart commands only (least-privilege)
echo "$DEPLOY_USER ALL=(ALL) NOPASSWD: /bin/systemctl reload nginx, /bin/systemctl restart nginx, /bin/systemctl status nginx" \
    > /etc/sudoers.d/kubik-deploy
chmod 440 /etc/sudoers.d/kubik-deploy

# ─── 4. Harden SSH ────────────────────────────────────────────────────────────
echo ">>> [4/9] Hardening SSH..."
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak.$(date +%Y%m%d)
sed -i 's/^#\?PermitRootLogin.*/PermitRootLogin prohibit-password/' /etc/ssh/sshd_config
sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication yes/' /etc/ssh/sshd_config  # keep password for kubik until SSH key works
sed -i 's/^#\?ClientAliveInterval.*/ClientAliveInterval 300/' /etc/ssh/sshd_config
sed -i 's/^#\?ClientAliveCountMax.*/ClientAliveCountMax 2/' /etc/ssh/sshd_config
systemctl restart ssh

# ─── 5. UFW firewall ──────────────────────────────────────────────────────────
echo ">>> [5/9] Configuring UFW firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP (Cloudflare origin)'
ufw allow 443/tcp comment 'HTTPS (reserved)'
ufw --force enable

# ─── 6. fail2ban ──────────────────────────────────────────────────────────────
echo ">>> [6/9] Configuring fail2ban..."
cat > /etc/fail2ban/jail.local <<'F2BEOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5
backend = systemd

[sshd]
enabled = true
port = ssh

[nginx-http-auth]
enabled = true
port = http,https
filter = nginx-http-auth
logpath = /var/log/nginx/error.log
F2BEOF
systemctl enable fail2ban
systemctl restart fail2ban

# ─── 7. Web directory ─────────────────────────────────────────────────────────
echo ">>> [7/9] Creating web directory..."
mkdir -p /var/www/kubik
chown -R "$DEPLOY_USER:www-data" /var/www/kubik
chmod 755 /var/www/kubik

# Placeholder index until first deploy
cat > /var/www/kubik/index.html <<'PHEOF'
<!DOCTYPE html>
<html lang="ru"><head><meta charset="UTF-8"><title>KubiK — coming soon</title></head>
<body style="font-family:-apple-system,sans-serif;background:#0C0533;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0">
<div style="text-align:center"><h1>KubiK Eduson Kids</h1><p>Deploy in progress…</p></div>
</body></html>
PHEOF
chown "$DEPLOY_USER:www-data" /var/www/kubik/index.html

# ─── 8. nginx config ──────────────────────────────────────────────────────────
echo ">>> [8/9] Configuring nginx..."

# Basic Auth file
htpasswd -bc /etc/nginx/.htpasswd "$BASIC_AUTH_USER" "$BASIC_AUTH_PASS"
chown root:www-data /etc/nginx/.htpasswd
chmod 640 /etc/nginx/.htpasswd

# Site config
cat > /etc/nginx/sites-available/kubik <<NGINX_EOF
# KubiK Eduson Kids — frontend on Selectel VDS
# Cloudflare proxy → HTTP origin (Flexible SSL)
# Backend stays on Yandex Cloud, proxied through /api/

# Trust Cloudflare for real client IP
set_real_ip_from 173.245.48.0/20;
set_real_ip_from 103.21.244.0/22;
set_real_ip_from 103.22.200.0/22;
set_real_ip_from 103.31.4.0/22;
set_real_ip_from 141.101.64.0/18;
set_real_ip_from 108.162.192.0/18;
set_real_ip_from 190.93.240.0/20;
set_real_ip_from 188.114.96.0/20;
set_real_ip_from 197.234.240.0/22;
set_real_ip_from 198.41.128.0/17;
set_real_ip_from 162.158.0.0/15;
set_real_ip_from 104.16.0.0/13;
set_real_ip_from 104.24.0.0/14;
set_real_ip_from 172.64.0.0/13;
set_real_ip_from 131.0.72.0/22;
set_real_ip_from 2400:cb00::/32;
set_real_ip_from 2606:4700::/32;
set_real_ip_from 2803:f800::/32;
set_real_ip_from 2405:b500::/32;
set_real_ip_from 2405:8100::/32;
set_real_ip_from 2a06:98c0::/29;
set_real_ip_from 2c0f:f248::/32;
real_ip_header CF-Connecting-IP;

# Gzip
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_proxied any;
gzip_comp_level 6;
gzip_types text/plain text/css application/json application/javascript application/wasm text/xml application/xml application/xml+rss text/javascript image/svg+xml;

server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN;

    root /var/www/kubik;
    index index.html;

    client_max_body_size 20M;
    server_tokens off;

    # Security headers
    add_header X-Robots-Tag "noindex, nofollow, noarchive, nosnippet" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(self), microphone=(self), geolocation=()" always;

    # ─── /api/v1/* → Yandex Cloud backend (NO basic auth) ─────────────────
    location /api/ {
        proxy_pass $BACKEND_URL/api/;
        proxy_http_version 1.1;
        proxy_set_header Host bba885qd0t1b4ds56ltb.containers.yandexcloud.net;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_ssl_server_name on;
        proxy_ssl_name bba885qd0t1b4ds56ltb.containers.yandexcloud.net;
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
        proxy_connect_timeout 30s;
        proxy_buffering off;
    }

    # ─── /pyodide/* — self-hosted WASM, long cache ────────────────────────
    location /pyodide/ {
        auth_basic "KubiK demo — request access";
        auth_basic_user_file /etc/nginx/.htpasswd;

        access_log off;
        expires 30d;
        add_header Cache-Control "public, immutable" always;
        add_header X-Robots-Tag "noindex, nofollow" always;
        try_files \$uri =404;
    }

    # ─── /assets/* — vite hashed bundles, immutable cache ────────────────
    location /assets/ {
        auth_basic "KubiK demo — request access";
        auth_basic_user_file /etc/nginx/.htpasswd;

        access_log off;
        expires 1y;
        add_header Cache-Control "public, immutable" always;
        add_header X-Robots-Tag "noindex, nofollow" always;
        try_files \$uri =404;
    }

    # ─── Service worker — never cache ─────────────────────────────────────
    location = /sw.js {
        auth_basic "KubiK demo — request access";
        auth_basic_user_file /etc/nginx/.htpasswd;

        add_header Cache-Control "no-cache, no-store, must-revalidate" always;
        add_header X-Robots-Tag "noindex, nofollow" always;
        try_files \$uri =404;
    }

    # ─── Default (HTML, manifest, icons) — basic auth + SPA fallback ─────
    location / {
        auth_basic "KubiK demo — request access";
        auth_basic_user_file /etc/nginx/.htpasswd;

        add_header Cache-Control "no-cache" always;
        add_header X-Robots-Tag "noindex, nofollow, noarchive, nosnippet" always;

        try_files \$uri \$uri/ /index.html;
    }

    # ─── Health for monitoring (no auth) ──────────────────────────────────
    location = /__health {
        access_log off;
        return 200 "ok\n";
        add_header Content-Type text/plain;
    }
}
NGINX_EOF

# Enable site, drop default
ln -sf /etc/nginx/sites-available/kubik /etc/nginx/sites-enabled/kubik
rm -f /etc/nginx/sites-enabled/default

# Test & reload
nginx -t
systemctl enable nginx
systemctl reload nginx

# ─── 9. Daily backup cron ─────────────────────────────────────────────────────
echo ">>> [9/9] Setting up daily backup cron..."
mkdir -p /var/backups/kubik
cat > /usr/local/bin/kubik-backup.sh <<'BACKUP_EOF'
#!/usr/bin/env bash
set -e
BACKUP_DIR=/var/backups/kubik
DATE=$(date +%Y%m%d-%H%M%S)
tar -czf "$BACKUP_DIR/kubik-$DATE.tar.gz" /etc/nginx /var/www/kubik 2>/dev/null
# keep last 14 days
find "$BACKUP_DIR" -name 'kubik-*.tar.gz' -mtime +14 -delete
BACKUP_EOF
chmod +x /usr/local/bin/kubik-backup.sh
echo "0 3 * * * root /usr/local/bin/kubik-backup.sh" > /etc/cron.d/kubik-backup

# ─── DONE ─────────────────────────────────────────────────────────────────────
echo ""
echo "════════════════════════════════════════════════════════════"
echo " ✓ VDS setup complete"
echo "════════════════════════════════════════════════════════════"
echo ""
echo " DEPLOY USER:    $DEPLOY_USER"
echo " WEB ROOT:       /var/www/kubik"
echo " NGINX CONFIG:   /etc/nginx/sites-available/kubik"
echo " HTPASSWD:       /etc/nginx/.htpasswd"
echo " HEALTH CHECK:   curl http://45.131.40.181/__health"
echo ""
echo " BASIC AUTH:     $BASIC_AUTH_USER / $BASIC_AUTH_PASS"
echo " BACKEND PROXY:  /api/v1/* → $BACKEND_URL"
echo ""
echo " NEXT STEPS:"
echo "  1. Cloudflare DNS: add A records for $DOMAIN and www.$DOMAIN → 45.131.40.181 (Proxied)"
echo "  2. Cloudflare SSL: set Flexible mode + Always Use HTTPS"
echo "  3. From your local machine, run:"
echo "       VITE_TARGET=axsa npm run build"
echo "       rsync -avz --delete dist/ $DEPLOY_USER@45.131.40.181:/var/www/kubik/"
echo "  4. Test: https://$DOMAIN (login: $BASIC_AUTH_USER / $BASIC_AUTH_PASS)"
echo ""
echo " DELETE THIS LOG and clear bash history with: history -c && history -w"
echo "════════════════════════════════════════════════════════════"
