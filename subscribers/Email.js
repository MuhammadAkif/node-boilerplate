const EventEmitter = require("events").EventEmitter;

class Mailer extends EventEmitter {
    constructor() {
        super();
        this.on("sendEmail", this.sendEmail)
    }

    async sendEmail (email) {
       console.log("Sending email to", email)
    }

}

module.exports = new Mailer()