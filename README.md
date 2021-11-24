# FORCE-APPS-SERVER-MOKBA
Akai Force Custom Apps Server for Mockba Mod

Installation:
Copy the Contents into the AddOns Folder of your Mockba Mod SD Card and Restart Force.

Requirements :
	MOCKBA Mod for your Akai Force.
  nodejs Runtime  for arm 7 (install into nodeServer Folder along with app).
  Download Tuned version for Akai Force From here: https://mega.nz/file/E9Jk3DDL#pInN7Mghm4lzDgJSg7cFRyhD61g8JT_JNAXzRk27wKY
  

**************************************************************************************
READ MESSAGES and Exercise Caution: You Have been Warned!
**************************************************************************************

The Folder Struture of your SD Card should be like this

662522
	AddOns   
		nodeserver.sh
		nodeServer
          app
          node



You can access the AppServer by going to http://your-force-ip-address

Features:

1: **File Manager:**

	Move,Copy,Delete Files/Folders
	Download Files,Projects,Folders as tar archives
	Preview Audio (Wav,mp3,flac) Files.
	View Image and Video (mp4) Files from Force Drives.
	View contents from Text Based Files (scripts etc)
	Extract Zip Archives.
	Add Upto 10 Locations as Favorites for Quick Navigation in Files browser.
	
1.1: **File Manager Special Tools:**
	Generate Kits from Wav Samples from Folder/SubFolders
	Generate KeyGroups from Samples in Folder or Single Wav File.
		MultiSample Keygroups, Single Sample Keygroups, Single Cycle Waveform to Keygroups.
		Velocity Layers not Supported!

1.2:	**Project Track Re-Arranger**
		ReArrange Position of your tracks in Force project.
		May not work with all projects. Automatic backup of your project will be created 
		that can be restored if the rearranged project does not work.
    Change Colors of Tracks (upto 8 Extra Custom Colors)
    Change Track Name

2: **Arps Manager**
	Mange Arp Midi Files on your Device.
       Uploads Files Directly to your Root System in /Akai/SME0/Arp Patterns.
	*** You should backup these files before updating Firmware or you will lose them.****

3: **Progression Builder**
	Build Custom Progression Files that you can use in Notes Mode.
	Specify the Path to Progressions Directory in Menu->CONFIG
	Your Progressions Directory should be Called Progressions and Should be in Root of your SSD or SD Card.
	To use WebMidi (for live preview),You will either need to Create / Install custom SSL Certificate to the apps directory or 	in your computer you can edit your hosts file:
       /etc/hosts on (linux/max) and C:\Windows\System32\drivers\etc folder
	Add a mapping for my.force to xxx.xxx.xxx.xxx (where xxx.xxx.xxx.xx is IP ADDRESS of your Akai Force)
	Then you can browse the server by http://my.force or https://my.force
	You will also need to install the File CA.key or CA.pem depending on your system) as trusted CA in
	your computer. The Files are located in nodeServer/app/client Directory.
	And can be downloaded from
	http://yyy.yyy.yyy.yyy/static/CA.key
	http://yyy.yyy.yyy.yyy/static/CA.pem

4: **Project Templates**
	This Lets you Edit a project templates file so you can select what templates show up in New Project Dialog.
	So use own Projects as Templates you need to Save them to Internal/Expansions/Projects/Templates.
	Your project Name should be Like: ProjectName - Template (for example: MyMelodicTechno - Template)
5: Screen Capture
	This Module Lets your Capture Screen Shots on what is Displayed on your Force Screen right From your Web 	Browser (Computer/tablet/mobile).
	The Screenshots are Saved in ScreenShots Directory Specified in Menu >CONFIG

6: **Shell Console**
	This is Single Console Like Window where you can send Linux Commands to your Akai Force.
	MPC Verbose Log and Last N Dmesg are most useful to check for any error/issues being reported  on your device.
	Few useful commands are provided as shortcuts.

7: **Config Module**
	You Set various paths and Options in Config Module.


*****************************************************************************
NOTE: There Will be times that this app server may shutdown/crash due to
      some unhandled error. Don't Worry, the Server Launcher Scripts Monitors
       The status of Server Process every 10 seconds and Launches it again.	
****************************************************************************** 






	




		
		
	


	

