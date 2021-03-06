/* Library of shell commands use */
const CMDLIB = [
    {
        CMD: `grep -q '/dev/root / ext4 rw,' /proc/mounts && echo "/ is Read/Write" || echo "/ is Read Only!"`,
        NAME: "Check / Mount Status",
        DESCRIPTION: "Checks Whether / is Read Write or Read Only"
    },
    {
        CMD: `df -hT | grep 'Filesystem\\|/dev/root\\|/media/'`,
        NAME: "Check Disk Space",
        DESCRIPTION: "Show Disk Space for Devices"
    },
    {
        CMD: `mount remount / -o rw,remount &&  grep /dev/root /proc/mounts`,
        NAME: "Mount / ReadWrite",
        DESCRIPTION: "ReMounts / for Writing"
    },
    {
        CMD: `mount remount / -o ro,remount &&  grep /dev/root /proc/mounts`,
        NAME: "Mount / ReadOnly",
        DESCRIPTION: "ReMounts /  as Read Only"
    },
    {
        CMD: `grep 'overlay\\|/dev/' /proc/mounts`,
        NAME: "List All FS mounts",
        DESCRIPTION: "Lists Primary Mounts"
    },
    {
        CMD: `df -hT | grep -o -E '/media/.*$'`,
        NAME: "List Media Mounts",
        DESCRIPTION: "Lists SSD/SD/USB Mounts"
    },
    {
        CMD: `ls /usr/share/Akai/SME0/Arp\\ Patterns`,
        NAME: "List Arps Midis",
        DESCRIPTION: "List of Arp Pattern Midis"
    },
    {
        CMD: `dmesg | tail -n ??`,
        NAME: "Last N Dmesg ",
        DESCRIPTION: "Show Last N diagnostic messages",
        PROMPT: "Last How Many Diagnostic Messages?",
        DEFAULT: 10

    },
    {
        CMD: `journalctl -r | grep launch`,
        NAME: "MPC VERBOSE LOG ",
        DESCRIPTION: "Show Logged Messages fro Journalctl",
    },
    {
        CMD: `aconnect -i`,
        NAME: "Midi Inputs",
        DESCRIPTION: "Show Midi Inputs",
    },
    {
        CMD: `aconnect -o`,
        NAME: "Midi Outputs",
        DESCRIPTION: "Show Midi Inputs",
    },
    {
        CMD: `reboot`,
        NAME: "Reboot Device",
        DESCRIPTION: "Restart Device",
        CONFIRM: true
    },



]