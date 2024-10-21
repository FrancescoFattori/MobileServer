# MobileServer
Server hosted on an android mobile phone through Termux

## Termux Commands
* cd [dirname] - Change directory
* ls - List directory
* mv [filename] [filename] - Move file, use to rename also
* mkdir [dirname] - Make directory
* rm [filename] - remove file
* rm -r [dirname] - remove entire directory

## Termux Boot
Type "cd ~/.termux/boot" to enter the correct folder; write an .sh
shell script. All files in this folder will be bash executed at Phone startup.
### Script file example
cd MobileServer \
node server.js public

## How to run
* node server.js port:8080 public \
The control panel will be hosted at the specified port; other services
start command is written in server.js.
To update the internal storage of the server enter control panel, terminal
and execute "git pull"
