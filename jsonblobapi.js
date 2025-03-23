class jsonblobapi {
  constructor(id) {
    this.saving = []
    this.url = `https://jsonblob.com/api/jsonBlob/${id}`
  }
  async load() {
    if (this.saving.length) await this.__notSaving()
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
