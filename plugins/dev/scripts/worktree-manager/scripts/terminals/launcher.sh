#!/bin/bash

# Universal Terminal Launcher
# Handles all terminal apps through a single modular script

set -e

TERMINAL_APP="${1}"
COMMAND="${2}"

# Validate arguments
if [ -z "$TERMINAL_APP" ] || [ -z "$COMMAND" ]; then
    echo "Usage: launcher.sh <terminal-app> <command>"
    echo "Supported terminals: Hyper, iTerm2, Warp, Terminal"
    exit 1
fi

# Function to check if terminal is installed
check_terminal_installed() {
    local app_name="$1"

    # Terminal.app is always available on macOS
    if [ "$app_name" = "Terminal" ]; then
        return 0
    fi

    # Check other terminals
    if ! open -Ra "$app_name" 2>/dev/null; then
        echo "Error: $app_name is not installed"
        exit 1
    fi
}

# Function to launch Hyper
launch_hyper() {
    osascript << EOF
tell application "Hyper"
  activate
  delay 0.5
  tell application "System Events"
    tell process "Hyper"
      keystroke "t" using {command down}
      delay 0.2
      keystroke "$COMMAND"
      keystroke return
    end tell
  end tell
end tell
EOF
}

# Function to launch iTerm2
launch_iterm2() {
    osascript << EOF
tell application "iTerm"
  create window with default profile
  tell current session of current window
    write text "$COMMAND"
  end tell
end tell
EOF
}

# Function to launch Warp
launch_warp() {
    local tmp_script="/tmp/warp_script_$$.sh"
    cat > "$tmp_script" << SCRIPT
#!/bin/bash
$COMMAND
SCRIPT
    chmod +x "$tmp_script"
    open -a Warp "$tmp_script"
    (sleep 2 && rm -f "$tmp_script") &
}

# Function to launch Terminal.app
launch_terminal() {
    osascript << EOF
tell application "Terminal"
  do script "$COMMAND"
  activate
end tell
EOF
}

# Main logic
case "$TERMINAL_APP" in
    Hyper)
        check_terminal_installed "Hyper"
        launch_hyper
        echo "Opened Hyper terminal"
        ;;
    iTerm2)
        check_terminal_installed "iTerm"
        launch_iterm2
        echo "Opened iTerm2 terminal"
        ;;
    Warp)
        check_terminal_installed "Warp"
        launch_warp
        echo "Opened Warp terminal"
        ;;
    Terminal)
        check_terminal_installed "Terminal"
        launch_terminal
        echo "Opened Terminal.app"
        ;;
    *)
        echo "Error: Unsupported terminal app: $TERMINAL_APP"
        echo "Supported terminals: Hyper, iTerm2, Warp, Terminal"
        exit 1
        ;;
esac

exit 0
