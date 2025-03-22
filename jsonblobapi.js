class jsonblobapi {
  constructor(id) {
    this.url = `https://jsonblob.com/api/jsonBlob/${id}`
  }
  async load() {
    return (await globalrequest(this.url)).text
  }
  async save(data) {
    log(
      await globalrequest({
        url: this.url,
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        data,
      })
    )
    return
  }
}
