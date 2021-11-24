Folder to MPC Kit Maker (Batch)
The Scripts read a folder tree (Path as specified in Path.txt) and for each sub-folder created a MPC Kit File fom the Wav samples in the folder.

Usage: 
1: Enter the complete Path of the Directory/Folder containing your Kits as Sub Folders in the PATH.txt file.
2: Mac Users Run run-mac.sh File from Command Prompt (if you are unable to execute the file run the command chmod +x run-mac.sh)
2: Windows Users run the run_win.bat file.

Requirements:
Node Js must be installed on your system to run these scripts you can download and install nodejs from : https://nodejs.org/en/

Info:
The Script will try to organize Few of the samples based on their name (kicks snare hats)
The Kit file will be generated in the same folder as the wav files and will have the name of folder Kit.xpm  as the  file name.


Required Folder Structure:
You Must enter the complete path of root folder in the PATH.txt file.

ROOTFOLDER 
        |   
        KIT1
            | kick.Wav
            |  snare.wav
        |   
        KIT2
            | kick.Wav
            |  snare.wav






