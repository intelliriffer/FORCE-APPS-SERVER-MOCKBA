let Model = {
    OPERATIONS: [
        {
            NAME: 'Drum Kit From Samples in Current Folder',
            COMMAND: 'KITTER',
            DESCRIPTION: 'Kit Will Be Created for all the Samples in the Current Folder. Name of the Kit will be  Folder Name Kit.xpm',
            TARGET: 'FOLDER',
            SPACER_AFTER: false,
            TYPE: 'KIT'

        },
        {
            NAME: 'Drum Kit From WAV Samples in Each Sub Folder',
            COMMAND: 'KITTER_MULTI',
            DESCRIPTION: 'A Kit Will Be Created for Each SubFolder containing WAV in the Current Folder. Name of the Kit will be :"Sub Folder Name Kit.xpm"',
            TARGET: 'FOLDER',
            SPACER_AFTER: true,
            TYPE: 'KIT'

        },
        {
            NAME: 'Single MultiSample Keygroup for Current Folder',
            COMMAND: 'MULTI_SINGLE',
            DESCRIPTION: 'A Single MultiSample with be Created for the Current Folder. Wav File Name Must end with valid Note number 0-127 or a Note Name (C5,F#3) to used be used as Sample Root',
            TARGET: 'FOLDER',
            SPACER_AFTER: false,
            TYPE: 'KEY'

        },
        {
            NAME: 'MultiSample Keygroups For Each Sub Folder',
            COMMAND: 'MULTI_MULTI',
            DESCRIPTION: 'A KeyGroup Will Be Created for Each SubFolder Containing WAV in the Current Folder. Name of the KeyGroup will be :"Sub Folder Name KG.xpm", Wav File Name Must end with valid Note number 0-127 or a Note Name (C5,F#3) to used be used as Sample Root',
            TARGET: 'FOLDER',
            SPACER_AFTER: true,
            TYPE: 'KEY'

        },
        {
            NAME: 'Keygroup For  Each Sample in Current Folder',
            COMMAND: 'SINGLE',
            DESCRIPTION: 'A KeyGroup Will Be Created for Each Wave File Mapped Across KeyBoard. If the File Name ends with alid Note number 0-127 or a Note Name (C5,F#3) that will be used as root"',
            TARGET: 'FOLDER',
            SPACER_AFTER: false,
            TYPE: 'KEY'

        },
        {
            NAME: 'Keygroup For Each Sample in Sub Folders',
            COMMAND: 'SINGLE_MULTI',
            DESCRIPTION: 'A KeyGroup Will Be Created for Each Wave File Mapped Across KeyBoard. If the File Name ends with alid Note number 0-127 or a Note Name (C5,F#3) that will be used as root"',
            TARGET: 'FOLDER',
            SPACER_AFTER: true,
            TYPE: 'KEY'

        },
        {
            NAME: 'Keygroup For Each SCW Sample in Current Folder',
            COMMAND: 'SCW',
            DESCRIPTION: '(Samples <= 30 KB), A KeyGroup Will Be Created for Each Single Cycle Waveform Wave File Mapped Across KeyBoard. Pitch will be Determinied from the Sample Length',
            TARGET: 'FOLDER',
            SPACER_AFTER: false,
            TYPE: 'KEY'

        },
        {
            NAME: 'Keygroup For Each SCW Sample in Sub Folders',
            COMMAND: 'SCW_MULTI',
            DESCRIPTION: '(Samples <= 30KB), A KeyGroup Will Be Created for Each Single Cycle Waveform Wave File in Each Sub Folder, Mapped Across KeyBoard. Pitch will be Determinied from the Sample Length',
            TARGET: 'FOLDER',
            SPACER_AFTER: true,
            TYPE: 'KEY'

        },

        {
            NAME: 'Create Keygroup for Current Sample',
            COMMAND: 'SINGLE',
            DESCRIPTION: 'A KeyGroup Will Be Created for Current Wave File Mapped Across KeyBoard. If the File Name ends with alid Note number 0-127 or a Note Name (C5,F#3) that will be used as root"',
            TARGET: 'FILE',
            SPACER_AFTER: false,
            TYPE: 'KEY'

        },

        {
            NAME: 'Create KeyGroup as Single Cycle Sample',
            COMMAND: 'SCW',
            DESCRIPTION: '(Samples <= 500KB) A SCW KeyGroup Will Be Created for Current Sample, Treating it as Single Cycle Waveform. Pitch will be Determinied from the Sample Length',
            TARGET: 'FILE',
            SPACER_AFTER: true,
            TYPE: 'KEY'

        },

    ]

};