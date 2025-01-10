#!/bin/bash

# Author: Sourabh Mishra
# Date: 28th Sept 2024

VM_INSTANCE_NAME=$1
GITHUB_TOKEN=$2
export INSTANCE_NAME="$VM_INSTANCE_NAME"
echo "export INSTANCE_NAME='$VM_INSTANCE_NAME'" >> ~/.bashrc
sudo hostnamectl set-hostname $VM_INSTANCE_NAME
REPO=$VM_INSTANCE_NAME
mkdir -p "$HOME/$REPO"

sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update

sudo apt install -y caddy apt-transport-https ca-certificates curl git build-essential git nodejs

sudo npm install -g pm2@latest

git clone "https://x-access-token:${GITHUB_TOKEN}@github.com/opengig-mvps/$REPO.git" "$HOME/$REPO"

# SETUP CADDY
CADDY_DOMAIN="${VM_INSTANCE_NAME}.opengig.work"
CADDYFILE_PATH="/etc/caddy/Caddyfile"

# Write the Caddyfile configuration
sudo rm $CADDYFILE_PATH
touch $CADDYFILE_PATH
sudo tee $CADDYFILE_PATH > /dev/null <<EOL
$CADDY_DOMAIN {
    reverse_proxy localhost:3000
}
EOL

sudo systemctl restart caddy
echo "Caddyfile created at $CADDYFILE_PATH with domain $CADDY_DOMAIN"

# SETUP DOCKER..
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update

sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

echo "......SETUP DONE......."