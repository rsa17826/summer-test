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
      1 * (ls.refreshInterval ||= 30) * 1000
    )
  }
  async checkDataChange() {
    if (window.intextarea) {
      this.resetTimer()
      return
    }
    var data = await this.load(true)
    ls.lastdata ??= data
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
      for (var change of changes) {
        var func = (name) => {
          focus()
          if (name !== -1) {
            window.filters = { name: { undefined: name } }
            applyFilters()
          }
        }
        var id = change.path.split(".")[0]
        var thingName = data[id]?.name
        if (!thingName) {
          error(`No thingName for id ${id} in data`)
        }
        switch (change.type) {
          case "added":
            // var name = change.to.name
            if (/^\d+\.completions$/.test(change.path)) {
              for (var user of Object.keys(change.to)) {
                sendnoti(
                  `${user} has now done "${thingName}" ${change.to[user]} times`,
                  func.bind(this, thingName)
                )
              }
            }
            if (/^\d+\.completions\..+$/.test(change.path)) {
              sendnoti(
                `${
                  change.path.split(".")[2]
                } has now done "${thingName}" a total of ${
                  change.to
                } time${change.to == 1 ? "" : "s"}`,
                func.bind(this, thingName)
              )
            }
            if (/^\d+\.validPlayerCounts\.\d+$/.test(change.path))
              sendnoti(
                `"${thingName}" can now be done with ${change.to} players`,
                func.bind(this, thingName)
              )
            if (/^\d+$/.test(change.path))
              sendnoti(
                `Added new task: "${thingName}"`,
                func.bind(this, thingName)
              )
            if (/^\d+\.desc$/.test(change.path))
              sendnoti(
                `added description to task: "${thingName}"`,
                func.bind(this, thingName)
              )
            if (/^\d+\.completed$/.test(change.path))
              sendnoti(
                `completed task: "${thingName}"`,
                func.bind(this, thingName)
              )
            if (/^\d+\.comments/.test(change.path))
              sendnoti(
                `${change.to.username} added comment to task: "${thingName}"`,
                func.bind(this, thingName)
              )
            break
          case "diff":
            if (/^\d+\.completions\..+$/.test(change.path)) {
              sendnoti(
                `${
                  change.path.split(".")[2]
                } has now done "${thingName}" ${
                  change.to - change.from
                } more time${
                  change.to - change.from == 1 ? "" : "s"
                } for a total of ${change.to} time${
                  change.to == 1 ? "" : "s"
                }`,
                func.bind(this, thingName)
              )
            }
            if (/^\d+\.desc$/.test(change.path))
              sendnoti(
                `changed description of task: "${thingName}"`,
                func.bind(this, thingName)
              )
            if (/^\d+\.comments/.test(change.path))
              sendnoti(
                `edited comment on task: "${thingName}"`,
                func.bind(this, thingName)
              )
            if (/^\d+\.likes\.\d\.liked/.test(change.path)) {
              var user =
                data[id].likes[change.path.split(".")[2]].name
              sendnoti(
                `${user} ${
                  change.to == 1
                    ? "liked"
                    : change.to == -1
                    ? "disliked"
                    : "changed like status of"
                } task: "${thingName}"`,
                func.bind(this, thingName)
              )
            }
            break
          case "removed":
            if (/^\d+$/.test(change.path)) {
              sendnoti(
                `removed task: "${change.from.name}"`,
                func.bind(this, -1)
              )
            }
            if (/^\d+\.validPlayerCounts\.\d+$/.test(change.path))
              sendnoti(
                `"${thingName}" can not be done with ${change.from} players`,
                func.bind(this, thingName)
              )
            break
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
