<template>
  <div class="master">
    <div class="mui" v-show="!browsing & !imaging && !reading">
      <div class="pather">
        <div class="toolbar">
          <div class="left"><span>File Browser</span></div>
          <div class="right">
            <input
              :class="[
                'filterbox',
                'selectable',
                'tip',
                'tipeft',
                { small: !istop && !isReadOnly() },
              ]"
              title="Filter Results by Keyword"
              type="text"
              placeholder="Filter Results"
              :value="filter"
              @input="updateFilter"
            />
            <div :class="['favorites', { small: !istop && !isReadOnly() }]">
              <div class="favbar">
                <span title="Favorites" class="material-icons favorite"
                  >favorite</span
                >
                <span>Favorites</span>
              </div>
              <ul class="favs">
                <li
                  @click="goFav(path)"
                  v-for="(path, index) in model.FAVS"
                  :key="index"
                >
                  {{ path.split("/").pop() }}
                </li>
              </ul>
            </div>
            <span
              title="refresh"
              @click="model.refresh()"
              class="material-icons button refresh tip tipright"
              >refresh</span
            >
            <span
              title="Kit and Keygroup Maker Tools"
              @click="launchTools()"
              v-if="!istop && !isReadOnly()"
              class="material-icons button tooling tip tipright"
              >launch</span
            >
            <span
              title="Create New Folder"
              @click="createFolder()"
              v-if="!istop && !isReadOnly()"
              class="material-icons button tip tipright"
              >create_new_folder</span
            >
          </div>
        </div>
        <div class="pathrow">
          <span
            title="Go Up One Level"
            @click="go_up"
            v-if="!istop"
            class="goup material-icons button"
            >reply</span
          >
          <span class="currentpath selectable">{{ model.PATH }}</span>
        </div>
        <div class="clipboard" v-if="model.CLIPBOARD.PATH != ''">
          <div class="header">
            <div class="left">
              <span><b>ClipBoard:</b></span>
              <span class="operation">{{ model.CLIPBOARD.OPERATION }}</span>
              <span class="counts"
                >Folders: {{ folderCount }} Files:{{ fileCount }}</span
              >
              <span v-if="isValidPaste()"> >> {{ model.PATH }} </span>
              <span class="error" v-if="!isValidPaste()">
                >> {{ cliperror }}
              </span>
            </div>
            <div class="right">
              <span
                title="Clear Clipboard"
                @click="clearClipboard()"
                v-if="model.CLIPBOARD.NODES.length"
                class="button material-icons tip tipright"
                >clear</span
              >
              <span
                :title="'Paste Into ' + model.PATH"
                @click="doPaste()"
                v-if="isValidPaste()"
                class="button material-icons paste tip tipright"
                >content_paste_go</span
              >
            </div>
          </div>
          <div class="clipboard-contents">
            <ul>
              <li v-for="(path, index) in model.CLIPBOARD.NODES" :key="index">
                <span
                  title="Remove Item"
                  class="material-icons button tip tipleft"
                  @click="removeClip(index)"
                >
                  remove_circle_outline
                </span>
                <span v-if="path.TYPE == 'FOLDER'" class="material-icons folder"
                  >folder</span
                >
                <span v-if="path.TYPE == 'FILE'" class="material-icons folder"
                  >insert_drive_file</span
                >
                <span>{{ path.PATH }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <table class="files" cellspacing="0">
        <tr class="thead">
          <th>#</th>
          <th
            :class="[
              {
                SORTEDASC: model.SORTBY == 'name' && !model.SORTDESC,
                SORTEDDSC: model.SORTBY == 'name' && model.SORTDESC,
              },
              'expander',
              'sortable',
            ]"
            @click="sortTable('name')"
          >
            <div>Name</div>
          </th>
          <th
            :class="[
              {
                SORTEDASC: model.SORTBY == 'type' && !model.SORTDESC,
                SORTEDDSC: model.SORTBY == 'type' && model.SORTDESC,
              },
              'sortable',
            ]"
            @click="sortTable('type')"
          >
            <div>Type</div>
          </th>
          <th
            @click="sortTable('size', true)"
            :class="[
              {
                SORTEDASC: model.SORTBY == 'size' && !model.SORTDESC,
                SORTEDDSC: model.SORTBY == 'size' && model.SORTDESC,
              },
              'nw',
              'sortable',
            ]"
          >
            <div>Size</div>
          </th>
          <th
            @click="sortTable('mstime', true)"
            :class="[
              {
                SORTEDASC: model.SORTBY == 'mstime' && !model.SORTDESC,
                SORTEDDSC: model.SORTBY == 'mstime' && model.SORTDESC,
              },
              'sortable',
            ]"
          >
            <div>Modified</div>
          </th>
          <th>Actions</th>
        </tr>
        <tbody name="filetable" is="transition-group">
          <tr
            :class="[
              {
                clipped: isClipped(item.path),
                filtered: isFiltered(item.name),
              },
              'row-folders',
              'table-row',
            ]"
            v-for="(item, index) in FOLDERS"
            :key="'dir' + index"
          >
            <td class="sn selectable">{{ index + 1 }}</td>
            <td class="bold clickable f-name" @click="browse(item.path)">
              <span class="material-icons folder">folder</span> {{ item.name }}
            </td>
            <td class="f-type"></td>
            <td class="f-fsize">0</td>
            <td class="f-time nw">{{ dateformat(item.mtime) }}</td>
            <td class="actions">
              <div class="actionbar">
                <span
                  title="Download Folder"
                  v-if="!isVolume(item.path)"
                  @click="download(item.path, 'FOLDER')"
                  class="button material-icons download tip tipright"
                  >file_download</span
                >
                <span
                  title="Copy Folder"
                  @click="clipCopy(item.path, 'FOLDER')"
                  v-if="!isVolume(item.path)"
                  class="button material-icons copy tip tipright"
                  >content_copy</span
                >
                <span
                  title="Move Folder"
                  @click="clipMove(item.path, 'FOLDER')"
                  v-if="!isVolume(item.path) && !isReadOnly()"
                  class="button material-icons cut tip tipright"
                  >content_cut</span
                >
                <span
                  title="Rename"
                  @click="doRename(item.name, 'FOLDER')"
                  v-if="!isVolume(item.path) && !isReadOnly()"
                  class="button material-icons rename tip tipright"
                  >edit</span
                >

                <span
                  title="Delete Folder"
                  @click="doDelete(item.path, 'FOLDER')"
                  v-if="!isVolume(item.path) && !isReadOnly()"
                  class="button material-icons delete tip tipright"
                  >delete_forever</span
                >
              </div>
            </td>
          </tr>
          <tr
            :class="[
              {
                clipped: isClipped(item.path),
                filtered: isFiltered(item.name),
              },
              'row-files',
              'table-row',
            ]"
            v-for="(item, index) in FILES"
            :key="'file' + index"
          >
            <td class="sn selectable">{{ index + 1 }}</td>
            <td class="f-name">
              <div>
                <span
                  title="Play"
                  v-if="isAudio(item.name) && !playing(item.path)"
                  @click="play(item.path)"
                  class="button material-icons play"
                  >play_arrow</span
                >
                <span
                  title="Stop"
                  v-if="isAudio(item.name) && playing(item.path)"
                  @click="stop()"
                  class="button material-icons stop"
                  >stop</span
                >
                <span v-if="isRegular(item.path)" class="material-icons file"
                  >insert_drive_file</span
                >
                <span
                  @click="doRead(item.path)"
                  v-if="isText(item.name)"
                  title="View Text Contents"
                  class="material-icons read button tip tipleft"
                  >description</span
                >
                <span
                  @click="doImage(item.path, false)"
                  v-if="isImage(item.name)"
                  title="View Image"
                  class="material-icons image button tip tipleft"
                  >image</span
                >
                <span
                  @click="doImage(item.path, true)"
                  v-if="isVideo(item.name)"
                  title="View Video"
                  class="material-icons video button tip tipleft"
                  >movie</span
                >
                <span
                  @click="doUNZIP(item.path)"
                  v-if="isZip(item.name)"
                  title="Extract Zip Archive"
                  class="material-icons zip button tip tipleft"
                  >folder_special</span
                >
                <span
                  @click="doProjectArrange(item.path)"
                  v-if="isProject(item.name)"
                  title="ReArrange Project Tracks"
                  class="material-icons project button tip tipleft"
                  >swap_horiz</span
                >

                <span
                  @click="restoreBackup(item.path)"
                  v-if="isProjectBackup(item.name)"
                  title="Restore Project Backup"
                  class="material-icons project button tip tipleft restore"
                  >settings_backup_restore</span
                >
                <span class="fileName">
                  {{ item.name }}
                </span>
                <span
                  title="Create Keygroup From"
                  v-if="isWav(item.name)"
                  @click="launchTools(item.path)"
                  class="button material-icons play tip tipright"
                  >straighten</span
                >
              </div>
            </td>

            <td class="f-type">{{ item.type }}</td>
            <td class="f-size nw">{{ size(item.size) }}</td>
            <td class="f-time nw">{{ dateformat(item.mtime) }}</td>
            <td class="actions">
              <div class="actionbar">
                <span
                  title="Download File"
                  @click="download(item.path, 'FILE')"
                  class="button material-icons download tip tipright"
                  >file_download</span
                >
                <span
                  title="Copy File"
                  @click="clipCopy(item.path, 'FILE')"
                  v-if="!isVolume(item.path)"
                  class="button material-icons copy tip tipright"
                  >content_copy</span
                >
                <span
                  title="Move File"
                  @click="clipMove(item.path, 'FILE')"
                  v-if="!isVolume(item.path) && !isReadOnly()"
                  class="button material-icons cut tip tipright"
                  >content_cut</span
                >
                <span
                  title="Rename"
                  @click="doRename(item.name, 'FILE')"
                  v-if="!isVolume(item.path) && !isReadOnly()"
                  class="button material-icons rename tip tipright"
                  >edit</span
                >
                <span
                  title="Delete File"
                  @click="doDelete(item.path, 'FILE')"
                  v-if="!isVolume(item.path) && !isReadOnly()"
                  class="button material-icons delete tip tipright"
                  >delete_forever</span
                >
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="reading" class="reader">
      <div class="header">
        <span class="title">Content Viewer</span>
        <span
          title="close"
          @click="reading = false"
          class="button material-icons close tip tipright"
          >close</span
        >
      </div>
      <div class="contents">
        <pre class="selectable">{{ contents }}</pre>
      </div>
    </div>
    <div v-if="imaging" class="imager">
      <div class="header">
        <span class="title">Image Viewer</span>
        <span
          title="close"
          @click="closeImaging()"
          class="button material-icons close tip tipright"
          >close</span
        >
      </div>
      <div class="contents">
        <img v-if="!video" :src="image" border="0" />
        <video v-if="video" controls autoplay>
          <source :src="image" />
        </video>
      </div>
    </div>
    <div v-if="browsing" class="browser">
      <div class="header">
        <span class="title">{{ dialogTitle }}</span>
        <span
          title="close"
          @click="closeBrowser()"
          class="button material-icons close tip tipright"
          >close</span
        >
      </div>
      <div class="contents">
        <iframe border="0" :src="this.extURL"></iframe>
      </div>
    </div>
  </div>
