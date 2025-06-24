#!/bin/bash

# Claude Code作業完了通知スクリプト
# 
# 使用方法:
#   ./scripts/notify-completion.sh [メッセージ]
#
# 例:
#   ./scripts/notify-completion.sh "ビルドが完了しました"
#   ./scripts/notify-completion.sh "テストが成功しました"

# デフォルトメッセージ
MESSAGE=${1:-"作業が完了しました"}

# macOSの場合
if [[ "$OSTYPE" == "darwin"* ]]; then
    # システムサウンドを再生（Glassサウンド）
    afplay /System/Library/Sounds/Glass.aiff
    
    # 通知センターに通知を送る
    osascript -e "display notification \"$MESSAGE\" with title \"Claude Code\" sound name \"Glass\""
    
    # ターミナルにもメッセージを表示
    echo "🔔 $MESSAGE"
    
# Linuxの場合
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # paplayがある場合は使用
    if command -v paplay &> /dev/null; then
        paplay /usr/share/sounds/freedesktop/stereo/complete.oga 2>/dev/null || echo -e "\a"
    else
        # ビープ音を鳴らす
        echo -e "\a"
    fi
    
    # notify-sendがある場合は通知
    if command -v notify-send &> /dev/null; then
        notify-send "Claude Code" "$MESSAGE"
    fi
    
    echo "🔔 $MESSAGE"
    
# その他のOS
else
    # ビープ音を鳴らす
    echo -e "\a"
    echo "🔔 $MESSAGE"
fi