class jsonblobapi {
  constructor(id) {
    this.saving = 0
    this.id = id
    this.url = `https://jsonblob.com/api/jsonBlob/${id}`
    this.resetTimer()
  }
  openUrl() {
    window.open("https://jsonblob.com/" + this.id, "_blank")
  }
  resetTimer() {
    if (this.t) {
      clearTimeout(this.t)
    }
    this.t = setTimeout(
      (async () => {
        if (window.intextarea) {
          this.resetTimer()
          return
        }
        var data = await this.load(true)
        if (data !== window.lastdata) {
          var changes = compareNestedJson(
            JSON.parse(window.lastdata),
            JSON.parse(data)
          )
          log(changes)
          log("DATA CHANGED")
          tryLocalSave(lastdata, "prev")
          tryLocalSave(data, "new")
          window.lastdata = data
          loadAllData((data = JSON.parse(data)))
          if (localStorage.sendnoti == "true") {
            for (var change of changes) {
              var func = (() => {
                focus()
              }).bind(this, change)
              var id = change.path.split(".")[0]
              switch (change.type) {
                case "added":
                  var name = change.to.name
                  if (/^\d+$/.test(change.path))
                    sendnoti(`Added new task: "${name}"`, func)
                  if (/^\d+\.desc$/.test(change.path))
                    sendnoti(
                      `added description to task: "${name}"`,
                      func
                    )
                  if (/^\d+\.completed$/.test(change.path))
                    sendnoti(`completed task: "${name}"`, func)
                  break
                case "diff":
                  log([data, id, data[id]])
                  var name = data[id].name
                  if (/^\d+\.desc$/.test(change.path))
                    sendnoti(
                      `changed description of task: "${name}"`,
                      func
                    )
                  break
                case "removed":
                  if (/^\d+$/.test(change.path)) {
                    var name = change.from.name
                    sendnoti(`removed task: "${name}"`, func)
                  }
                  break
              }
            }
          }
        } else log("no data changed")
      }).bind(this),
      1 * (ls.refreshInterval ??= 30) * 1000
    )
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
    if (!dontsave) window.lastdata = x
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