</template>
<script>
module.exports = {
  name: "browser",
  data() {
    return {
      historyChanged: false,
      audio: null,
      qMessage: "This Operation will Clear Clipboard File/Folder Queue",
      contents: "",
      imaging: false,
      browsing: false,
      extURL: "",
      image: "",
      reading: false,
      cliperror: "",
      filter: "",
      filter_timer: null,
      dialogTitle: "",
      video: false,
    };
  },

  props: {
    model: {
      required: true,
      type: Object,
    },
  },
  methods: {
    restoreBackup(p) {
      let $target = p.replace(/-\[\[[^\[]+Z\]\]\.xpjbk/, ".xpj");

      let msg = `Please Confirm you Want Restore The Project:
       ${$target} 
       <<< FROM <<< 
       ${p}`;
      if (confirm(msg)) {
        $payload = {
          COMMAND: "RESTORE",
          SOURCE: p,
          TARGET: $target,
        };
        this.sendCommand(
          "/file-browser/FSCOMMAND",
          $payload,
          this.model.refresh
        );
      }
    },
    launchTools($p = "") {
      $p = $p != "" ? $p : this.model.PATH;
      $target = `/tooling/TOOLS/${encodeURIComponent($p)}`;
      this.navigateTo($target, "Kit & Keygroup Tools");
      //window.open($target, "_blank");
    },
    navigateTo($url, $title = "") {
      this.extURL = "";
      this.extURL = $url;
      this.dialogTitle = $title;
      setTimeout(() => {
        this.extURL = $url;
        this.browsing = true;
      });
    },
    closeImaging() {
      this.image = "";
      this.imaging = false;
    },

    closeBrowser() {
      this.extURL = "";
      this.browsing = false;
      this.model.refresh();
    },
    doProjectArrange(p) {
      $target = `/track-arranger/PROCESS/${encodeURIComponent(p)}`;
      //window.open($target, "_blank");
      this.navigateTo($target, "Track ReArranger");
    },

    updateFilter(e) {
      let fText = e.target.value;
      clearTimeout(this.filter_timer);
      this.filter_timer = setTimeout(() => {
        this.filter = fText;
      }, 300);
    },
    isFiltered(n) {
      if (this.filter.trim() == "") return false;
      return n.toLowerCase().indexOf(this.filter.toLowerCase()) < 0;
    },
    goFav(p) {
      this.filter = "";
      this.browse(p);
      /* this.model.PATH = p;
      this.model.refresh();*/
    },
    doImage(p, video) {
      this.image = `/file-browser/DOWNLOAD/${escape(p)}`;
      this.video = video;
      this.imaging = true;
    },
    doRead(p) {
      fetch(`/file-browser/READ/${escape(p)}`, {
        method: "get",
      }).then((response) => {
        response.json().then((data) => {
          //let j = JSON.parse(data);
          this.contents = data.DATA;
          this.reading = true;
        });
      });
    },
    doUNZIP(p) {
      let $target = p.slice(0, -4);
      let valid = true;
      if (this.model.FOLDERS.findIndex((f) => f.path == $target) >= 0) {
        valid = confirm(`Please Confirm Folder Overwrite: ${$target}

Please also note : Zip Extraction may take some time, so Wait!.
        `);
      } else {
        if (this.verbose)
          valid = confirm(`Please Confirm Zip Extraction for ${p}

Please also note : Zip Extraction may take some time, so Wait!.
        `);
      }
      if (!valid) return;
      $payload = {
        COMMAND: "UNZIP",
        SOURCE: p,
        TARGET: $target,
      };
      this.sendCommand("/file-browser/FSCOMMAND", $payload, this.model.refresh);
    },
    doRename(p, type) {
      let fname = prompt(`Rename ${p} to :`, p);
      if (fname == null || fname.trim() == p) return;
      fname = fname.trim();
      valid =
        /^[a-zA-Z0-9-_\[\]]+[a-zA-Z0-9-_\[\]\. ]*[a-zA-Z0-9-_\[\]\.]*$/.test(
          fname
        );
      if (!valid) {
        alert("Invalid File/Folder Name: Allowed Characters: A-Z0-9-_[].");
        return;
      }
      let fldrs = this.model.FOLDERS.map((f) => f.name);
      let files = this.model.FILES.map((f) => f.name);
      if (fldrs.includes(fname) || files.includes(fname)) {
        alert(`Error: ${fname} already exists in ${this.model.PATH}`);
        return;
      }
      $payload = {
        COMMAND: "RENAME",
        SOURCE: `${this.model.PATH}/${p}`,
        TARGET: `${this.model.PATH}/${fname.trim()}`,
      };

      this.sendCommand("/file-browser/FSCOMMAND", $payload, this.model.refresh);
    },
    createFolder() {
      let fname = prompt(`Folder Name to Create:`, "");
      valid = /^[a-zA-Z0-9-_\[\]]+\s*[a-zA-Z0-9-_\[\]]*$/.test(fname);
      if (fname == null) return;
      if (!valid) {
        alert("Invalid Folder Name: Allowed Characters: A-Z0-9-_[]");
        return;
      }
      let fldrs = this.model.FOLDERS.map((f) => f.name);
      if (fldrs.includes(fname)) {
        alert(`Error:
Folder: ${this.model.PATH}/${fname} already exists!`);
      }
      $payload = {
        COMMAND: "CREATE-FOLDER",
        SOURCE: this.model.PATH,
        TARGET: fname,
      };
      this.sendCommand("/file-browser/FSCOMMAND", $payload, this.model.refresh);
    },
    doPaste() {
      let msg = `Please Confirm you Want to ${this.model.CLIPBOARD.OPERATION} the Clipboard Contents to
${this.model.CLIPBOARD.PATH}
>>> TO >>>
${this.model.PATH}/`;
      if (confirm(msg)) {
        $payload = {
          COMMAND: this.model.CLIPBOARD.OPERATION,
          SOURCE: this.model.CLIPBOARD.NODES,
          TARGET: this.model.PATH,
        };
        this.sendCommand(
          "/file-browser/FSCOMMAND",
          $payload,
          this.moveComplete
        );
      }
    },
    moveComplete() {
      if (this.model.CLIPBOARD.OPERATION == "MOVE") {
        this.model.CLIPBOARD.NODES = [];
        this.model.CLIPBOARD.PATH = "";
      }
      this.model.refresh();
    },
    removeClip(index) {
      this.model.CLIPBOARD.NODES.splice(index, 1);
      if (!this.model.CLIPBOARD.NODES.length) this.model.CLIPBOARD.PATH = "";
    },
    clipCopy(p, type) {
      console.log(p);
      if (
        (this.model.CLIPBOARD.PATH != "" &&
          this.model.CLIPBOARD.PATH != this.model.PATH) ||
        (this.model.CLIPBOARD.NODES.length &&
          this.model.CLIPBOARD.OPERATION != "COPY")
      ) {
        if (!confirm(this.qMessage)) return;

        this.model.CLIPBOARD.PATH = this.model.PATH;
        this.model.CLIPBOARD.NODES = [];
      }
      this.model.CLIPBOARD.OPERATION = "COPY";
      this.model.CLIPBOARD.PATH = this.model.PATH;
      let paths = this.model.CLIPBOARD.NODES.map((n) => n.PATH);
      let index = paths.indexOf(p);
      if (index >= 0) {
        this.model.CLIPBOARD.NODES.splice(index, 1);
      } else {
        this.model.CLIPBOARD.NODES.push({ PATH: p, TYPE: type });
      }
      if (!this.model.CLIPBOARD.NODES.length) this.model.CLIPBOARD.PATH = "";

      /*  this.model.CLIPBOARD = {
              PATH:p,
              OPERATION:'COPY',
              TYPE:type
          }*/
    },
    clipMove(p, type) {
      if (
        (this.model.CLIPBOARD.PATH != "" &&
          this.model.CLIPBOARD.PATH != this.model.PATH) ||
        (this.model.CLIPBOARD.NODES.length &&
          this.model.CLIPBOARD.OPERATION != "MOVE")
      ) {
        if (!confirm(this.qMessage)) return;

        this.model.CLIPBOARD.PATH = this.model.PATH;
        this.model.CLIPBOARD.NODES = [];
      }
      this.model.CLIPBOARD.OPERATION = "MOVE";
      this.model.CLIPBOARD.PATH = this.model.PATH;
      let paths = this.model.CLIPBOARD.NODES.map((n) => n.PATH);
      let index = paths.indexOf(p);
      if (index >= 0) {
        this.model.CLIPBOARD.NODES.splice(index, 1);
      } else {
        this.model.CLIPBOARD.NODES.push({ PATH: p, TYPE: type });
      }
      if (!this.model.CLIPBOARD.NODES.length) this.model.CLIPBOARD.PATH = "";
    },
    clearClipboard() {
      this.model.CLIPBOARD.NODES = [];
      this.model.CLIPBOARD.PATH = "";
    },
    isClipped(p) {
      let paths = this.model.CLIPBOARD.NODES.map((n) => n.PATH);
      return paths.indexOf(p) >= 0;
    },

    doDelete(p, type) {
      $url = `${location.href}/DELETE`;
      if (
        !confirm(`Warning: Deleting is Permanent!

All Folders and Sub-Folders Will Also be Deleted!

>> To Delete: ${p}

Do you Wish to Continue with Operation ?
`)
      ) {
        return;
      }
      $payload = {
        PATH: p,
        TYPE: type,
      };
      $payload = {
        COMMAND: "DELETE",
        SOURCE: p,
        TARGET: "",
      };
      this.sendCommand("/file-browser/FSCOMMAND", $payload, this.model.refresh);
    },

    download(p, type) {
      $file = `${location.href}/DOWNLOAD/${encodeURIComponent(p)}`;
      if (type == "FOLDER") {
        if (
          !confirm(`Downloading Large Folders Can Timeout and cause Problems!
Also Note that Folder tar Archive will be Created on DOWNLOADS folder on your 662522 SD Card/Pen Drive, So Have enough Free Space.!
Do you Wish to Continue ?
`)
        )
          return;
      }
      this.navigateTo($file, "Project/Folder Downloader");
      return;
      //    let url = window.URL.createObjectURL($file);
      var anchorElem = document.createElement("a");
      anchorElem.style = "display: none";
      anchorElem.href = $file;
      //anchorElem.download = fileName;
      anchorElem.target = "_blank";
      document.body.appendChild(anchorElem);
      anchorElem.click();
      document.body.removeChild(anchorElem);
    },

    sendCommand(url, payload, callbak) {
      fetch(url, {
        method: "post",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }).then((response) => {
        response.json().then((data) => {
          if (data.RESULT == "OK" && callbak) {
            //    console.log('calling callbavk',callbak);
            callbak();
          }
          let msg = data.MESSAGE;
          if (data.RESULT == "ERROR") {
            msg = `*** ERROR ***
${msg}
`;
            alert(msg);
          } else {
            if (this.verbose) alert(msg);
          }
        });
      });
    },

    sortTable(fld, isNumber = false) {
      //  console.log('sorting');
      this.model.doSorting(fld, isNumber);
    },
    browse(p) {
      this.filter = "";
      this.model.browse(p);
    },
    go_up() {
      pth = this.model.PATH.split("/");
      pth.pop();
      pth = pth.join("/");
      this.model.browse(pth);
    },

    size(v) {
      let b = 1024;
      switch (true) {
        case v < b:
          return v + " B";
        case v < b ** 2:
          return (v / b).toFixed(1) + " KB";
        case v < b ** 3:
          return (v / b ** 2).toFixed(1) + " MB";
        default:
          return (v / b ** 3).toFixed(1) + " GB";
      }
    },
    dateformat(v) {
      return v.replace(/T/, " ").replace(/\..+/, "");
    },
    isTarget(p) {
      let node = this.model.CLIPBOARD.PATH.split("/").pop();
      let nPath = `${p}/${node}`;
      return (
        !this.isReadOnlyPath(p) &&
        this.model.CLIPBOARD.PATH.trim() != "" &&
        !p.startsWith(this.model.CLIPBOARD.PATH) &&
        this.model.CLIPBOARD.PATH != nPath
      );
    },
    isReadOnlyPath(p) {
      return p.startsWith("/media/acvs-synths");
    },
    isVolume(f) {
      return f.split("/").length < 4;
    },

    isRegular(p) {
      if (this.isImage(p)) return false;
      if (this.isAudio(p)) return false;
      if (this.isVideo(p)) return false;
      if (this.isZip(p)) return false;
      if (this.isText(p)) return false;
      if (this.isProject(p)) return false;
      if (this.isProjectBackup(p)) return false;
      return true;
    },

    isType(p, EXT) {
      return p.toLowerCase().endsWith(EXT.toLowerCase());
    },
    isProject(p) {
      return this.isType(p, ".xpj");
    },
    isProjectBackup(p) {
      return this.isType(p, ".xpjbk");
    },

    isImage(p) {
      let ext = "." + p.split(".").pop().toLowerCase();
      return [".gif", ".jpg", ".png", ".webp"].includes(ext);
    },
    isVideo(p) {
      let ext = "." + p.split(".").pop().toLowerCase();
      return [".mp4", ".mpg"].includes(ext);
    },
    isZip(p) {
      return this.isType(p, ".zip");
    },

    isText(p) {
      let texts = [
        ".txt",
        ".sh",
        ".php",
        ".xpm",
        ".json",
        ".progression",
        ".mpcpattern",
        ".py",
        ".js",
        ".vue",
        ".css",
        ".md",
        ".xfx",
        ".xml",
        ".xmm",
        ".nfo",
        ".log",
        ".lua",
        ".h",
        ".c",
        ".cpp",
        ".xpl",
      ];
      let ext = "." + p.split(".").pop().toLowerCase();
      return texts.includes(ext);
    },
    isWav(f) {
      return this.isType(f, ".wav");
    },
    isAudio(f) {
      let formats = [".wav", ".mp3", ".aif", ".ogg"];

      let valid = formats.includes(f.toLowerCase().slice(f.length - 4));
      if (!valid) {
        valid = f.toLowerCase().endsWith(".flac");
      }

      return !f.startsWith(".") && valid;
    },
    stop() {
      this.FILES.forEach((f) => (f.playing = false));
      if (this.audio) {
        this.audio.pause();
        this.audio.src = "";
        this.audio = null;
      }
    },

    play(p) {
      this.stop();
      let findex = this.model.FILES.findIndex((f) => f.path == p);
      this.model.FILES[findex].playing = true;

      $file = `/file-browser/DOWNLOAD/${escape(p)}`;
      this.audio = new Audio($file);
      let model = this.model;
      this.audio.onended = function () {
        model.FILES[findex].playing = false;
      };
      this.audio.play();
    },
    playing(p) {
      let findex = this.model.FILES.findIndex((f) => f.path == p);
      return this.model.FILES[findex].playing;
    },
    isValidPaste() {
      let current = this.model.PATH;
      if (current == "/media") {
        this.cliperror = `Cannot ${this.model.CLIPBOARD.OPERATION} To /media`;
        return false;
      }

      if (current.startsWith("/media/acvs-synths")) {
        this.cliperror = `Cannot ${this.model.CLIPBOARD.OPERATION} To /media/acvs-synths`;
        return false;
      }

      for (let i = 0; i < this.model.CLIPBOARD.NODES.length; i++) {
        let p = this.model.CLIPBOARD.NODES[i];
        if (p.TYPE === "FOLDER") {
          if ((current + "/").startsWith(p.PATH + "/")) {
            this.cliperror = `Cannot ${this.model.CLIPBOARD.OPERATION}  ${p.PATH} To ${this.model.PATH}`;
            return false;
          }
        } else {
          if (current.startsWith(p.PATH)) {
            this.cliperror = `Cannot ${this.model.CLIPBOARD.OPERATION}  ${p.PATH} To ${this.model.PATH}`;
            return false;
          }
        }
        let item = p.PATH.split("/").pop();
        let npath = current + "/" + item;
        if (npath == p.PATH) {
          this.cliperror = `Cannot ${this.model.CLIPBOARD.OPERATION} ${p.PATH} To Same Location`;
          return false;
        }
        if (
          this.model.FILES.map((f) => f.name).includes(item) ||
          this.model.FOLDERS.map((f) => f.name).includes(item)
        ) {
          this.cliperror = `Overwrite Not Allowed: ${this.model.CLIPBOARD.OPERATION}  ${p.PATH} To ${this.model.PATH}`;
          return false;
        }
      }

      return true;
    },
    isReadOnly() {
      return this.model.PATH.startsWith("/media/acvs-synths");
    },
  },

  computed: {
    verbose() {
      return this.model.CONFIG.LESS_PROMPTS != "1";
    },
    FOLDERS() {
      if (this.filter.trim() == "") return this.model.FOLDERS;
      return this.model.FOLDERS.filter(
        (F) => F.name.toLowerCase().indexOf(this.filter.toLowerCase()) != -1
      );
    },
    FILES() {
      if (this.filter.trim() == "") return this.model.FILES;

      return this.model.FILES.filter(
        (F) => F.name.toLowerCase().indexOf(this.filter.toLowerCase()) != -1
      );
    },

    fileCount() {
      return this.model.CLIPBOARD.NODES.filter((f) => f.TYPE == "FILE").length;
    },
    folderCount() {
      return this.model.CLIPBOARD.NODES.filter((f) => f.TYPE == "FOLDER")
        .length;
    },
    UPDATED() {
      return this.model.UPDATED;
    },
    istop() {
      return this.model.PATH == "/media";
    },
  },
  watch: {
    path: function (P) {
      console.log("PATH CHANGED");
    },

    UPDATED(val) {
      if (val) this.$forceUpdate();
    },
  },
  mounted() {
    history.pushState(null, { data: 0 }, location.href);
    let me = this;
    window.onpopstate = function (e, i) {
      if (!me.historyChanged) {
        if (!me.istop) {
          me.go_up();
          me.historyChanged = true;
          setTimeout(() => {
            me.historyChanged = false;
          }, 1000);
        }
      }
      history.go(1);
    };
  },
};
</script>
<style scoped>
h2 {
  margin: 0;
  margin-bottom: 8px;
  font-size: 18px;
}
.favbar {
  display: flex;
  align-items: center;
  border: 1px solid #000;
  border-radius: 4px;
  position: relative;
  font-size: 12px;
  gap: 8px;
}
.filtered {
  display: none !important;
}
.favbar::after {
  content: "^";
  position: absolute;
  bottom: 4px;
  right: 4px;
  font-size: 16px;
  transform: rotate(180deg);
  color: #000;
}
.favorite {
  color: red;
  transform: scale(0.7);
}
ul.favs.favs.favs {
  display: flex !important;
  margin: 0 !important;

  gap: 8px !important;
  flex-direction: column !important;
  background-color: #fff;
  padding: 4px !important;
  border-radius: 4px !important;
  display: none !important;
  position: absolute;
  width: 100% !important;
  z-index: 99991;
  top: 24px;
  border: 1px solid #000;
  border-radius: 4px;
}
.filterbox {
  max-width: 136px;
  height: 26px;
  border-radius: 4px;
  padding: 2px 4px;
  font-size: 11px;
  border: 1px solid #000;
}
.favorites {
  position: relative !important;
  width: 150px;
}
.favorites:hover ul.favs.favs.favs,
.favorites:active ul.favs.favs.favs {
  display: flex !important;
}
ul.favs.favs.favs li {
  margin: 0 !important;
  padding: 2px 8px !important;
  background-color: #fff !important;
  color: #000;
  font-size: 11px !important;
  cursor: pointer;
}
ul.favs.favs.favs li:hover {
  background-color: red !important;
  color: #fff !important;
}
.files {
  border: 1px solid #000;

  width: 100%;
  display: block;
  min-height: calc(100vh - 150px);
  max-height: calc(100vh - 150px);
  overflow-y: scroll;
  padding: 0;
  padding-bottom: 4px;
  margin: 0;
  border-collapse: collapse;
}

.files .thead {
  position: -webkit-sticky;
  position: sticky;
  top: -1px;
  z-index: 100;
  background-color: #fff;
}

.files th {
  text-align: left;

  height: 32px;
  background-color: #000;
  color: gold;
}
.files th.expander {
  width: 100%;
}
.clipboard {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 4px;
  background-color: aliceblue;
  font-size: 10px;
  border-radius: 4px;
}
.clipboard .operation {
  font-weight: bold;
  color: crimson;
  text-transform: Capitalize;
}

.files th,
.files td {
  padding: 4px 8px;
  font-size: 10px;
  border: 1px solid #000;
}
.files td span {
  margin-right: 4px;
  vertical-align: middle;
}
.bold {
  font-weight: bold;
}
.material-icons {
  max-width: 24px;
  max-height: 24px;
}
.files .material-icons.folder {
  color: #fbd775;
  font-weight: normal;
}
.material-icons.file {
  color: #888;
  font-weight: normal;
}
.clickable,
.sortable {
  cursor: pointer;
}
.nw {
  white-space: nowrap;
}
th.SORTEDASC,
th.SORTEDDSC {
  position: relative;
  padding-right: 32px;
}
th.SORTEDASC ::after {
  content: "^";
  display: inline-block;
  margin-left: 8px;
  font-size: 14px;
  position: absolute;
  right: 8px;
  top: 8px;
}
th.SORTEDDSC ::after {
  content: "^";
  transform: rotate(180deg);
  display: inline-block;
  margin-left: 8px;
  font-size: 14px;
  position: absolute;
  right: 8px;
  top: 8px;
}
.toolbar {
  display: flex;
  gap: 8px;
  align-items: center;
}
.toolbar .left {
  display: flex;
  flex: 1;
  justify-content: flex-start;
  align-items: center;
}
.toolbar .right {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  align-items: center;
}
.pather {
  display: flex;
  flex-direction: column;
  gap: 4px;
  /*align-items: center;
justify-content: center;*/
  padding: 0px;
}
.pather .pathrow {
  display: flex;
  flex: 1;
  gap: 4px;
  align-items: center;
  padding: 4px 0px;
}
.pather .goup {
  transform: rotate(90deg);
  cursor: pointer;
  display: inline-block;

  border-radius: 2px;
  border: 1px solid #000;
}
.pathrow span.material-icons:hover {
  background-color: #fbd775;
}

.pather .currentpath {
  flex: 1;
  font-size: 10px;
  border: 1px dotted #000;
  padding: 4px;
  min-height: 24px;
  display: flex;
  align-items: center;
  overflow: hidden;
}
.files .material-icons {
  opacity: 0.35;
}
.files .material-icons:hover {
  opacity: 1;
  transition: opacity 0.3s;
}
.files .f-name .material-icons {
  opacity: 1;
}

.stop {
  color: crimson;
}
.restore {
  color: salmon;
}
.copy {
  color: dodgerblue;
}
.cut {
  color: saddlebrown;
}
.delete {
  color: red;
}
.read {
  color: blueviolet;
}
.image {
  color: lightblue;
}
.refresh {
  color: forestgreen;
}
.tooling {
  color: slateblue;
}
.paste {
  background-color: salmon;
  color: black;
  border-radius: 4px;
}
.zip {
  color: fuchsia;
}
.filetable-enter {
  opacity: 0 !important;
}
.filetable-enter-active {
  transition: opacity 0.3s;
}
.button {
  cursor: pointer;
}
.actionbar {
  display: flex;
}
.clipboard .header {
  display: flex;
  gap: 8px;
  font-size: 12px;
  padding-left: 8px;
}
.clipboard {
  max-height: 32px;
  transition: max-height 0.3s ease-out;
}
.clipboard:hover {
  max-height: 100vh;
  transition: max-height 0.3s ease-in;
}
.clipboard .header .left {
  display: flex;
  gap: 8px;
  font-size: 12px;
  padding-left: 8px;
  flex: 1;
}
.clipboard .header .right {
  display: flex;
  gap: 8px;
}

.clipboard-contents {
  width: 100%;
  margin-bottom: 8px;
  max-height: 0 !important;
  overflow: hidden;
  transition: opacity 0.2s;
  opacity: 0;
}

.clipboard > div {
  display: flex;
}
.clipboard-contents ul {
  width: 100%;
  gap: 4px !important;
  margin: 0 !important;
}
.clipboard:hover .clipboard-contents,
.clipboard:focus-within .clipboard-contents {
  display: flex !important;
  max-height: 500vh !important;
  opacity: 1;
}
.clipboard-contents ul li {
  padding: 2px 0px !important;
  margin: 0 !important;
  display: flex;
  flex-direction: row !important;
  font-size: 10px !important;
  background-color: transparent !important;
  border-bottom: 1px solid #000;
}
.clipboard-contents ul li span.ptype {
  max-width: 100px;
}
tr.clipped td {
  background-color: beige;
}
tr.clipped.row-files td {
  background-color: aliceblue;
}
.error {
  color: red;
  font-weight: bold;
  font-size: 10px;
}
.clipboard .header {
  display: flex;
  gap: 8px;
  font-size: 12px;
  padding-left: 8px;
}
.reader,
.imager {
  position: absolute;
  top: 0;
  left: 0;
  max-width: 960px;
  width: 100%;
  padding: 16px;
  height: 96vh;
  max-height: 96vh;

  background: #fff;
  z-index: 999;
}

.browser .contents {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding-top: 4px;
  border: 1px dotted #000;
  border-radius: 0px 0px 4px 4px;
}
.browser {
  position: relative;
  top: 0;
  left: 0;
  max-width: 100%;
  width: 100%;
  padding: 0px;
  max-height: calc(100vh - 64px);
  min-height: calc(100vh - 64px);
  background: #fff;
  background-color: fff;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.browser iframe {
  border: 0;
  position: relative;
  flex: 1 1 0%;
  max-width: 100%;
  width: 100%;
  padding: 4 px 0 px;
  height: auto;
  border: 1 px dotted #000;
  border-top: 0;
  border-radius: 0 0 4 px 4 px;
}

.reader .contents {
  overflow: scroll;
  min-height: 80vh;
  max-height: 90vh;
  border: 1px solid #000;
  padding: 4px 32px;
}
.reader .contents pre,
.reader .contents code {
  font-size: 11px;
  line-height: 1.3rem;
}
.reader .header,
.imager .header,
.browser .header {
  display: flex;
  justify-content: space-between;
  background-color: deepskyblue;
  padding: 2px;
  gap: 8px;
  border-radius: 4px 4px 0 0;
  align-items: center;
}
.reader .header .title,
.imager .header .title,
.browser .header .title {
  font-size: 12px;
  flex: 1;
  padding-left: 8px;
}
.imager img {
  max-width: 100%;
  height: auto;
}
.imager video {
  max-width: 100%;
  min-width: 100%;
  height: auto;
}
.master {
  position: relative;
}
.f-name > div {
  display: flex;
  flex: 1;
  align-items: center;
}
.fileName {
  flex: 1;
}
.tip {
  position: relative;
  display: inline-block;
  overflow: visible;
  content: "sdsd";
}
.tip:hover::before,
.tip:active::before {
  content: attr(title);
  pointer-events: none;
  background-color: PaleTurquoise;
  color: #000;
  display: block;
  padding: 4px;
  border: 1px solid #000;
  position: absolute;
  font-size: 9px;
  font-family: Verdana, Geneva, Tahoma, sans-serif;
  bottom: 110%;
  width: auto;
  white-space: nowrap;
  border-radius: 4px;
  text-transform: capitalize;
  z-index: 999999999;
}
.tipright::before {
  right: 0;
}
.tipleft::before {
  left: 0;
}

@media (max-width: 600px) {
  #vuecontainer {
    padding: 0px 8px 8px !important;
  }
  .reader,
  .imager,
  .browser {
    padding: 4px 2px !important;
  }
  .filterbox.filterbox.small {
    max-width: 100px;
  }
  .favorites.small {
    max-width: 120px;
  }
  .toolbar .left {
    display: none !important;
  }
  .toolbar .right {
    flex: 1;
  }
  .files {
    position: relative !important;
    min-height: calc(100vh - 160px) !important;
    max-height: calc(100vh - 160px) !important;
    border: 1px solid #000 !important;
    padding-top: 16px !important;
    background-color: #ccc !important;
  }
  .thead {
    display: flex;
  }
  .files th.expander {
    width: unset !important;
  }
  .files th {
    display: none;
  }
  .pather {
    margin-top: 54px;
  }
  .files .thead {
    height: 32px !important;
    position: fixed !important;
    top: 32px !important;
    left: 0;
    z-index: 9999;
    display: flex;
    gap: 8px;
    justify-content: center;
    align-items: center;
    margin: 16px 0;
  }

  .files .thead::before {
    content: "SORT :: ";
    display: flex;
    font-size: 14px;
  }
  .files th.sortable {
    display: flex;
    align-items: center;
    border-radius: 4px;
    background-color: #fff;
    color: #000;
    height: 24px;
  }
  .files .material-icons {
    opacity: 1 !important;
  }
  th.SORTEDASC.SORTEDASC ::after {
    top: 4px;
  }
  th.SORTEDDSC.SORTEDDSC ::after {
    bottom: 4px;
  }

  .files th.sortable div {
    display: flex;
    align-items: center;
  }

  table {
    border-collapse: collapse;
  }
  tbody {
    display: flex;
    flex-direction: column;
    max-width: calc(100%);
    padding: 0 8px;
    gap: 0px;
  }
  tr {
    display: flex;
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
    border: 0;
    box-shadow: 1px 1px 4px #777;
  }
  tr.thead {
    box-shadow: none;
  }
  td {
    display: flex;
    align-items: center !important;
    background-color: #fff !important;
  }
  tr.clipped td {
    background-color: beige !important;
  }
  tr.clipped.row-files td {
    background-color: aliceblue !important;
  }

  .f-name {
    border-bottom: 0px !important;
    display: flex;
    align-items: center;
    flex-grow: 1;
    min-width: 80%;
    width: calc(100% - 48px);
    min-width: 80%;
  }

  .f-size {
    border-bottom: 0px !important;
    border-right: 0 !important;
  }
  .f-fsize {
    display: none;
  }
  .f-fsize + td.f-time {
    border-left: 1px solid #000 !important;
  }
  .f-type {
    display: none;
    border-bottom: 0px !important;
  }
  .f-time {
    flex-grow: 1;
    border-left: 0 !important;
    border-bottom: 0px !important;
    font-size: 8px !important;
  }

  .files td.actions {
    width: 100%;
    max-height: 0px;
    overflow: hidden;
    padding: 0;
    transition: all 0.3s;
  }
  .files tr:focus-within td.actions,
  .files tr:active td.actions,
  .files tr:hover td.actions {
    width: 100%;
    max-height: 32px;
    overflow: visible;
    padding: 4px 8px;
  }
  .clipboard .header .left {
    flex-wrap: wrap;
  }
  .clipboard .material-icons {
    font-size: 18px !important;
  }

  .actionbar {
    flex: 1;
    gap: 4px;
    justify-content: space-between !important;
  }
  td.sn,
  tr.clipped td.sn {
    min-width: 32px;
    border-bottom: 0px !important;
    border-right: 0px !important;
    background-color: #000 !important;
    color: salmon !important;
    padding: 4px !important;
  }
}
</style>
