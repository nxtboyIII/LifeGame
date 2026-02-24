#!/bin/bash
# Life Game - Deploy to US Server
set -e

SERVER="ubuntu@game-us-3.blayzegames.com"
REMOTE_PATH="/var/www/html/LifeGame"
LOCAL_DIR="$(cd "$(dirname "$0")" && pwd)"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}Life Game - Deploy${NC}"
echo "Server: $SERVER"
echo "Remote: $REMOTE_PATH"
echo "Local:  $LOCAL_DIR"
echo ""

# ============================================
# SYNC FILES
# ============================================
echo -e "${YELLOW}Syncing game files...${NC}"

rsync -avz --delete --checksum \
    --rsync-path="sudo rsync" \
    --exclude='.DS_Store' \
    "$LOCAL_DIR/index.html" \
    "$LOCAL_DIR/js" \
    "$LOCAL_DIR/css" \
    "$LOCAL_DIR/audio" \
    "$SERVER:$REMOTE_PATH/"

ssh -t "$SERVER" "sudo chown -R www-data:www-data '$REMOTE_PATH' && sudo chmod -R 755 '$REMOTE_PATH'"

# ============================================
# VERIFY
# ============================================
echo ""
echo -e "${YELLOW}Verifying deployment...${NC}"

FILE_COUNT=$(ssh "$SERVER" "find '$REMOTE_PATH' -type f | wc -l")
echo -e "  Files deployed: ${GREEN}$FILE_COUNT${NC}"

INDEX_EXISTS=$(ssh "$SERVER" "[ -f '$REMOTE_PATH/index.html' ] && echo 'yes' || echo 'no'")
if [ "$INDEX_EXISTS" = "yes" ]; then
    echo -e "  index.html:     ${GREEN}OK${NC}"
else
    echo -e "  index.html:     ${RED}MISSING${NC}"
    exit 1
fi

JS_COUNT=$(ssh "$SERVER" "find '$REMOTE_PATH/js' -name '*.js' -type f 2>/dev/null | wc -l")
echo -e "  JS files:       ${GREEN}$JS_COUNT${NC}"

CSS_COUNT=$(ssh "$SERVER" "find '$REMOTE_PATH/css' -name '*.css' -type f 2>/dev/null | wc -l")
echo -e "  CSS files:      ${GREEN}$CSS_COUNT${NC}"

AUDIO_COUNT=$(ssh "$SERVER" "find '$REMOTE_PATH/audio' -type f 2>/dev/null | wc -l")
echo -e "  Audio files:    ${GREEN}$AUDIO_COUNT${NC}"

echo ""
echo -e "${GREEN}Deploy complete!${NC}"
echo -e "Game should be live at: http://game-us-3.blayzegames.com/LifeGame/"