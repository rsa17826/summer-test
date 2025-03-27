class jsonblobapi {
  constructor(id) {
    this.saving = 0
    this.url = `https://jsonblob.com/api/jsonBlob/${id}`
    this.resetTimer()
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
        var data = await API.load(true)
        if (data !== window.lastdata) {
          log("DATA CHANGED")
          window.lastdata = data
          tryLocalSave(lastdata, "prev")
          tryLocalSave(data, "new")
          loadAllData(JSON.parse(data))
          if (localStorage.sendnoti == "true") {
            sendnoti()
          }
        } else log("no data changed")
      }).bind(this),
      1 * 60 * 1000
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
