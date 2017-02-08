#!/bin/bash

# Sessions.
tmux new-session -s IPLog -n ip -d -c ./tools/
tmux new-session -s tefAlexa -n server -d 

# Second window.
tmux new-window -t tefAlexa -n chromium -d

# Second panes.
tmux send-keys -t tefAlexa 'npm start &> out.log' 'C-m'
tmux send-keys -t IPLog './loopIP.sh &> ip.log' 'C-m'

#tmux split-window -t IPLog -d "tmux rename-window logIP"
#tmux send-keys -t  'tail -f ip.log' 'C-m'
#tmux split-window -t tefAlexa -d 'select window -t server "tmux rename-window logServer"'
#tmux send-keys -t logServer 'tail -f out.log' 'C-m'
