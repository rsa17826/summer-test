class jsonblobapi {
  constructor(id) {
    this.saving = []
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
        var data = await API.load()
        if (data !== window.lastdata) {
          loadAllData(JSON.parse(data))
          window.lastdata = data
          if (localStorage.sendnoti == "true") {
            sendnoti()
          }
        }
      }).bind(this),
      5 * 60 * 1000
    )
  }
  async load() {
    if (this.saving.length) await this.__notSaving()
    this.resetTimer()
    this.saving.push(1)
    var x = (await globalrequest(this.url)).text
    this.saving.pop()
    return x
  }
  async __notSaving() {
    if (!this.saving.length) {
      // log(this.saving)
      return
    }
    return new Promise((resolve, reject) => {
      var int = setInterval(
        (() => {
          // debugger
          // log(this.saving)
          if (!this.saving.length) {
            clearInterval(int)
            // setTimeout(resolve, 1000)
            resolve()
          }
        }).bind(this)
      )
    })
  }
  async save(data) {
    if (this.saving.length) await this.__notSaving()
    this.resetTimer()
    this.saving.push(1)
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
    this.saving.pop()
    return
  }
}
