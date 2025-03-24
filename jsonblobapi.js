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
        log(data, window.lastdata)
        if (data !== window.lastdata) {
          window.lastdata = data
          loadAllData(JSON.parse(data))
          if (localStorage.sendnoti == "true") {
            sendnoti()
          }
        }
      }).bind(this),
      1 * 60 * 1000
    )
  }
  async load(dontsave) {
    if (this.saving) await this.__notSaving()
    this.resetTimer()
    this.saving++
    var x = (await globalrequest(this.url)).text
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
    debugger
    if (this.saving) await this.__notSaving()
    this.resetTimer()
    this.saving++
    log(
      await globalrequest({
        url: this.url,
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: data,
      })
    )
    // if (data == (await this.load(true))) {
    //   alert("saved")
    // } else {
    //   alert("not saved")
    // }
    this.saving--
    return
  }
}
