class protectedtextapi {
  constructor(site_id, passwd) {
    this.siteHash = CryptoJS.SHA512("/" + site_id).toString()
    this.pass = passwd
    this.passHash = CryptoJS.SHA512(passwd).toString()
    this.endpoint = "https://www.protectedtext.com".concat(
      "/",
      site_id
    )
    this.siteObj = {}
    this.dbversion = 0
    return this.loadTabs(true)
  }

  async loadTabs() {
    // try {
    this.siteObj = JSON.parse(
      (await globalrequest(this.endpoint.concat("?action=getJSON")))
        .text
    )
    this.dbversion = this.siteObj["currentDBVersion"]
    this.rawtext = CryptoJS.AES.decrypt(
      this.siteObj["eContent"],
      this.pass
    ).toString(CryptoJS.enc.Utf8)

    // Remove SHA2-512 HASH added after user's content
    this.rawtext = this.rawtext.substring(
      0,
      this.rawtext.length - 128
    )
    return this
    // } catch (e) {
    //   error(e)
    //   if (first) location.reload()
    //   else reload()
    // }
  }

  async save(textToSave) {
    const encript = String(textToSave + this.siteHash)
    var textEncrypted = await CryptoJS.AES.encrypt(
      encript,
      this.pass
    ).toString()

    const postdata = new URLSearchParams()
    postdata.append(
      "initHashContent",
      this.getWritePermissionProof(this.rawtext)
    )
    postdata.append(
      "currentHashContent",
      this.getWritePermissionProof(textToSave)
    )
    postdata.append("encryptedContent", textEncrypted)
    postdata.append("action", "save")

    var ret = undefined
    try {
      ret = (
        await globalrequest({
          method: "POST",
          url: this.endpoint,
          data: postdata,
          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded; charset=UTF-8",
            "User-Agent": `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.75 Safari/537.36`,
          },
        })
      ).text
    } catch (err) {
      throw Error(err.message)
    }

    this.rawtext = textToSave
    return ret["status"] == "success"
  }

  async deleteSite() {
    var inithashcontent = this.getWritePermissionProof(this.rawtext)
    const deleteAction = new URLSearchParams()
    deleteAction.append("initHashContent", inithashcontent)
    deleteAction.append("action", "delete")

    return (
      (await globalrequest(this.endpoint, deleteAction)).data[
        "status"
      ] == "success"
    )
  }

  async load() {
    try {
      await this.loadTabs()
      return this.rawtext
    } catch (err) {
      throw new Error(err.message)
    }
  }

  getWritePermissionProof(content) {
    return this.dbversion == 1
      ? CryptoJS.SHA512(content).toString()
      : CryptoJS.SHA512(content + this.passHash).toString() +
          this.dbversion
  }
}

