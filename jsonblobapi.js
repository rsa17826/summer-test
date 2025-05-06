class jsonblobapi {
  constructor(id) {
    this.saving = 0
    this.id = id
    this.url = `https://jsonblob.com/api/jsonBlob/${id}`
    this.resetTimer()
    this.checkDataChange()
  }
  openUrl() {
    window.open("https://jsonblob.com/" + this.id, "_blank")
  }
  resetTimer() {
    if (this.t) {
      clearTimeout(this.t)
    }
    this.t = setTimeout(
      this.checkDataChange.bind(this),
      1 * (ls.refreshInterval ??= 30) * 1000
    )
  }
  async checkDataChange() {
    if (window.intextarea) {
      this.resetTimer()
      return
    }
    var data = await this.load(true)
    if (data !== ls.lastdata) {
      var changes = compareNestedJson(
        JSON.parse(ls.lastdata),
        JSON.parse(data)
      )
      log(changes)
      log("DATA CHANGED")
      tryLocalSave(ls.lastdata, "prev")
      tryLocalSave(data, "new")
      ls.lastdata = data
      loadAllData((data = JSON.parse(data)))
      if (localStorage.sendnoti == "true") {
        for (var change of changes) {
          var func = (name) => {
            focus()
            if (name !== -1) {
              window.filters = { name: { undefined: name } }
              applyFilters()
            }
          }
          var id = change.path.split(".")[0]
          var name = data[id].name

          switch (change.type) {
            case "added":
              // var name = change.to.name
              if (/^\d+$/.test(change.path))
                sendnoti(
                  `Added new task: "${name}"`,
                  func.bind(this, name)
                )
              if (/^\d+\.desc$/.test(change.path))
                sendnoti(
                  `added description to task: "${name}"`,
                  func.bind(this, name)
                )
              if (/^\d+\.completed$/.test(change.path))
                sendnoti(
                  `completed task: "${name}"`,
                  func.bind(this, name)
                )
              if (/^\d+\.comments/.test(change.path))
                sendnoti(
                  `${change.to.username} added comment to task: "${name}"`,
                  func.bind(this, name)
                )
              break
            case "diff":
              if (/^\d+\.desc$/.test(change.path))
                sendnoti(
                  `changed description of task: "${name}"`,
                  func.bind(this, name)
                )
              if (/^\d+\.comments/.test(change.path))
                sendnoti(
                  `edited comment on task: "${name}"`,
                  func.bind(this, name)
                )
              break
            case "removed":
              if (/^\d+$/.test(change.path)) {
                var name = change.from.name
                sendnoti(
                  `removed task: "${name}"`,
                  func.bind(this, -1)
                )
              }
              break
          }
        }
      }
    } else log("no data changed")
  }
  async load(dontsave) {
    if (this.saving) await this.__notSaving()
    this.resetTimer()
    this.saving++
    try {
      var x = (await globalrequest(this.url)).text
    } catch (e) {
      error(e)
      toast("network error: failed to load", "red")
    }
    if (!dontsave) ls.lastdata = x
    this.saving--
    return x
  }
  async __notSaving() {
    if (!this.saving) {
      return
    }
    return new Promise((resolve, reject) => {
      var int = setInterval(
        (() => {
          if (!this.saving) {
            clearInterval(int)
            resolve()
          }
        }).bind(this)
      )
    })
  }
  async save(data) {
    if (this.saving) await this.__notSaving()
    this.resetTimer()
    this.saving++
    await tryLocalSave(data)
    try {
      await globalrequest({
        url: this.url,
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: data,
      })
    } catch (e) {
      error(e)
      toast("network error: failed to save", "red")
    }
    this.saving--
    if (data !== (await this.load(true))) {
      toast("not saved", "red")
      a.download(data, "summer test backup.json")
    } else {
      toast("saved!", "green")
    }
    return
  }
}
